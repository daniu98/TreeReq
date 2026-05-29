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

// Sprout / seedling icon used in the CTA button and tree cards
function SproutIcon({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      {/* stem */}
      <path d="M10 17V9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* right leaf */}
      <path
        d="M10 9C10 6 12.5 3.5 16 3.5C16 7 13.5 9.5 10 9Z"
        fill={color}
      />
      {/* left leaf */}
      <path
        d="M10 12C10 9.5 7.5 7 4 7C4 10.5 6.5 13 10 12Z"
        fill={color}
        opacity="0.75"
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
  const clipWidth = Math.round(size * 0.8);
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

  const recentTwo = forests.slice(0, 2);

  return (
    <main
      style={{
        flex: 1,
        position: "relative",
        overflow: "auto",
        minWidth: 0,
        background: "linear-gradient(145deg, #ffffff 45%, #eef6e8 100%)",
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
        {/* Profile button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 48 }}>
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
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: "#1a1a1a", ...font }}>
              Welcome back,{" "}
              <span style={{ color: "#4a7c2f" }}>{firstName ?? "Guest"}.</span>
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
