import { useCallback, useEffect, useMemo, useState } from "react";
import { googleLogout } from "@react-oauth/google";
import LandingMain from "./components/pages/LandingMain.jsx";
import OnboardingMain from "./components/pages/OnboardingMain.jsx";
import ProfileMain from "./components/pages/ProfileMain.jsx";
import TreeViewMain from "./components/pages/TreeViewMain.jsx";
import AppSidebar from "./components/layout/AppSidebar.jsx";
import TreeSetupMain from "./components/pages/TreeSetupMain.jsx";
import { DegreeTree } from "./components/tree/DegreeTree.jsx";
import { DraggableCanvas } from "./components/tree/DraggableCanvas.jsx";
import {
  getTreeById,
  loadMajorTimestamps,
  saveMajorTimestamp,
} from "./data/mockTrees.js";
import {
  loadStoredProfile,
  makeGuestProfile,
  mapOnboardingToProfile,
  mapReturnedUserToProfile,
  saveStoredProfile,
  loadLocalProfileSync,
} from "./data/userProfile.js";
import { getTreeDocumentTitle, parseLocation, pathForView } from "./lib/routes.js";
import "./styles/variables.css";

const KNOWN_VIEWS = new Set(["landing", "tree", "setup"]);
const RECENT_MAJORS_KEY = "treereq-recent-majors";


function loadRecentMajors() {
  try {
    const raw = localStorage.getItem(RECENT_MAJORS_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveRecentMajors(items) {
  try { localStorage.setItem(RECENT_MAJORS_KEY, JSON.stringify(items)); } catch {}
}

function MajorTreePage({ majorId, majorName, onBack, userProfile, onProfileUpdate }) {
  const [focusPoint, setFocusPoint] = useState(null);

  useEffect(() => { setFocusPoint(null); }, [majorId]);

  const displayName = majorName ?? majorId
    .split("-")
    .map((w) => (/^(ba|bs|bm|ma|ms|mba|mfa|phd)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
      <div style={{
        height: 52,
        padding: "0 20px",
        borderBottom: "1px solid #EAEAEA",
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "#FAFAFA",
        flexShrink: 0,
        zIndex: 1,
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 14,
            color: "#666",
            padding: "4px 0",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back
        </button>
        <span style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 15,
          fontWeight: 500,
          color: "#1A1A1A",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {displayName}
        </span>
      </div>
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <DraggableCanvas focusPoint={focusPoint}>
          <DegreeTree
            majorId={majorId}
            majorName={displayName}
            onFirstCategoryReady={setFocusPoint}
            userProfile={userProfile}
            onProfileUpdate={onProfileUpdate}
          />
        </DraggableCanvas>
      </div>
    </div>
  );
}

function AppHome({
  route,
  forests,
  forestTimestamps,
  openTree,
  openMajor,
  goHome,
  activeTree,
  showProfile,
  userProfile,
  onCloseProfile,
  onOpenProfile,
  onProfileUpdate,
  onSignOut,
  onSignIn,
  searchTrigger,
}) {
  const activeTreeId = route.view === "tree" ? route.treeId : null;
  const activeMajorId = !KNOWN_VIEWS.has(route.view) && route.view ? route.view : null;
  const isMajorView = !showProfile && !!activeMajorId;

  return (
    <>
      <AppSidebar
        forests={forests}
        activeTreeId={activeTreeId}
        activeMajorId={activeMajorId}
        onHome={goHome}
        onOpenTree={openTree}
        onOpenMajor={openMajor}
        searchTrigger={searchTrigger}
      />

      {showProfile ? (
        <ProfileMain
          profile={userProfile}
          onClose={onCloseProfile}
          onProfileUpdate={onProfileUpdate}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
        />
      ) : null}

      {!showProfile && route.view === "landing" ? (
        <LandingMain
          onOpenTree={openTree}
          onOpenMajor={openMajor}
          onOpenProfile={onOpenProfile}
          userProfile={userProfile}
          forests={forests}
          forestTimestamps={forestTimestamps ?? {}}
        />
      ) : null}

      {!showProfile && route.view === "tree" ? (
        <TreeViewMain tree={activeTree} onBack={goHome} />
      ) : null}

      {!showProfile && route.view === "setup" ? (
        <TreeSetupMain onBack={goHome} />
      ) : null}

      {isMajorView ? (
        <MajorTreePage
          majorId={route.view}
          majorName={route.majorName}
          onBack={goHome}
          userProfile={userProfile}
          onProfileUpdate={onProfileUpdate}
        />
      ) : null}
    </>
  );
}

export default function App() {
  const initialProfile = loadLocalProfileSync();

  const [onboardingVisible, setOnboardingVisible] = useState(!initialProfile);
  const [homeRevealed, setHomeRevealed] = useState(!!initialProfile);
  const [homeEntered, setHomeEntered] = useState(!!initialProfile);

  const [route, setRoute] = useState(() => parseLocation());
  const [userProfile, setUserProfile] = useState(initialProfile);
  const [showProfile, setShowProfile] = useState(false);

  const [majorTimestamps, setMajorTimestamps] = useState(loadMajorTimestamps);
  const [recentMajors, setRecentMajors] = useState(loadRecentMajors);
  const searchTrigger = 0;
  const activeTreeId = route.view === "tree" ? route.treeId : null;
  const activeTree = activeTreeId ? getTreeById(activeTreeId) : null;
  useEffect(() => { // written by gemini
    async function syncProfile() {
      const freshProfile = await loadStoredProfile();
      if (freshProfile) {
        setUserProfile(freshProfile);
      }
    }
    syncProfile();
  }, []);
  const allMyTrees = useMemo(() => {
    if (!userProfile?.majorId || !userProfile?.major) return recentMajors;
    if (recentMajors.some((m) => m.id === userProfile.majorId)) return recentMajors;
    return [...recentMajors, { id: userProfile.majorId, name: userProfile.major, majorId: userProfile.majorId }];
  }, [userProfile, recentMajors]);

  const navigate = useCallback((view, treeId = null, meta = null) => {
    const path = pathForView(view, treeId);
    window.history.pushState({ view, treeId, ...meta }, "", path);
    setRoute({ view, treeId: view === "tree" ? treeId : null, ...(meta ?? {}) });
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

    if (route.view && !KNOWN_VIEWS.has(route.view)) {
      const name = route.majorName ?? route.view
        .split("-")
        .map((w) => (/^(ba|bs|bm|ma|ms|mba|mfa|phd)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(" ");
      document.title = `TreeReq — ${name}`;
      return;
    }

    document.title = "TreeReq — Home";
  }, [onboardingVisible, showProfile, route.view, route.majorName, activeTree]);

  const openTree = useCallback(
    (treeId) => {
      if (!getTreeById(treeId)) return;
      setShowProfile(false);
      navigate("tree", treeId);
    },
    [navigate]
  );

  const openMajor = useCallback((majorId, majorName) => {
    setShowProfile(false);
    navigate(majorId, null, majorName ? { majorName } : null);
    setRecentMajors((prev) => {
      const name = majorName ?? majorId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const item = { id: majorId, name, majorId };
      const next = [item, ...prev.filter((m) => m.id !== majorId)].slice(0, 10);
      saveRecentMajors(next);
      return next;
    });
    saveMajorTimestamp(majorId);
    setMajorTimestamps(loadMajorTimestamps());
  }, [navigate]);

  const goHome = useCallback(() => {
    setShowProfile(false);
    navigate("landing");
  }, [navigate]);

  const handleOnboardingExitStart = useCallback(() => {
    setHomeRevealed(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setHomeEntered(true));
    });
  }, []);

  const handleOnboardingComplete = useCallback(async (data) => {
    if (data?.profile && data?.academic) {
      // Fresh onboarding — always use the new data, never old stored data
      const mapped = mapOnboardingToProfile(data);
      await saveStoredProfile(mapped);
      setUserProfile(mapped);
      setShowProfile(true);
    } else if (data?.skipped && data?.profileData) {
      // Returning authenticated user — profile fetched from backend
      const mapped = mapReturnedUserToProfile(data.profileData);
      if (mapped) {
	//bookmark
        //await saveStoredProfile(mapped);
        setUserProfile(mapped);
      }
    } else if (data?.skipped && data?.major) {
      // Guest continuing without sign-in
      const guest = makeGuestProfile(data.major);
      if (guest) {
        await saveStoredProfile(guest);
        setUserProfile(guest);
      }
    }
    await loadStoredProfile();
    setOnboardingVisible(false);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowProfile(false);
    navigate("landing");
  }, [navigate]);

  const handleOpenProfile = useCallback(async () => {
    const stored = await loadStoredProfile();
    if (stored) setUserProfile(stored);
    setShowProfile(true);
  }, []);

  const handleProfileUpdate = useCallback((updated) => {
    const isGuest = sessionStorage.getItem("treereq-sso-token") === "is-guest";
    if (!isGuest) saveStoredProfile(updated);
    setUserProfile(updated);
    if (updated?.majorId && updated?.major) {
      setRecentMajors((prev) => {
        const item = { id: updated.majorId, name: updated.major, majorId: updated.majorId };
        const next = [item, ...prev.filter((m) => m.id !== updated.majorId)].slice(0, 10);
        saveRecentMajors(next);
        return next;
      });
      saveMajorTimestamp(updated.majorId);
      setMajorTimestamps(loadMajorTimestamps());
    }
  }, []);

  const handleSignOut = useCallback(() => {
    googleLogout();
    localStorage.clear();
    sessionStorage.clear();
    setUserProfile(null);
    setShowProfile(false);
    setHomeRevealed(false);
    setHomeEntered(false);
    setOnboardingVisible(true);
    navigate("landing");
  }, [navigate]);

  const handleSignIn = useCallback(() => {
    sessionStorage.clear();
    localStorage.clear();
    setUserProfile(null);
    setShowProfile(false);
    setHomeRevealed(false);
    setHomeEntered(false);
    setOnboardingVisible(true);
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
            forests={allMyTrees}
            forestTimestamps={majorTimestamps}
            openTree={openTree}
            openMajor={openMajor}
            goHome={goHome}
            activeTree={activeTree}
            showProfile={showProfile}
            userProfile={userProfile}
            onCloseProfile={handleCloseProfile}
            onOpenProfile={handleOpenProfile}
            onProfileUpdate={handleProfileUpdate}
            onSignOut={handleSignOut}
            onSignIn={handleSignIn}
            searchTrigger={searchTrigger}
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
