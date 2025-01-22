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

const CampaignManager = () => {
  const { currentUser } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [campaign, setCampaign] = useState({
    name: "",
    description: "",
    setting: "",
    worldDescription: "",
    characters: [],
    locations: [],
    npcs: [],
  });

  const [newLocation, setNewLocation] = useState({
    name: "",
    description: "",
    type: "city",
  });

  const [newNPC, setNewNPC] = useState({
    name: "",
    role: "",
    description: "",
  });

  // Fetch campaigns and characters on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) return;

      try {
        // Fetch campaigns
        const campaignsQuery = query(
          collection(db, COLLECTIONS.CAMPAIGNS),
          where("userId", "==", currentUser.uid)
        );
        const campaignsSnapshot = await getDocs(campaignsQuery);
        const campaignsList = campaignsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCampaigns(campaignsList);

        // Fetch characters
        const charactersQuery = query(
          collection(db, COLLECTIONS.CHARACTERS),
          where("userId", "==", currentUser.uid)
        );
        const charactersSnapshot = await getDocs(charactersQuery);
        const charactersList = charactersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCharacters(charactersList);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({
          type: "error",
          content: "Failed to load data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    if (!currentUser?.uid) {
      setMessage({
        type: "error",
        content: "You must be logged in to create a campaign.",
      });
      return;
    }

    try {
      const campaignData = {
        ...campaign,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingCampaign) {
        // Update existing campaign
        await updateDoc(doc(db, COLLECTIONS.CAMPAIGNS, editingCampaign), {
          ...campaignData,
          updatedAt: new Date().toISOString(),
        });
        setCampaigns((prevCampaigns) =>
          prevCampaigns.map((c) =>
            c.id === editingCampaign
              ? { ...campaignData, id: editingCampaign }
              : c
          )
        );
        setMessage({
          type: "success",
          content: "Campaign updated successfully!",
        });
      } else {
        // Create new campaign
        const docRef = await addDoc(
          collection(db, COLLECTIONS.CAMPAIGNS),
          campaignData
        );
        setCampaigns((prevCampaigns) => [
          ...prevCampaigns,
          { ...campaignData, id: docRef.id },
        ]);
        setMessage({
          type: "success",
          content: "Campaign created successfully!",
        });
      }

      // Reset form
      setCampaign({
        name: "",
        description: "",
        setting: "",
        worldDescription: "",
        characters: [],
        locations: [],
        npcs: [],
      });
      setEditingCampaign(null);
    } catch (error) {
      console.error("Error saving campaign:", error);
      setMessage({
        type: "error",
        content: "Failed to save campaign: " + error.message,
      });
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.CAMPAIGNS, campaignId));
      setCampaigns((prevCampaigns) =>
        prevCampaigns.filter((c) => c.id !== campaignId)
      );
      setMessage({
        type: "success",
        content: "Campaign deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      setMessage({
        type: "error",
        content: "Failed to delete campaign",
      });
    }
  };

  const editCampaign = (campaign) => {
    setCampaign(campaign);
    setEditingCampaign(campaign.id);
  };

  const addLocation = async (e) => {
    e.preventDefault();
    if (newLocation.name && newLocation.description) {
      setCampaign({
        ...campaign,
        locations: [...campaign.locations, { ...newLocation }],
      });
      setNewLocation({ name: "", description: "", type: "city" });
    }
  };

  const addNPC = async (e) => {
    e.preventDefault();
    if (newNPC.name && newNPC.role) {
      setCampaign({
        ...campaign,
        npcs: [...campaign.npcs, { ...newNPC }],
      });
      setNewNPC({ name: "", role: "", description: "" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-slate-200 mb-6">
        Campaign Manager
      </h2>

      {/* Campaigns List */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-200 mb-4">
          Your Campaigns
        </h3>
        {loading ? (
          <div className="text-slate-200">Loading campaigns...</div>
        ) : campaigns.length > 0 ? (
          <div className="grid gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-slate-800 rounded-lg p-4 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-semibold text-slate-200">
                      {camp.name}
                    </h4>
                    <p className="text-slate-400 mt-1">{camp.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editCampaign(camp)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-full transition-colors"
                      title="Edit Campaign"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteCampaign(camp.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full transition-colors"
                      title="Delete Campaign"
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400">
            No campaigns found. Create one below!
          </div>
        )}
      </div>

      {/* Create/Edit Campaign Form */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-slate-200 mb-6">
          {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
        </h3>

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
          {/* Basic Campaign Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Campaign Name:
              </label>
              <input
                type="text"
                value={campaign.name}
                onChange={(e) =>
                  setCampaign({ ...campaign, name: e.target.value })
                }
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Description:
              </label>
              <textarea
                value={campaign.description}
                onChange={(e) =>
                  setCampaign({ ...campaign, description: e.target.value })
                }
                rows="3"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
              />
            </div>
          </div>

          {/* World Setting */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              World Setting:
            </label>
            <textarea
              value={campaign.worldDescription}
              onChange={(e) =>
                setCampaign({ ...campaign, worldDescription: e.target.value })
              }
              rows="4"
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
            />
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={newLocation.name}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, name: e.target.value })
                }
                placeholder="Location name"
                className="p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
              />
              <select
                value={newLocation.type}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, type: e.target.value })
                }
                className="p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
              >
                <option value="city">City</option>
                <option value="town">Town</option>
                <option value="forest">Forest</option>
                <option value="dungeon">Dungeon</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={addLocation}
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Location
              </button>
            </div>
            <textarea
              value={newLocation.description}
              onChange={(e) =>
                setNewLocation({ ...newLocation, description: e.target.value })
              }
              placeholder="Location description"
              rows="2"
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
            />
            {/* Display Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaign.locations.map((loc, index) => (
                <div key={index} className="p-4 bg-slate-700 rounded-md">
                  <h4 className="font-semibold text-slate-200">{loc.name}</h4>
                  <p className="text-sm text-slate-400 mb-2">{loc.type}</p>
                  <p className="text-slate-300">{loc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NPCs */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">NPCs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newNPC.name}
                onChange={(e) => setNewNPC({ ...newNPC, name: e.target.value })}
                placeholder="NPC name"
                className="p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
              />
              <input
                type="text"
                value={newNPC.role}
                onChange={(e) => setNewNPC({ ...newNPC, role: e.target.value })}
                placeholder="NPC role"
                className="p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
              />
            </div>
            <textarea
              value={newNPC.description}
              onChange={(e) =>
                setNewNPC({ ...newNPC, description: e.target.value })
              }
              placeholder="NPC description"
              rows="2"
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
            />
            <button
              onClick={addNPC}
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add NPC
            </button>
            {/* Display NPCs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaign.npcs.map((npc, index) => (
                <div key={index} className="p-4 bg-slate-700 rounded-md">
                  <h4 className="font-semibold text-slate-200">{npc.name}</h4>
                  <p className="text-sm text-slate-400 mb-2">{npc.role}</p>
                  <p className="text-slate-300">{npc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Character Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">Characters</h3>
            <div className="grid grid-cols-1 gap-2">
              {characters.length > 0 ? (
                characters.map((char) => (
                  <label key={char.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={campaign.characters.includes(char.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCampaign({
                            ...campaign,
                            characters: [...campaign.characters, char.id],
                          });
                        } else {
                          setCampaign({
                            ...campaign,
                            characters: campaign.characters.filter(
                              (id) => id !== char.id
                            ),
                          });
                        }
                      }}
                      className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-200">
                      {char.name} ({char.race} {char.class})
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-slate-400">
                  No characters found. Create characters first.
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editingCampaign ? "Update Campaign" : "Create Campaign"}
          </button>

          {editingCampaign && (
            <button
              type="button"
              onClick={() => {
                setEditingCampaign(null);
                setCampaign({
                  name: "",
                  description: "",
                  setting: "",
                  worldDescription: "",
                  characters: [],
                  locations: [],
                  npcs: [],
                });
              }}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 mt-2"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CampaignManager;
