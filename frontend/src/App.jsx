import { useState } from "react";
import LandingMain from "./components/pages/LandingMain.jsx";
import OnboardingMain from "./components/pages/OnboardingMain.jsx";
import "./styles/variables.css";

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(false);

  if (!onboardingDone) {
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
        <OnboardingMain onComplete={() => setOnboardingDone(true)} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        background: "#fff",
      }}
    >
      <LandingMain onPlantNewTree={() => {}} />
    </div>
  );
}
