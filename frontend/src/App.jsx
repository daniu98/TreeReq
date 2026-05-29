import { useCallback, useEffect, useMemo, useState } from "react";
import LandingMain from "./components/pages/LandingMain.jsx";
import OnboardingMain from "./components/pages/OnboardingMain.jsx";
import ProfileMain from "./components/pages/ProfileMain.jsx";
import TreeViewMain from "./components/pages/TreeViewMain.jsx";
import AppSidebar from "./components/layout/AppSidebar.jsx";
import TreeSetupMain from "./pages/TreeSetupMain.jsx";
import {
  bumpRecentIds,
  getTreeById,
  loadRecentIds,
  resolveRecentTrees,
  saveRecentIds,
} from "./data/mockTrees.js";
import {
  loadStoredProfile,
  makeGuestProfile,
  mapOnboardingToProfile,
  saveStoredProfile,
} from "./data/userProfile.js";
import { getTreeDocumentTitle, parseLocation, pathForView } from "./lib/routes.js";
import "./styles/variables.css";

const majorModules = import.meta.glob('/src/components/pages/majors/*.jsx', { eager: true });
const MAJORS = Object.keys(majorModules).reduce((acc, filePath) => {
  const fileName = filePath.match(/\/majors\/(.+)\.jsx$/)[1].toLowerCase();
  acc[fileName] = majorModules[filePath].default;
  return acc;
}, {});

function userForests(userProfile) {
  if (!userProfile?.majorId || !userProfile?.major) return [];
  return [{ id: userProfile.majorId, name: userProfile.major, majorId: userProfile.majorId }];
}

function AppHome({
  route,
  navigate,
  recents,
  openTree,
  goHome,
  activeTree,
  showProfile,
  userProfile,
  onCloseProfile,
  onOpenProfile,
  onProfileUpdate,
}) {
  const activeTreeId = route.view === "tree" ? route.treeId : null;
  const activeMajorId = MAJORS[route.view?.toLowerCase()] ? route.view : null;
  const MajorComponent = !showProfile ? MAJORS[route.view?.toLowerCase()] : null;
  const forests = userForests(userProfile);

  return (
    <>
      <AppSidebar
        forests={forests}
        recents={recents}
        activeTreeId={activeTreeId}
        activeMajorId={activeMajorId}
        onHome={goHome}
        onOpenTree={openTree}
        onOpenMajor={(majorId) => navigate(majorId)}
        onNewTree={() => navigate("setup")}
      />

      {showProfile ? (
        <ProfileMain
          profile={userProfile}
          onClose={onCloseProfile}
          onProfileUpdate={onProfileUpdate}
        />
      ) : null}

      {!showProfile && route.view === "landing" ? (
        <LandingMain
          onPlantNewTree={() => navigate("setup")}
          onOpenTree={openTree}
          onOpenProfile={onOpenProfile}
          onOpenMajor={(majorId) => navigate(majorId)}
          profileLabel={userProfile?.displayName ?? "Guest"}
          userProfile={userProfile}
        />
      ) : null}

      {!showProfile && route.view === "tree" ? (
        <TreeViewMain tree={activeTree} onBack={goHome} />
      ) : null}

      {!showProfile && route.view === "setup" ? (
        <TreeSetupMain onBack={goHome} />
      ) : null}

      {MajorComponent ? <MajorComponent onBack={goHome} /> : null}
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
  const [userProfile, setUserProfile] = useState(initialProfile);
  const [showProfile, setShowProfile] = useState(false);

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
    if (showProfile) {
      document.title = "TreeReq — Profile";
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

    if (route.view && MAJORS[route.view.toLowerCase()]) {
      const formattedTitle = route.view
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      document.title = `TreeReq — ${formattedTitle}`;
      return;
    }

    document.title = "TreeReq — Home";
  }, [onboardingVisible, showProfile, route.view, activeTree]);

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

  const handleOnboardingComplete = useCallback((data) => {
    if (data?.profile && data?.academic) {
      const mapped = mapOnboardingToProfile(data);
      saveStoredProfile(mapped);
      setUserProfile(mapped);
      setShowProfile(true);
    } else if (data?.skipped && data?.major) {
      const guest = makeGuestProfile(data.major);
      if (guest) {
        saveStoredProfile(guest);
        setUserProfile(guest);
      }
    }
    saveRecentIds([]);
    setRecentIds([]);
    setOnboardingVisible(false);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowProfile(false);
    navigate("landing");
  }, [navigate]);

  const handleOpenProfile = useCallback(() => {
    const stored = loadStoredProfile();
    if (stored) setUserProfile(stored);
    setShowProfile(true);
  }, []);

  const handleProfileUpdate = useCallback((updated) => {
    saveStoredProfile(updated);
    setUserProfile(updated);
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
            openTree={openTree}
            goHome={goHome}
            activeTree={activeTree}
            showProfile={showProfile}
            userProfile={userProfile}
            onCloseProfile={handleCloseProfile}
            onOpenProfile={handleOpenProfile}
            onProfileUpdate={handleProfileUpdate}
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
