import React from "react";

export default function Story() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Story Assistant</h2>
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="min-h-[400px] space-y-4">
          {/* Chat messages will be displayed here */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-slate-300">
              Welcome to the Story Assistant! This is where you can interact
              with the AI to help develop your campaign's story and narrative.
            </p>
          </div>
        </div>

        {/* Chat input will be implemented here */}
        <div className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
