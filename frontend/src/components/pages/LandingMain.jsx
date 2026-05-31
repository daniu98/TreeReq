import { useState } from "react";

const font = { fontFamily: "var(--font-ui)", fontWeight: 400 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(displayName, fullName) {
  const name = displayName || fullName;
  if (!name) return "G";
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function getFirstName(displayName, fullName) {
  const name = displayName || fullName;
  if (!name) return null;
  return name.trim().split(/\s+/)[0];
}

function timeAgo(timestamp) {
  if (!timestamp) return null;
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
}

function computeProgress(profile) {
  const uclaUnits = (profile?.uclaCourses?.length ?? 0) * 4;
  const apUnits = (profile?.apClasses?.length ?? 0) * 8;
  const ibUnits = (profile?.ibClasses?.length ?? 0) * 8;
  const completed = uclaUnits + apUnits + ibUnits;
  let standing;
  if (completed >= 135) standing = "Senior";
  else if (completed >= 90) standing = "Junior";
  else if (completed >= 45) standing = "Sophomore";
  else standing = "Freshman";
  return { completed, standing };
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SproutIcon({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.4972 21.1649C3.70404 19.1933 3.21404 16.6989 3.4322 14.4706C3.67254 12.0124 4.7937 9.65461 6.2532 8.43777C8.20387 6.81261 10.2525 6.14528 12.0305 5.81861C12.8965 5.67076 13.7684 5.56061 14.6439 5.48844C15.1152 5.44411 15.5924 5.39978 16.0509 5.28544C17.0169 5.04394 17.97 4.65194 18.7552 4.02894C19.1145 3.74311 19.4785 3.45378 19.9627 3.50744C20.1367 3.52681 20.3042 3.5851 20.4526 3.678C20.6011 3.77091 20.7267 3.89604 20.8202 4.04411C24.5535 9.95561 23.99 16.2311 20.8715 20.1838C19.314 22.1566 17.1265 23.5333 14.575 23.9404C12.349 24.2939 9.91653 23.8984 7.46537 22.6151C7.25 23.2845 7.09002 23.9705 6.98703 24.6661C6.94325 24.9724 6.77958 25.2488 6.53201 25.4345C6.28445 25.6201 5.97328 25.6998 5.66695 25.656C5.36063 25.6122 5.08424 25.4486 4.8986 25.201C4.71295 24.9534 4.63325 24.6423 4.67704 24.3359C4.8217 23.3268 5.09704 22.2523 5.4972 21.1649ZM12.4505 8.11344C13.2719 7.96294 14.043 7.89061 14.792 7.81711C15.4034 7.75878 16.0194 7.69811 16.6167 7.54878C17.6227 7.3023 18.5861 6.9067 19.475 6.37511C22.016 11.1783 21.3067 15.8648 19.0399 18.7394C17.8172 20.2888 16.136 21.3294 14.2099 21.6351C12.4797 21.9104 10.4765 21.6071 8.34154 20.4381C9.63887 17.7933 11.7599 15.2581 14.5214 13.8779C14.7983 13.7396 15.0089 13.497 15.107 13.2034C15.205 12.9097 15.1823 12.5892 15.044 12.3123C14.9057 12.0353 14.6631 11.8247 14.3694 11.7267C14.0758 11.6287 13.7553 11.6513 13.4784 11.7896C10.4357 13.3109 8.1047 15.9418 6.5892 18.7476C5.84137 17.5226 5.61737 16.0981 5.75504 14.6969C5.9522 12.6809 6.87504 10.9578 7.74653 10.2298C9.29587 8.93827 10.9292 8.39344 12.4517 8.11344H12.4505Z"
        fill={color}
      />
    </svg>
  );
}

function ChevronRight({ size = 16, color = "#B0B0B0" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Shows only the icon portion of LOGO.png (the spinning-arrows mark,
// occupying roughly the leftmost 28% of the full-width image).
function TreeReqIcon({ size = 44 }) {
  // The spinning-arrows icon occupies roughly the leftmost 80% of the
  // image height as width. Clip to that width to hide the "TreeReq" text.
  const clipWidth = Math.round(size * 0.92);
  return (
    <div
      aria-hidden
      style={{
        width: clipWidth,
        height: size,
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
      }}
    >
      <img
        src="/images/LOGO.png"
        alt=""
        style={{ height: size, width: "auto", display: "block" }}
      />
    </div>
  );
}

function ProfileButton({ initials, name, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 18px 7px 7px",
        background: "#fff",
        borderRadius: 9999,
        border: "1px solid #E5E5E5",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        cursor: "pointer",
        ...font,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "#4a7c2f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.5,
          flexShrink: 0,
          ...font,
        }}
      >
        {initials}
      </div>
      <span style={{ fontSize: 15, color: "#1a1a1a", fontWeight: 500, ...font }}>
        {name}
      </span>
    </button>
  );
}

function SignInButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={() => onClick?.()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 20px",
        background: hovered ? "#2f6b4e" : "#358162",
        borderRadius: 9999,
        border: "none",
        cursor: "pointer",
        transition: "background 150ms",
        fontFamily: "var(--font-ui)",
        fontWeight: 600,
        fontSize: 14,
        color: "#fff",
      }}
    >
      Sign in
    </button>
  );
}

function PlantButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={() => onClick?.()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        maxWidth: 520,
        padding: "15px 32px",
        background: hovered
          ? "linear-gradient(90deg, #2f5a1e 0%, #5a9e30 100%)"
          : "linear-gradient(90deg, #3a6b24 0%, #6aaa38 100%)",
        borderRadius: 9999,
        border: "none",
        cursor: "pointer",
        transition: "background 150ms, filter 150ms",
        filter: hovered ? "brightness(1.05)" : "none",
        ...font,
      }}
    >
      <SproutIcon size={20} color="#fff" />
      <span style={{ color: "#fff", fontSize: 16, fontWeight: 600, ...font }}>
        Plant a new tree
      </span>
    </button>
  );
}

function ProgressStatsCard({ completed, standing, hasProgress }) {
  return (
    <div
      style={{
        flex: "1 1 220px",
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #E8E8E8",
        padding: "22px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, color: "#9A9A9A", ...font }}>Completed Units</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", ...font }}>
          {hasProgress ? completed : "—"}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, color: "#9A9A9A", ...font }}>Unit Standing</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", ...font }}>
          {hasProgress ? standing : "—"}
        </span>
      </div>
    </div>
  );
}

function TotalUnitsCard({ completed, total = 180, hasProgress }) {
  const pct = hasProgress ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return (
    <div
      style={{
        flex: "2 1 300px",
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #E8E8E8",
        padding: "22px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, color: "#9A9A9A", ...font }}>Total units</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", ...font }}>{total}</span>
      </div>
      <div>
        <div
          style={{
            height: 10,
            background: "#E8E8E8",
            borderRadius: 9999,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              background: "linear-gradient(90deg, #3a6b24, #6aaa38)",
              borderRadius: 9999,
              transition: "width 600ms ease",
            }}
          />
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#9A9A9A", textAlign: "right", ...font }}>
          {pct}%
        </div>
      </div>
    </div>
  );
}

function RecentTreeCard({ tree, timestamp, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const ago = timeAgo(timestamp);
  return (
    <button
      type="button"
      onClick={() => onOpen?.()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 220px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        background: hovered ? "#f4faf0" : "#fff",
        borderRadius: 14,
        border: "1px solid #E8E8E8",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.07)" : "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 150ms, box-shadow 150ms",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 10,
          background: "rgba(74, 124, 47, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <SproutIcon size={22} color="#4a7c2f" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1a1a1a",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            ...font,
          }}
        >
          {tree.name}
        </div>
        <div style={{ fontSize: 12, color: "#9A9A9A", marginTop: 3, ...font }}>
          {ago ? `Last viewed ${ago}` : "Recently viewed"}
        </div>
      </div>
      <ChevronRight />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LandingMain({
  onPlantNewTree,
  onOpenTree,
  onOpenMajor,
  onOpenProfile,
  onSignIn,
  userProfile = null,
  forests = [],
  forestTimestamps = {},
}) {
  const { completed, standing } = computeProgress(userProfile);
  const majorName = userProfile?.major ?? null;
  const hasProgress = !!(
    userProfile?.uclaCourses?.length ||
    userProfile?.apClasses?.length ||
    userProfile?.ibClasses?.length
  );

  const firstName = getFirstName(userProfile?.displayName, userProfile?.fullName);
  const initials = getInitials(userProfile?.displayName, userProfile?.fullName);
  const displayName = userProfile?.displayName ?? "Guest";
  const isGuest = !userProfile?.displayName && !userProfile?.fullName;
  const recentTwo = forests.slice(0, 2);

  return (
    <main
      style={{
        flex: 1,
        position: "relative",
        overflow: "auto",
        minWidth: 0,
        background: "linear-gradient(145deg, #f7fbf4 0%, #eef6e8 60%, #dff0d8 100%)",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "28px 48px 56px 48px",
          maxWidth: 1100,
        }}
      >
        {/* Profile / Sign-in row */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginBottom: 48 }}>
          {isGuest && <SignInButton onClick={onSignIn} />}
          <ProfileButton initials={initials} name={displayName} onClick={onOpenProfile} />
        </div>

        {/* Welcome + CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            marginBottom: 52,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <TreeReqIcon size={48} />
            <h1 style={{ fontSize: 40, fontWeight: 700, margin: 0, color: "#000", ...font }}>
              <span style={{ fontWeight: 700 }}>Welcome back, </span>
              <span style={{ fontWeight: 700, color: "#358162" }}>{firstName ?? "Guest"}.</span>
            </h1>
          </div>
          <PlantButton onClick={onPlantNewTree} />
        </div>

        {/* Your progress */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#3a3a3a", ...font }}>
              Your progress
            </span>
            {majorName && (
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 12px",
                  background: "rgba(74, 124, 47, 0.1)",
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#4a7c2f",
                  ...font,
                }}
              >
                {majorName}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <ProgressStatsCard
              completed={completed}
              standing={standing}
              hasProgress={hasProgress}
            />
            <TotalUnitsCard completed={completed} total={180} hasProgress={hasProgress} />
          </div>
        </div>

        {/* Revisit your trees */}
        {recentTwo.length > 0 && (
          <div>
            <div
              style={{ fontSize: 15, fontWeight: 600, color: "#3a3a3a", marginBottom: 14, ...font }}
            >
              Revisit your trees
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {recentTwo.map((tree) => (
                <RecentTreeCard
                  key={tree.id}
                  tree={tree}
                  timestamp={forestTimestamps[tree.id]}
                  onOpen={() =>
                    tree.majorId
                      ? onOpenMajor?.(tree.majorId, tree.name)
                      : onOpenTree?.(tree.id)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
