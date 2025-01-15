import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../authContext";
import { COLLECTIONS } from "../firebaseConfig";
import Header from "./Header";

const CharacterSheet = () => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState({ type: "", content: "" });
  const [character, setCharacter] = useState({
    name: "",
    class: "",
    level: 1,
    skills: [],
    background: "",
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
  });

  const [newSkill, setNewSkill] = useState("");

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
        userId: currentUser.uid,
        createdAt: new Date().toISOString(), // Convert to string format
        updatedAt: new Date().toISOString(), // Convert to string format
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

      console.log("Character created with ID:", docRef.id);

      // Show success message
      setMessage({
        type: "success",
        content: "Character created successfully!",
      });

      // Reset form
      setCharacter({
        name: "",
        class: "",
        level: 1,
        skills: [],
        background: "",
        stats: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
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

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-slate-200 mb-6">
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
                  Class:
                </label>
                <input
                  type="text"
                  value={character.class}
                  onChange={(e) =>
                    setCharacter({ ...character, class: e.target.value })
                  }
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                  required
                />
              </div>
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

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Character
          </button>
        </form>
      </div>
    </>
  );
};

export default CharacterSheet;
