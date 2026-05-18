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

function AppHome({ view, setView, activeTreeId, setActiveTreeId, recents, searchQuery, setSearchQuery, searchOpen, setSearchOpen, openTree, goHome, activeTree }) {
  return (
    <>
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
    </>
  );
}

export default function App() {
  const [onboardingVisible, setOnboardingVisible] = useState(true);
  const [homeRevealed, setHomeRevealed] = useState(false);
  const [homeEntered, setHomeEntered] = useState(false);
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

  const handleOnboardingExitStart = useCallback(() => {
    setHomeRevealed(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setHomeEntered(true));
    });
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingVisible(false);
  }, []);

  return (
    <div className="app-transition-root">
      {homeRevealed ? (
        <div
          className={`app-home-shell${homeEntered ? " app-home-shell--enter" : ""}`}
          aria-hidden={onboardingVisible}
        >
          <AppHome
            view={view}
            setView={setView}
            activeTreeId={activeTreeId}
            setActiveTreeId={setActiveTreeId}
            recents={recents}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            openTree={openTree}
            goHome={goHome}
            activeTree={activeTree}
          />
        </div>
      ) : null}

      {onboardingVisible ? (
        <div
          className={`app-onboarding-overlay${homeRevealed ? " app-onboarding-overlay--exit" : ""}`}
        >
          <OnboardingMain
            onExitStart={handleOnboardingExitStart}
            onComplete={handleOnboardingComplete}
          />
        </div>
      ) : null}
    </div>
  );
}
