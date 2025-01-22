import { useState, useEffect } from "react";
import Stories from "./Stories";
import { useAuth } from "../authContext";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { COLLECTIONS } from "../firebaseConfig";

export default function Story() {
  const { currentUser } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

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
      }
    };

    fetchData();
  }, [currentUser]);

  const selectStory = async (story) => {
    try {
      // Find the campaign and characters
      const campaign = campaigns.find((c) => c.id === story.campaignId);
      const storyCharacters = characters.filter((c) =>
        story.characterIds.includes(c.id)
      );

      // Check if story already has a prompt in Firestore
      const storyRef = doc(db, COLLECTIONS.STORIES, story.id);
      const storyDoc = await getDoc(storyRef);
      const existingPrompt = storyDoc.data()?.prompt;

      if (existingPrompt) {
        // If prompt exists, use it
        setChatHistory(existingPrompt);
      } else {
        // Create detailed character descriptions
        const characterDetails = storyCharacters
          .map((char) => {
            const statDescriptions = Object.entries(char.stats)
              .map(([stat, value]) => `${stat}: ${value}`)
              .join(", ");

            const skillsList =
              char.skills.length > 0
                ? `Skills: ${char.skills.join(", ")}`
                : "No special skills";

            const inventoryList =
              char.inventory?.length > 0
                ? `Inventory: ${char.inventory.join(", ")}`
                : "No items in inventory";

            return `
Character: ${char.name}
Race: ${char.race}${char.subrace ? ` (${char.subrace})` : ""}
Class: ${char.class}
Level: ${char.level}
Stats: ${statDescriptions}
${skillsList}
${inventoryList}
Background: ${char.background || "No background provided"}`;
          })
          .join("\n\n");

        // Create location descriptions
        const locationDetails =
          campaign?.locations
            ?.map(
              (loc) => `Location: ${loc.name}
Type: ${loc.type}
Description: ${loc.description}`
            )
            .join("\n\n") || "No specific locations defined";

        // Create NPC descriptions
        const npcDetails =
          campaign?.npcs
            ?.map(
              (npc) => `NPC: ${npc.name}
Role: ${npc.role}
Description: ${npc.description}`
            )
            .join("\n\n") || "No NPCs defined";

        // Create the base system prompt
        const basePrompt = `You are the Dungeon Master in a game of Dungeons & Dragons. Your role is to craft an engaging fantasy story, narrate vivid descriptions, and respond to the player's actions, questions, and decisions in real time. Start by introducing the setting, characters, and current scenario, and wait for player input before continuing. As the story progresses, be creative, use dramatic flair, and always keep the player's experience at the center. Make sure to keep the atmosphere mysterious and adventurous. Adjust the storyline or challenges based on player responses, and prompt the player with options when needed. You're allowed to generate magical events, mythical creatures, and describe the environment with sensory details like sounds, sights, and smells. Encourage the player to explore, interact with characters, and make decisions that will shape their journey. Remember, you are the guide on an epic quest.

CAMPAIGN INFORMATION:
Campaign: ${campaign?.name || "Unnamed Campaign"}
Setting: ${campaign?.setting || "Generic Fantasy Setting"}
World Description: ${
          campaign?.worldDescription || "No world description provided"
        }

CHARACTERS:
${characterDetails}

LOCATIONS:
${locationDetails}

NPCs:
${npcDetails}

STORY CONTEXT:
Title: ${story.title}
Status: ${story.status}
Additional Context: ${story.aiContext || "No additional context provided"}

Please begin by introducing the current scenario and setting the scene for our adventure.`;

        // Initialize new prompt in Firestore
        const initialPrompt = [
          {
            role: "system",
            content: basePrompt,
          },
          {
            role: "assistant",
            content:
              "I'm ready to begin our adventure. Let me set the scene based on your campaign's world and characters...",
          },
        ];

        await updateDoc(storyRef, {
          prompt: initialPrompt,
          updatedAt: new Date().toISOString(),
        });

        // Initialize chat history
        setChatHistory(initialPrompt);
      }

      setSelectedStory(story);
    } catch (error) {
      console.error("Error setting up story context:", error);
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim() || !selectedStory) return;

    const newMessage = {
      role: "user",
      content: message,
    };

    setChatHistory((prev) => [...prev, newMessage]);

    try {
      // Fetch the current prompt from Firestore
      const storyRef = doc(db, COLLECTIONS.STORIES, selectedStory.id);
      const storyDoc = await getDoc(storyRef);
      const currentPrompt = storyDoc.data()?.prompt || [];

      console.log("Current prompt from Firestore:", currentPrompt);
      console.log("New message:", newMessage);

      // Normalize message format
      const normalizeMessage = (msg) => ({
        role: msg.role,
        content: msg.content,
      });

      const messages = Array.isArray(currentPrompt)
        ? [...currentPrompt.map(normalizeMessage), normalizeMessage(newMessage)]
        : [normalizeMessage(newMessage)];

      console.log("Messages to send:", messages);

      const AI_ENDPOINT =
        (window.env?.REACT_APP_AI_ENDPOINT ||
          "https://dm-openai-fetch-af2d86bed568.herokuapp.com") + "/api";

      console.log("Sending request to:", AI_ENDPOINT);
      console.log("Request body:", JSON.stringify(messages));

      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(messages),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Failed to get AI response: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log("AI Response data:", data);

      let aiResponse;
      if (data.role && data.content) {
        // Handle direct response format
        aiResponse = {
          role: data.role.toLowerCase(), // Normalize role to lowercase
          content: data.content,
        };
      } else if (!data.message && data.choices?.[0]?.message?.content) {
        // Handle OpenAI format
        aiResponse = {
          role: "assistant",
          content: data.choices[0].message.content,
        };
      } else if (data.message) {
        // Handle custom format
        aiResponse = {
          role: "assistant",
          content: data.message,
        };
      } else {
        throw new Error("Unexpected response format from AI service");
      }

      // Update chat history state
      setChatHistory((prev) => [...prev, aiResponse]);

      // Update Firestore with new messages
      await updateDoc(storyRef, {
        prompt: [...currentPrompt, newMessage, aiResponse],
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
      };
      setChatHistory((prev) => [...prev, errorMessage]);

      // Save error message to Firestore as well
      const conversationRef = doc(db, COLLECTIONS.STORIES, selectedStory.id);
      const storyDoc = await getDoc(conversationRef);
      const currentPrompt = storyDoc.data()?.prompt || [];

      await updateDoc(conversationRef, {
        prompt: [...currentPrompt, newMessage, errorMessage],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-4">
      <Stories
        onSelectStory={selectStory}
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        sendMessage={sendMessage}
      />
    </div>
  );
}
