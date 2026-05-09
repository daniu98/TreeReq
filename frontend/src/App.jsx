import { useState } from "react";
import AppSidebar from "./components/layout/AppSidebar.jsx";
import LandingMain from "./components/pages/LandingMain.jsx";
import ProfileMain from "./pages/ProfileMain.jsx";
import TreeSetupMain from "./pages/TreeSetupMain.jsx";

export default function App() {
  const [view, setView] = useState("landing");

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
        <LandingMain onPlantNewTree={() => setView("setup")} onOpenProfile={() => setView("profile")} />
      ) : view === "setup" ? (
        <TreeSetupMain onBack={() => setView("landing")} />
      ) : (
        <ProfileMain onBack={() => setView("landing")} />
      )}
    </div>
  );
}
