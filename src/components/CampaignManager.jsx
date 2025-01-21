import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../authContext";
import { COLLECTIONS } from "../firebaseConfig";

const CampaignManager = () => {
  const { currentUser } = useAuth();
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
    type: "city", // city, forest, town, etc.
  });

  const [newNPC, setNewNPC] = useState({
    name: "",
    role: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const campaignData = {
        ...campaign,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, COLLECTIONS.CAMPAIGNS), campaignData);
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
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
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

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Campaign
        </button>
      </form>
    </div>
  );
};

export default CampaignManager;
