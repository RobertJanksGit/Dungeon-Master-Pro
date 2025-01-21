import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DashboardNav from "../components/DashboardNav";
import CharacterSheet from "../components/CharacterSheet";
import CampaignManager from "../components/CampaignManager";
import Maps from "../components/Maps";
import Story from "../components/Story";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("story");

  const renderSection = () => {
    switch (activeSection) {
      case "story":
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <Story />
          </div>
        );
      case "characters":
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <CharacterSheet />
          </div>
        );
      case "campaigns":
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <CampaignManager />
          </div>
        );
      case "maps":
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <Maps />
          </div>
        );
      default:
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <Story />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <DashboardNav
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}
