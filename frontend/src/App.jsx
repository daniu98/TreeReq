import { useCallback, useEffect, useMemo, useState } from "react";
import MajorTreePage from "./components/pages/MajorTreePage.jsx";
import LandingMain from "./components/pages/LandingMain.jsx";
import OnboardingMain from "./components/pages/OnboardingMain.jsx";
import ProfileMain from "./components/pages/ProfileMain.jsx";
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
import {
  loadStoredProfile,
  mapOnboardingToProfile,
  saveStoredProfile,
} from "./data/userProfile.js";
import { getTreeDocumentTitle, parseLocation, pathForView } from "./lib/routes.js";
import "./styles/variables.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const majorModules = import.meta.glob('/src/components/pages/majors/*.jsx', { eager: true });
const MAJORS = Object.keys(majorModules).reduce((acc, filePath) => {
  const fileName = filePath.match(/\/majors\/(.+)\.jsx$/)[1].toLowerCase();
  acc[fileName] = majorModules[filePath].default;
  return acc;
}, {});

function AppHome({
  route,
  navigate,
  recents,
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  openTree,
  openMajor,
  goHome,
  activeTree,
  showProfile,
  userProfile,
  onCloseProfile,
  onOpenProfile,
  pinnedMajor,
}) {
  const activeTreeId = route.view === "tree" ? route.treeId : null;
  const activeMajorId = MAJORS[route.view?.toLowerCase()] ? route.view : null;
  const MajorComponent = !showProfile ? MAJORS[route.view?.toLowerCase()] : null;

  return (
    <>
      <AppSidebar
        forests={MOCK_FORESTS}
        allTrees={MOCK_ALL_TREES}
        recents={recents}
        activeTreeId={activeTreeId}
        activeMajorId={activeMajorId}
        pinnedMajor={pinnedMajor}
        searchQuery={searchQuery}
        searchOpen={searchOpen}
        onSearchQueryChange={setSearchQuery}
        onSearchOpenChange={setSearchOpen}
        onOpenTree={openTree}
        onOpenMajor={openMajor}
        onNewTree={() => navigate("setup")}
      />

      {showProfile ? (
        <ProfileMain profile={userProfile} onClose={onCloseProfile} />
      ) : null}

      {!showProfile && route.view === "landing" ? (
        <LandingMain
          onPlantNewTree={() => navigate("setup")}
          onOpenTree={openTree}
          onOpenProfile={onOpenProfile}
          profileLabel={userProfile?.displayName}
        />
      ) : null}

      {!showProfile && route.view === "tree" ? (
        <TreeViewMain tree={activeTree} onBack={goHome} />
      ) : null}

      {!showProfile && route.view === "setup" ? (
        <TreeSetupMain onBack={goHome} />
      ) : null}

      {MajorComponent ? (
        <MajorTreePage
          majorId={route.view}
          majorName={pinnedMajor?.id === route.view ? pinnedMajor.name : undefined}
          onBack={goHome}
        />
      ) : null}
    </>
  );
}

export default function App() {
  const initialProfile = loadStoredProfile();

  const [onboardingVisible, setOnboardingVisible] = useState(!initialProfile);
  const [homeRevealed, setHomeRevealed] = useState(!!initialProfile);
  const [homeEntered, setHomeEntered] = useState(!!initialProfile);
  const [route, setRoute] = useState(() => parseLocation());
  const [recentIds, setRecentIds] = useState(loadRecentIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(initialProfile);
  const [showProfile, setShowProfile] = useState(false);
  // Major pinned from guest selection — shown at top of Forests
  const [pinnedMajor, setPinnedMajor] = useState(null);

  const recents = useMemo(() => resolveRecentTrees(recentIds), [recentIds]);
  const activeTreeId = route.view === "tree" ? route.treeId : null;
  const activeTree = activeTreeId ? getTreeById(activeTreeId) : null;

  const navigate = useCallback((view, treeId = null) => {
    const path = pathForView(view, treeId);
    window.history.pushState({ view, treeId }, "", path);
    setRoute({ view, treeId: view === "tree" ? treeId : null });
  }, []);

  // Navigate to a major's tree page and pin it in the sidebar
  const openMajor = useCallback((majorId, majorName) => {
    navigate(majorId);
    setPinnedMajor({ id: majorId, name: majorName });
  }, [navigate]);

  useEffect(() => {
    const onPopState = () => setRoute(parseLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (onboardingVisible) { document.title = "TreeReq"; return; }
    if (showProfile) { document.title = "TreeReq — Profile"; return; }
    if (route.view === "tree" && activeTree) { document.title = getTreeDocumentTitle(activeTree); return; }
    if (route.view === "setup") { document.title = "TreeReq — New tree"; return; }
    if (route.view && MAJORS[route.view.toLowerCase()]) {
      const name = route.view.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      document.title = `TreeReq — ${name}`;
      return;
    }
    document.title = "TreeReq — Home";
  }, [onboardingVisible, showProfile, route.view, activeTree]);

  const openTree = useCallback((treeId) => {
    if (!getTreeById(treeId)) return;
    navigate("tree", treeId);
    setRecentIds((prev) => bumpRecentIds(prev, treeId));
  }, [navigate]);

  const goHome = useCallback(() => navigate("landing"), [navigate]);

  const handleOnboardingExitStart = useCallback(() => {
    setHomeRevealed(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setHomeEntered(true)));
  }, []);

  const handleOnboardingComplete = useCallback((data) => {
    if (data?.profile && data?.academic) {
      const mapped = mapOnboardingToProfile(data);
      saveStoredProfile(mapped);
      setUserProfile(mapped);
      setShowProfile(true);
    }
    // If guest signed in with a selected major, pin it and navigate to it
    if (data?.majorId && data?.majorName) {
      setPinnedMajor({ id: data.majorId, name: data.majorName });
      // Navigate after home is revealed
      setTimeout(() => navigate(data.majorId), 50);
    }
    setOnboardingVisible(false);
  }, [navigate]);

  const handleCloseProfile = useCallback(() => {
    setShowProfile(false);
    navigate("landing");
  }, [navigate]);

  const handleOpenProfile = useCallback(() => {
    const stored = loadStoredProfile();
    if (stored) setUserProfile(stored);
    setShowProfile(true);
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
            openMajor={openMajor}
            goHome={goHome}
            activeTree={activeTree}
            showProfile={showProfile}
            userProfile={userProfile}
            onCloseProfile={handleCloseProfile}
            onOpenProfile={handleOpenProfile}
            pinnedMajor={pinnedMajor}
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
