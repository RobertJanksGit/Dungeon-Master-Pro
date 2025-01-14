import { useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";

const DashboardMain = () => {
  const [input, setInput] = useState("");
  const [prompt, setPrompt] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: "user", content: input };
    setPrompt([...prompt, userMessage]);
    setInput("");
    setIsFetching(true);

    try {
      // TODO: Replace with actual API call
      const response = await mockAIResponse(input);
      setPrompt((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setPrompt((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsFetching(false);
    }
  };

  // Temporary mock function - replace with actual API call
  const mockAIResponse = async (message) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `This is a mock response to: "${message}"`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-900 rounded-lg shadow-lg p-4">
        <div className="bg-gray-800 h-[500px] rounded-lg mb-4 p-4 overflow-y-auto">
          {prompt.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                <MarkdownPreview
                  source={message.content}
                  style={{
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                />
              </div>
            </div>
          ))}
          {isFetching && (
            <div className="text-left">
              <div className="inline-block p-3 rounded-lg bg-gray-700 text-gray-200">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isFetching}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isFetching}
          >
            {isFetching ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardMain;
