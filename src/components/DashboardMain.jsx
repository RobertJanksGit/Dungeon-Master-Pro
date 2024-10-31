import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../authContext";
import axios from "axios";

const DashboardMain = () => {
  const { currentUser } = useAuth();
  const [input, setInput] = useState("");
  const [prompt, setPrompt] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // Track fetch state
  const userId = currentUser.uid;

  // Fetch existing conversation on mount
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPrompt(docSnap.data().prompt || []);
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchConversation();
  }, [userId]);

  // Save conversation whenever prompt is updated and component is loaded
  useEffect(() => {
    if (isLoaded && prompt.length > 0) {
      const saveConversation = async () => {
        try {
          const docRef = doc(db, "users", userId);
          await setDoc(docRef, { prompt }, { merge: true });
        } catch (error) {
          console.error("Error saving conversation:", error);
        }
      };
      saveConversation();
    }
  }, [isLoaded, prompt, userId]);

  // Handle initial API call once on component load
  useEffect(() => {
    if (isLoaded && prompt.length === 1) {
      const handleInitialPost = async () => {
        setIsFetching(true);
        try {
          const response = await axios.post(
            "https://dm-openai-fetch-af2d86bed568.herokuapp.com/api",
            JSON.parse(JSON.stringify(prompt))
          );

          const aiResponse = response.data.content;
          const assistantPrompt = { role: "assistant", content: aiResponse };

          setPrompt((prevPrompt) => [...prevPrompt, assistantPrompt]);
          await updateFirestorePrompt(assistantPrompt);
        } catch (error) {
          console.error("Error fetching initial response:", error);
        } finally {
          setIsFetching(false);
        }
      };
      handleInitialPost();
    }
  }, [isLoaded, userId]);

  const updateFirestorePrompt = async (newPrompt) => {
    try {
      const docRef = doc(db, "users", userId);
      await setDoc(docRef, { prompt: [...prompt, newPrompt] }, { merge: true });
    } catch (error) {
      console.error("Error updating Firestore with new prompt:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const userPrompt = { role: "user", content: input };
    setIsFetching(true);

    // Update the state immediately with user prompt
    setPrompt((prevPrompt) => [...prevPrompt, userPrompt]);
    setInput(""); // Clear input immediately

    try {
      // Send updated prompt including the user's input to the API
      const updatedPrompt = [...prompt, userPrompt];
      const response = await axios.post(
        "https://dm-openai-fetch-af2d86bed568.herokuapp.com/api",
        updatedPrompt
      );

      const aiResponse = response.data.content;
      const assistantPrompt = { role: "assistant", content: aiResponse };

      // Update state with assistant's response
      setPrompt((prevPrompt) => [...prevPrompt, assistantPrompt]);

      // Now update Firestore with the new assistant prompt
      await updateFirestorePrompt(assistantPrompt);
    } catch (error) {
      console.error("Error sending user prompt to API:", error);
    } finally {
      setIsFetching(false); // Turn off loading indicator
    }
  };

  return (
    <div>
      <form className="p-[20px]" onSubmit={handleSend}>
        <div className="bg-white w-[100%] h-[400px] text-black overflow-y-auto">
          {isFetching ? (
            <p>Loading...</p> // Show "Loading..." while fetching
          ) : prompt.length > 0 ? (
            <p
              className={`${
                prompt[prompt.length - 1].role === "user"
                  ? "text-blue-700"
                  : "text-gray-800"
              }`}
            >
              {prompt[prompt.length - 1].content}
            </p>
          ) : (
            <p>No conversation history available.</p>
          )}
        </div>
        <div className="flex items-center mt-4 space-x-2">
          <input
            className="w-full text-black px-4 py-2 rounded h-10"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Respond"
            disabled={isFetching} // Disable input while fetching
          />
          <button
            type="submit"
            className="h-10 px-4 bg-blue-600 text-white rounded"
            disabled={isFetching} // Disable button while fetching
          >
            {isFetching ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardMain;
