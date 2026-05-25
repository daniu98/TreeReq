import { useCallback, useEffect, useMemo, useState } from "react";
import LandingMain from "./components/pages/LandingMain.jsx";
import OnboardingMain from "./components/pages/OnboardingMain.jsx";
import TreeViewMain from "./components/pages/TreeViewMain.jsx";
import AppSidebar from "./components/layout/AppSidebar.jsx";
import TreeSetupMain from "./pages/TreeSetupMain.jsx";
import {
  MOCK_ALL_TREES,
  MOCK_FORESTS,
  bumpRecentIds,
  getTreeById,
  loadRecentIds,
  resolveRecentTrees,
} from "./data/mockTrees.js";
import { getTreeDocumentTitle, parseLocation, pathForView } from "./lib/routes.js";
import "./styles/variables.css";

function AppHome({
  route,
  navigate,
  recents,
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  openTree,
  goHome,
  activeTree,
}) {
  const activeTreeId = route.view === "tree" ? route.treeId : null;

  return (
    <>
      <AppSidebar
        forests={MOCK_FORESTS}
        allTrees={MOCK_ALL_TREES}
        recents={recents}
        activeTreeId={activeTreeId}
        searchQuery={searchQuery}
        searchOpen={searchOpen}
        onSearchQueryChange={setSearchQuery}
        onSearchOpenChange={setSearchOpen}
        onOpenTree={openTree}
        onNewTree={() => navigate("setup")}
      />

      {route.view === "landing" ? (
        <LandingMain onPlantNewTree={() => navigate("setup")} onOpenTree={openTree} />
      ) : null}

      {route.view === "tree" ? <TreeViewMain tree={activeTree} onBack={goHome} /> : null}

      {route.view === "setup" ? <TreeSetupMain onBack={goHome} /> : null}
    </>
  );
}

export default function App() {
  const [onboardingVisible, setOnboardingVisible] = useState(true);
  const [homeRevealed, setHomeRevealed] = useState(false);
  const [homeEntered, setHomeEntered] = useState(false);
  const [route, setRoute] = useState(() => parseLocation());
  const [recentIds, setRecentIds] = useState(loadRecentIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const recents = useMemo(() => resolveRecentTrees(recentIds), [recentIds]);
  const activeTreeId = route.view === "tree" ? route.treeId : null;
  const activeTree = activeTreeId ? getTreeById(activeTreeId) : null;

  const navigate = useCallback((view, treeId = null) => {
    const path = pathForView(view, treeId);
    window.history.pushState({ view, treeId }, "", path);
    setRoute({ view, treeId: view === "tree" ? treeId : null });
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(parseLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (onboardingVisible) {
      document.title = "TreeReq";
      return;
    }
    if (route.view === "tree" && activeTree) {
      document.title = getTreeDocumentTitle(activeTree);
      return;
    }
    if (route.view === "setup") {
      document.title = "TreeReq — New tree";
      return;
    }
    document.title = "TreeReq — Home";
  }, [onboardingVisible, route.view, activeTree]);

  const openTree = useCallback(
    (treeId) => {
      if (!getTreeById(treeId)) return;
      navigate("tree", treeId);
      setRecentIds((prev) => bumpRecentIds(prev, treeId));
    },
    [navigate]
  );

  const goHome = useCallback(() => {
    navigate("landing");
  }, [navigate]);

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
            route={route}
            navigate={navigate}
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
