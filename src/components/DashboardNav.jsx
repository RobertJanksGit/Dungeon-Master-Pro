import React from "react";

export default function DashboardNav({ activeSection, setActiveSection }) {
  const sections = ["Story", "Characters", "Campaigns", "Maps"];

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <nav className="flex flex-wrap gap-4 justify-center sm:justify-start">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section.toLowerCase())}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeSection === section.toLowerCase()
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-slate-300 hover:bg-gray-600"
            }`}
          >
            {section}
          </button>
        ))}
      </nav>
    </div>
  );
}
