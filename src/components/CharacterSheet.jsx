import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../authContext";
import { COLLECTIONS } from "../firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebaseConfig";

const CharacterSheet = () => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState({ type: "", content: "" });
  const [characters, setCharacters] = useState([]);
  const [expandedCharacterId, setExpandedCharacterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState({
    name: "",
    race: "",
    subrace: "",
    class: "",
    level: 1,
    skills: [],
    inventory: [],
    background: "",
    imageUrl: "",
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    isCustomRace: false,
    isCustomClass: false,
  });

  const [newSkill, setNewSkill] = useState("");

  const races = {
    Human: [],
    Elf: ["High Elf", "Wood Elf", "Drow"],
    Dwarf: ["Hill Dwarf", "Mountain Dwarf"],
    Halfling: ["Lightfoot", "Stout"],
    "Half-Orc": [],
    "Half-Elf": [],
    Gnome: ["Forest", "Rock"],
    Dragonborn: [],
    Tiefling: [],
  };

  const classes = [
    "Barbarian",
    "Bard",
    "Cleric",
    "Druid",
    "Fighter",
    "Monk",
    "Paladin",
    "Ranger",
    "Rogue",
    "Sorcerer",
    "Warlock",
    "Wizard",
  ];

  // Fetch characters on component mount
  useEffect(() => {
    const fetchCharacters = async () => {
      if (!currentUser?.uid) return;

      try {
        // Fetch characters
        const charactersQuery = query(
          collection(db, COLLECTIONS.CHARACTERS),
          where("userId", "==", currentUser.uid)
        );
        const charactersSnapshot = await getDocs(charactersQuery);

        // Map through characters and fetch their inventory
        const charactersList = await Promise.all(
          charactersSnapshot.docs.map(async (doc) => {
            const character = {
              id: doc.id,
              ...doc.data(),
            };

            // Fetch inventory for this character
            const inventoryQuery = query(
              collection(db, COLLECTIONS.INVENTORY),
              where("characterId", "==", doc.id)
            );
            const inventorySnapshot = await getDocs(inventoryQuery);

            // Add inventory to character object
            if (!inventorySnapshot.empty) {
              const inventoryDoc = inventorySnapshot.docs[0];
              character.inventory = inventoryDoc.data().inventory || [];
            } else {
              character.inventory = [];
            }

            return character;
          })
        );

        setCharacters(charactersList);
      } catch (error) {
        console.error("Error fetching characters:", error);
        setMessage({
          type: "error",
          content: "Failed to load characters",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    if (!currentUser?.uid) {
      setMessage({
        type: "error",
        content: "You must be logged in to create a character.",
      });
      return;
    }

    try {
      console.log("Current user:", currentUser.uid);

      // Prepare the character data
      const characterData = {
        ...character,
        inventory: [],
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(
        "Attempting to save character:",
        JSON.stringify(characterData)
      );

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, COLLECTIONS.CHARACTERS),
        characterData
      );

      // Create inventory collection for this character
      await addDoc(collection(db, COLLECTIONS.INVENTORY), {
        characterId: docRef.id,
        userId: currentUser.uid,
        inventory: [],
        createdAt: new Date().toISOString(),
      });

      console.log("Character created with ID:", docRef.id);

      // Update local state with the new character
      const newCharacter = {
        id: docRef.id,
        ...characterData,
      };
      setCharacters((prevCharacters) => [...prevCharacters, newCharacter]);

      // Show success message
      setMessage({
        type: "success",
        content: "Character created successfully!",
      });

      // Reset form
      setCharacter({
        name: "",
        race: "",
        subrace: "",
        class: "",
        level: 1,
        skills: [],
        inventory: [],
        background: "",
        imageUrl: "",
        stats: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        isCustomRace: false,
        isCustomClass: false,
      });
      setNewSkill("");
    } catch (error) {
      console.error("Error creating character:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });

      // More detailed error message
      let errorMessage = "Failed to create character: ";
      if (error.code === "permission-denied") {
        errorMessage += "You don't have permission to create characters.";
      } else {
        errorMessage += error.message;
      }

      setMessage({
        type: "error",
        content: errorMessage,
      });
    }
  };

  const handleStatChange = (stat, value) => {
    setCharacter({
      ...character,
      stats: {
        ...character.stats,
        [stat]: parseInt(value) || 0,
      },
    });
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim()) {
      setCharacter({
        ...character,
        skills: [...character.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setCharacter({
      ...character,
      skills: character.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const toggleCharacterExpansion = (characterId) => {
    setExpandedCharacterId(
      expandedCharacterId === characterId ? null : characterId
    );
  };

  const deleteCharacter = async (characterId) => {
    if (!window.confirm("Are you sure you want to delete this character?")) {
      return;
    }

    try {
      // Find the character to get its imageUrl before deletion
      const characterToDelete = characters.find(
        (char) => char.id === characterId
      );

      // Delete the character's image from Storage if it exists
      if (characterToDelete?.imageUrl) {
        try {
          // Get the filename from the URL
          const urlParts = characterToDelete.imageUrl.split("/");
          const filename = urlParts[urlParts.length - 1];

          // Create a reference to the image using the correct path
          const imageRef = ref(
            storage,
            `character-avatars/${currentUser.uid}/${filename}`
          );
          await deleteObject(imageRef);
          console.log("Character avatar deleted successfully");
        } catch (error) {
          console.error("Error deleting character avatar:", error);
          // Continue with character deletion even if image deletion fails
        }
      }

      // Delete the character document
      await deleteDoc(doc(db, COLLECTIONS.CHARACTERS, characterId));

      // Query for inventory associated with this character
      const inventoryQuery = query(
        collection(db, COLLECTIONS.INVENTORY),
        where("characterId", "==", characterId)
      );

      const inventorySnapshot = await getDocs(inventoryQuery);

      // Delete all inventory documents for this character
      const deletePromises = inventorySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);

      // Update local state to remove the deleted character
      setCharacters(characters.filter((char) => char.id !== characterId));

      setMessage({
        type: "success",
        content: "Character and associated data deleted successfully",
      });

      // If the deleted character was expanded, collapse it
      if (expandedCharacterId === characterId) {
        setExpandedCharacterId(null);
      }
    } catch (error) {
      console.error("Error deleting character:", error);
      setMessage({
        type: "error",
        content: "Failed to delete character and associated data",
      });
    }
  };

  const handleImageUpload = async (e, characterId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!currentUser?.uid) {
      setMessage({
        type: "error",
        content: "You must be logged in to upload images",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        content: "Please upload an image file",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        content: "Image must be less than 5MB",
      });
      return;
    }

    try {
      setMessage({
        type: "info",
        content: "Uploading image...",
      });

      // Create a safe filename with proper extension
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const safeFileName = `${
        characterId || "new"
      }-${timestamp}-${randomString}.${fileExtension}`;

      // Create storage reference in character-avatars folder
      const storageRef = ref(
        storage,
        `character-avatars/${currentUser.uid}/${safeFileName}`
      );

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (characterId) {
        // Update existing character
        const characterRef = doc(db, COLLECTIONS.CHARACTERS, characterId);
        await updateDoc(characterRef, {
          imageUrl: downloadURL,
          updatedAt: new Date().toISOString(),
        });

        // Update local state
        setCharacters(
          characters.map((char) =>
            char.id === characterId ? { ...char, imageUrl: downloadURL } : char
          )
        );
      } else {
        // Update new character form
        setCharacter((prev) => ({
          ...prev,
          imageUrl: downloadURL,
        }));
      }

      setMessage({
        type: "success",
        content: "Character avatar uploaded successfully!",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({
        type: "error",
        content:
          error.code === "storage/unauthorized"
            ? "You must be logged in to upload images"
            : `Failed to upload avatar: ${error.message}`,
      });
    }
  };

  const handleRaceChange = (e) => {
    const selectedRace = e.target.value;
    if (selectedRace === "custom") {
      setCharacter({
        ...character,
        race: "",
        isCustomRace: true,
        subrace: "",
      });
    } else {
      setCharacter({
        ...character,
        race: selectedRace,
        isCustomRace: false,
        subrace: "",
      });
    }
  };

  const handleCustomRaceChange = (e) => {
    const value = e.target.value;
    setCharacter({
      ...character,
      race: value,
      isCustomRace: true,
    });
  };

  const handleClassChange = (e) => {
    const selectedClass = e.target.value;
    if (selectedClass === "custom") {
      setCharacter({
        ...character,
        class: "",
        isCustomClass: true,
      });
    } else {
      setCharacter({
        ...character,
        class: selectedClass,
        isCustomClass: false,
      });
    }
  };

  const handleCustomClassChange = (e) => {
    const value = e.target.value;
    setCharacter({
      ...character,
      class: value,
      isCustomClass: true,
    });
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        {/* Characters List */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-200 mb-6">
            Your Characters
          </h2>

          {loading ? (
            <div className="text-slate-200">Loading characters...</div>
          ) : characters.length > 0 ? (
            <div className="grid gap-4">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="bg-slate-800 rounded-lg overflow-hidden shadow-lg"
                >
                  <div className="p-4 cursor-pointer flex items-center space-x-4 hover:bg-slate-700 transition-colors">
                    {/* Character Avatar */}
                    <div className="w-16 h-16 rounded-full bg-slate-600 flex-shrink-0 relative group">
                      <img
                        src={char.imageUrl || "/default-avatar.png"}
                        alt={char.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, char.id)}
                        />
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </label>
                    </div>

                    {/* Basic Info */}
                    <div
                      className="flex-grow"
                      onClick={() => toggleCharacterExpansion(char.id)}
                    >
                      <h3 className="text-xl font-semibold text-slate-200">
                        {char.name}
                      </h3>
                      <p className="text-slate-400">
                        Level {char.level} {char.class}
                      </p>
                      <p className="text-slate-400">
                        {char.race}
                        {char.subrace ? ` (${char.subrace})` : ""}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => deleteCharacter(char.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full transition-colors"
                        title="Delete Character"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleCharacterExpansion(char.id)}
                        className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-600/20 rounded-full transition-colors"
                        title={
                          expandedCharacterId === char.id
                            ? "Collapse"
                            : "Expand"
                        }
                      >
                        <svg
                          className={`w-5 h-5 transform transition-transform ${
                            expandedCharacterId === char.id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedCharacterId === char.id && (
                    <div className="p-4 border-t border-slate-700">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {Object.entries(char.stats).map(([stat, value]) => (
                          <div key={stat} className="text-center">
                            <div className="text-slate-400 capitalize">
                              {stat}
                            </div>
                            <div className="text-slate-200 font-semibold">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <h4 className="text-slate-300 font-semibold mb-2 text-center">
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {char.skills.length > 0 ? (
                            char.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-slate-700 rounded-full text-slate-300"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <div className="text-slate-400">No skills</div>
                          )}
                        </div>
                      </div>

                      {/* Inventory Section */}
                      <div className="mb-4">
                        <h4 className="text-slate-300 font-semibold mb-2">
                          Inventory
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {char.inventory && char.inventory.length > 0 ? (
                            char.inventory.map((item, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-slate-700 rounded-full text-slate-300"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <div className="w-full text-center text-slate-400">
                              No items in inventory
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Background */}
                      {char.background && (
                        <div>
                          <h4 className="text-slate-300 font-semibold mb-2">
                            Background
                          </h4>
                          <p className="text-slate-400">{char.background}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400">
              No characters found. Create one below!
            </div>
          )}
        </div>

        {/* Create New Character Form */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-6">
            Create New Character
          </h2>

          {message.content && (
            <div
              className={`mb-4 p-4 rounded ${
                message.type === "success"
                  ? "bg-green-700 text-green-100"
                  : "bg-red-700 text-red-100"
              }`}
            >
              {message.content}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Name:
                  </label>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) =>
                      setCharacter({ ...character, name: e.target.value })
                    }
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Race:
                  </label>
                  <select
                    value={character.isCustomRace ? "custom" : character.race}
                    onChange={handleRaceChange}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                    required
                  >
                    <option value="">Select a race</option>
                    {Object.keys(races).map((race) => (
                      <option key={race} value={race}>
                        {race}
                      </option>
                    ))}
                    <option value="custom">Custom Race</option>
                  </select>
                </div>
                {character.isCustomRace && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Custom Race Name:
                    </label>
                    <input
                      type="text"
                      value={character.race}
                      onChange={handleCustomRaceChange}
                      placeholder="Enter custom race name"
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                      required
                    />
                  </div>
                )}
                {!character.isCustomRace &&
                  character.race &&
                  races[character.race]?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Subrace:
                      </label>
                      <select
                        value={character.subrace}
                        onChange={(e) =>
                          setCharacter({
                            ...character,
                            subrace: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                        required
                      >
                        <option value="">Select a subrace</option>
                        {races[character.race].map((subrace) => (
                          <option key={subrace} value={subrace}>
                            {subrace}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Class:
                  </label>
                  <select
                    value={character.isCustomClass ? "custom" : character.class}
                    onChange={handleClassChange}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                    <option value="custom">Custom Class</option>
                  </select>
                </div>
                {character.isCustomClass && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Custom Class Name:
                    </label>
                    <input
                      type="text"
                      value={character.class}
                      onChange={handleCustomClassChange}
                      placeholder="Enter custom class name"
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Level:
                  </label>
                  <input
                    type="number"
                    value={character.level}
                    onChange={(e) =>
                      setCharacter({
                        ...character,
                        level: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                    max="20"
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(character.stats).map(([stat, value]) => (
                  <div key={stat}>
                    <label className="block text-sm font-medium text-slate-300 mb-1 capitalize">
                      {stat}:
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleStatChange(stat, e.target.value)}
                      min="1"
                      max="20"
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Skills:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                    placeholder="Add a skill"
                  />
                  <button
                    onClick={addSkill}
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {character.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-slate-700 px-3 py-1 rounded-full"
                  >
                    <span className="text-slate-200">{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-slate-400 hover:text-slate-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Background:
              </label>
              <textarea
                value={character.background}
                onChange={(e) =>
                  setCharacter({ ...character, background: e.target.value })
                }
                rows="4"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Avatar:
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-slate-600 relative group">
                    <img
                      src={character.imageUrl || "/default-avatar.png"}
                      alt="Character avatar"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </label>
                  </div>
                  <div className="text-sm text-slate-400">
                    Click to upload character avatar
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Character
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CharacterSheet;
