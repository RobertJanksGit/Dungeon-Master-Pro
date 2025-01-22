import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
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

const Stories = ({
  onSelectStory,
  chatHistory,
  setChatHistory,
  sendMessage,
}) => {
  const { currentUser } = useAuth();
  const [stories, setStories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [editingStory, setEditingStory] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [aiMessage, setAiMessage] = useState("");
  const [story, setStory] = useState({
    title: "",
    campaignId: "",
    characterIds: [],
    content: "",
    status: "draft", // draft, in-progress, completed
    aiContext: "", // Context for the AI to understand the story setting
  });
  const messagesEndRef = useRef(null);

  // Fetch stories, campaigns, and characters on component mount
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Create collection references with proper paths
        const storiesRef = collection(db, COLLECTIONS.STORIES);
        const campaignsRef = collection(db, COLLECTIONS.CAMPAIGNS);
        const charactersRef = collection(db, COLLECTIONS.CHARACTERS);

        // Create queries to filter by userId
        const storiesQuery = query(
          storiesRef,
          where("userId", "==", currentUser.uid)
        );
        const campaignsQuery = query(
          campaignsRef,
          where("userId", "==", currentUser.uid)
        );
        const charactersQuery = query(
          charactersRef,
          where("userId", "==", currentUser.uid)
        );

        // Fetch data in parallel
        const [storiesSnap, campaignsSnap, charactersSnap] = await Promise.all([
          getDocs(storiesQuery),
          getDocs(campaignsQuery),
          getDocs(charactersQuery),
        ]);

        // Process the results
        setStories(
          storiesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setCampaigns(
          campaignsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setCharacters(
          charactersSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({
          type: "error",
          content:
            "Failed to load data. Please check your connection and try again.",
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
        content: "You must be logged in to create a story.",
      });
      return;
    }

    try {
      const storyData = {
        ...story,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingStory) {
        // Update existing story
        await updateDoc(doc(db, COLLECTIONS.STORIES, editingStory), {
          ...storyData,
          updatedAt: new Date().toISOString(),
        });
        setStories((prevStories) =>
          prevStories.map((s) =>
            s.id === editingStory ? { ...storyData, id: editingStory } : s
          )
        );
        setMessage({
          type: "success",
          content: "Story updated successfully!",
        });
      } else {
        // Create new story
        const docRef = await addDoc(
          collection(db, COLLECTIONS.STORIES),
          storyData
        );
        setStories((prevStories) => [
          ...prevStories,
          { ...storyData, id: docRef.id },
        ]);
        setMessage({
          type: "success",
          content: "Story created successfully!",
        });
      }

      // Reset form
      setStory({
        title: "",
        campaignId: "",
        characterIds: [],
        content: "",
        status: "draft",
        aiContext: "",
      });
      setEditingStory(null);
    } catch (error) {
      console.error("Error saving story:", error);
      setMessage({
        type: "error",
        content: "Failed to save story",
      });
    }
  };

  const deleteStory = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.STORIES, storyId));
      setStories((prevStories) => prevStories.filter((s) => s.id !== storyId));
      setMessage({
        type: "success",
        content: "Story deleted successfully",
      });
      if (selectedStory?.id === storyId) {
        setSelectedStory(null);
        setChatHistory([]);
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      setMessage({
        type: "error",
        content: "Failed to delete story",
      });
    }
  };

  const editStory = (story) => {
    setStory(story);
    setEditingStory(story.id);
  };

  const selectStory = async (story) => {
    setSelectedStory(story);
    if (onSelectStory) {
      onSelectStory(story);
    }
  };

  const handleSendMessage = () => {
    if (!aiMessage.trim() || !selectedStory) return;
    sendMessage(aiMessage);
    setAiMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {selectedStory ? (
        // AI Chat Interface when a story is selected
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-slate-200">
              {selectedStory.title}
            </h2>
            <button
              onClick={() => {
                setSelectedStory(null);
                setAiMessage("");
              }}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors"
            >
              Back to Stories
            </button>
          </div>

          {/* Chat Messages */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="bg-slate-700 rounded-lg p-4 mb-4 h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {chatHistory
                  .filter((msg) => msg.role !== "system")
                  .map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 prose prose-invert ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-600 text-slate-200"
                        }`}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Story List and Creation Form when no story is selected
        <div>
          <h2 className="text-3xl font-bold text-slate-200 mb-6">
            Story Manager
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stories List */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-2xl font-bold text-slate-200 mb-4">
                Your Stories
              </h3>
              {loading ? (
                <div className="text-slate-200">Loading stories...</div>
              ) : stories.length > 0 ? (
                <div className="grid gap-4">
                  {stories.map((s) => {
                    const campaign = campaigns.find(
                      (c) => c.id === s.campaignId
                    );
                    return (
                      <div
                        key={s.id}
                        className="bg-slate-700 rounded-lg p-4 shadow-lg cursor-pointer hover:bg-slate-600 transition-colors"
                        onClick={() => selectStory(s)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-semibold text-slate-200">
                              {s.title}
                            </h4>
                            <p className="text-slate-400 mt-1">
                              Campaign: {campaign?.name || "Unknown"}
                            </p>
                            <div className="mt-2">
                              <span className="inline-block px-2 py-1 text-sm rounded bg-slate-600 text-slate-300">
                                {s.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                editStory(s);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-full transition-colors"
                              title="Edit Story"
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
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteStory(s.id);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full transition-colors"
                              title="Delete Story"
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
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-400">
                  No stories found. Create one below!
                </div>
              )}
            </div>

            {/* Create/Edit Story Form */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-slate-200 mb-6">
                {editingStory ? "Edit Story" : "Create New Story"}
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
                {/* Basic Story Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Story Title:
                  </label>
                  <input
                    type="text"
                    value={story.title}
                    onChange={(e) =>
                      setStory({ ...story, title: e.target.value })
                    }
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                    required
                  />
                </div>

                {/* Campaign Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Campaign:
                  </label>
                  <select
                    value={story.campaignId || ""}
                    onChange={(e) => {
                      setStory({
                        ...story,
                        campaignId: e.target.value,
                        characterIds: [], // Reset character selection when campaign changes
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 text-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a campaign</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name} - {campaign.description}
                      </option>
                    ))}
                  </select>
                  {campaigns.length === 0 && (
                    <p className="mt-1 text-sm text-slate-400">
                      No campaigns found. Create a campaign first.
                    </p>
                  )}
                </div>

                {/* Character Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Characters:
                  </label>
                  {story.campaignId ? (
                    <div className="space-y-2">
                      {characters
                        .filter((char) => {
                          const campaign = campaigns.find(
                            (c) => c.id === story.campaignId
                          );
                          return campaign?.characters?.includes(char.id);
                        })
                        .map((char) => (
                          <label
                            key={char.id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={story.characterIds.includes(char.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStory({
                                    ...story,
                                    characterIds: [
                                      ...story.characterIds,
                                      char.id,
                                    ],
                                  });
                                } else {
                                  setStory({
                                    ...story,
                                    characterIds: story.characterIds.filter(
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
                        ))}
                      {characters.filter((char) => {
                        const campaign = campaigns.find(
                          (c) => c.id === story.campaignId
                        );
                        return campaign?.characters?.includes(char.id);
                      }).length === 0 && (
                        <p className="text-slate-400">
                          No characters found in this campaign. Add characters
                          to the campaign first.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400">
                      Select a campaign to see available characters
                    </p>
                  )}
                </div>

                {/* AI Context */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Additional Context (optional):
                  </label>
                  <textarea
                    value={story.aiContext}
                    onChange={(e) =>
                      setStory({ ...story, aiContext: e.target.value })
                    }
                    rows="4"
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                    placeholder="Add any additional context that will help the AI understand your story better..."
                  />
                </div>

                {/* Story Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Status:
                  </label>
                  <select
                    value={story.status}
                    onChange={(e) =>
                      setStory({ ...story, status: e.target.value })
                    }
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                  >
                    <option value="draft">Draft</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingStory ? "Update Story" : "Create Story"}
                </button>

                {editingStory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStory(null);
                      setStory({
                        title: "",
                        campaignId: "",
                        characterIds: [],
                        content: "",
                        status: "draft",
                        aiContext: "",
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
        </div>
      )}
    </div>
  );
};

Stories.propTypes = {
  onSelectStory: PropTypes.func,
  chatHistory: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    })
  ),
  setChatHistory: PropTypes.func,
  sendMessage: PropTypes.func,
};

Stories.defaultProps = {
  onSelectStory: null,
  chatHistory: [],
  setChatHistory: () => {},
  sendMessage: () => {},
};

export default Stories;
