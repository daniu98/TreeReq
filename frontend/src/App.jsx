import { useCallback, useMemo, useState } from "react";
import LandingMain from "./components/pages/LandingMain.jsx";
import OnboardingMain from "./components/pages/OnboardingMain.jsx";
import TreeViewMain from "./components/pages/TreeViewMain.jsx";
import AppSidebar from "./components/layout/AppSidebar.jsx";
import TreeSetupMain from "./pages/TreeSetupMain.jsx";
import {
  MOCK_FORESTS,
  bumpRecentIds,
  getTreeById,
  loadRecentIds,
  resolveRecentTrees,
} from "./data/mockTrees.js";
import "./styles/variables.css";

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [view, setView] = useState("landing");
  const [activeTreeId, setActiveTreeId] = useState(null);
  const [recentIds, setRecentIds] = useState(loadRecentIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const recents = useMemo(() => resolveRecentTrees(recentIds), [recentIds]);
  const activeTree = activeTreeId ? getTreeById(activeTreeId) : null;

  const openTree = useCallback((treeId) => {
    if (!getTreeById(treeId)) return;
    setActiveTreeId(treeId);
    setView("tree");
    setRecentIds((prev) => bumpRecentIds(prev, treeId));
  }, []);

  const goHome = useCallback(() => {
    setView("landing");
    setActiveTreeId(null);
  }, []);

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
      <AppSidebar
        forests={MOCK_FORESTS}
        recents={recents}
        activeTreeId={activeTreeId}
        searchQuery={searchQuery}
        searchOpen={searchOpen}
        onSearchQueryChange={setSearchQuery}
        onSearchOpenChange={setSearchOpen}
        onOpenTree={openTree}
        onNewTree={() => {
          setView("setup");
          setActiveTreeId(null);
        }}
      />

      {view === "landing" ? (
        <LandingMain onPlantNewTree={() => setView("setup")} onOpenTree={openTree} />
      ) : null}

      {view === "tree" ? <TreeViewMain tree={activeTree} onBack={goHome} /> : null}

      {view === "setup" ? <TreeSetupMain onBack={goHome} /> : null}
    </div>
  );
}
