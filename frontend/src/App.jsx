import { useState } from "react";
import AppSidebar from "./components/layout/AppSidebar.jsx";
import LandingMain from "./components/pages/LandingMain.jsx";
import ProfileMain from "./components/pages/ProfileMain.jsx";
import ProfileEdit from "./components/pages/ProfileEdit.jsx";
import TreeSetupMain from "./pages/TreeSetupMain.jsx";

export default function App() {
  const [view, setView] = useState("landing");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const leaveProfile = () => {
    setIsEditingProfile(false);
    setView("landing");
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <AppSidebar />
      {view === "landing" ? (
        <LandingMain
          onPlantNewTree={() => setView("setup")}
          onOpenProfile={() => {
            setIsEditingProfile(false);
            setView("profile");
          }}
        />
      ) : view === "setup" ? (
        <TreeSetupMain onBack={() => setView("landing")} />
      ) : isEditingProfile ? (
        <ProfileEdit
          onSave={() => setIsEditingProfile(false)}
          onDiscard={() => setIsEditingProfile(false)}
        />
      ) : (
        <ProfileMain
          onBack={leaveProfile}
          onEdit={() => setIsEditingProfile(true)}
        />
      )}
    </div>
  );
}
