import { useState } from "react";

const font = { fontFamily: "var(--font-ui)", fontWeight: 400 };

function ActionCard({ title, subtitle, accent = "#358162", onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 160px",
        maxWidth: 240,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 6,
        padding: "18px 20px",
        background: hovered ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.85)",
        boxShadow: hovered
          ? "0px 6px 18px rgba(0,0,0,0.13)"
          : "0px 4px 4px rgba(0,0,0,0.10)",
        borderRadius: 16,
        border: `2px solid ${accent}55`,
        cursor: "pointer",
        textAlign: "left",
        transition: "box-shadow 150ms, background 150ms",
      }}
    >
      <span style={{ color: "#000", fontSize: 15, fontWeight: 500, ...font }}>{title}</span>
      {subtitle && (
        <span style={{ color: "#9A9A9A", fontSize: 12, ...font }}>{subtitle}</span>
      )}
      <span style={{ color: accent, fontSize: 13, marginTop: 4, ...font }}>Open →</span>
    </button>
  );
}

function CoursePill({ label }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 10px",
      background: "rgba(53,129,98,0.08)",
      border: "1px solid rgba(53,129,98,0.22)",
      borderRadius: 99,
      fontSize: 12,
      color: "#2a6650",
      ...font,
    }}>
      {label}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <h2 style={{
      margin: "0 0 12px",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "#BBBBBB",
      ...font,
    }}>
      {children}
    </h2>
  );
}

function BackgroundBlobs() {
  const blob = (style) => (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        filter: "blur(100px)",
        ...style,
      }}
      aria-hidden
    />
  );
  return (
    <>
      {blob({
        width: "min(712px, 55vw)",
        height: 530,
        left: "8%",
        top: "42%",
        background: "rgba(39, 100, 166, 0.25)",
      })}
      {blob({
        width: "min(743px, 58vw)",
        height: 572,
        left: "12%",
        top: "-12%",
        background: "rgba(143, 206, 156, 0.25)",
      })}
      {blob({
        width: "min(610px, 48vw)",
        height: 455,
        right: "8%",
        bottom: "5%",
        transform: "rotate(-4deg)",
        background: "linear-gradient(180deg, rgba(143, 206, 156, 0.2) 0%, rgba(72, 104, 79, 0.2) 100%)",
      })}
      {blob({
        width: "min(512px, 40vw)",
        height: 369,
        right: "6%",
        top: "18%",
        transform: "rotate(-4deg)",
        background: "rgba(133, 177, 16, 0.2)",
      })}
    </>
  );
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

<<<<<<< HEAD
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
=======
function UnitsBar({ completed = 0, total = 180 }) {
  const chartH = 220;
  const fillH = Math.round((completed / total) * chartH);
  const ticks = [180, 175, 150, 125, 100, 75, 50, 25, 0];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
>>>>>>> af5b5428b0c370b0511114d1007407b32ca0da7b
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: chartH,
          width: 32,
          flexShrink: 0,
        }}
      >
<<<<<<< HEAD
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
=======
        {ticks.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 12,
              ...font,
              color: t === 180 || t === 0 ? "#000" : "#9A9A9A",
              lineHeight: 1,
>>>>>>> af5b5428b0c370b0511114d1007407b32ca0da7b
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        style={{
          width: 38,
          height: chartH,
          borderRadius: 10,
          border: "1px solid #000",
          background: "#D9D9D9",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: fillH,
            background: "#358162",
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center", ...font, fontSize: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 18, height: 18, background: "#358162", borderRadius: 1, border: "1px solid #000" }} />
          <span style={{ color: "#000" }}>Completed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 18, height: 18, background: "#D9D9D9", borderRadius: 1, border: "1px solid #000" }} />
          <span style={{ color: "#000" }}>Unfulfilled</span>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
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

=======
>>>>>>> af5b5428b0c370b0511114d1007407b32ca0da7b
export default function LandingMain({
  onPlantNewTree,
  onOpenTree,
  onOpenMajor,
  onOpenProfile,
  onOpenMajor,
  profileLabel = "Guest",
  userProfile = null,
<<<<<<< HEAD
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
=======
}) {
  const { completed, standing } = computeProgress(userProfile);
  const majorName = userProfile?.major ?? null;
  const majorId = userProfile?.majorId ?? null;
  const hasProgress = !!(userProfile?.uclaCourses?.length || userProfile?.apClasses?.length || userProfile?.ibClasses?.length);
  const apClasses = userProfile?.apClasses ?? [];
  const ibClasses = userProfile?.ibClasses ?? [];
  const uclaCourses = userProfile?.uclaCourses ?? [];
  const admitTerm = userProfile?.admitTerm && userProfile.admitTerm !== "—" ? userProfile.admitTerm : null;
  const gradTerm = userProfile?.gradTerm && userProfile.gradTerm !== "—" ? userProfile.gradTerm : null;
>>>>>>> af5b5428b0c370b0511114d1007407b32ca0da7b

  return (
    <main
      style={{
        flex: 1,
        position: "relative",
        background: "#fff",
        overflow: "auto",
        minWidth: 0,
      }}
    >
      <BackgroundBlobs />

      <div
        style={{
          position: "relative",
          zIndex: 1,
<<<<<<< HEAD
          padding: "28px 48px 56px 48px",
          maxWidth: 1100,
=======
          padding: "36px 40px 48px",
          maxWidth: 1200,
          marginLeft: 0,
>>>>>>> af5b5428b0c370b0511114d1007407b32ca0da7b
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => onOpenProfile?.()}
            style={{
              width: 163,
              minHeight: 56,
              padding: "11px 20px 11px 17px",
              background: "rgba(39, 100, 166, 0.5)",
              borderRadius: 18,
              border: "2px solid #C0C8D2",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#000", fontSize: 20, ...font }}>{profileLabel}</div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                background: "#D9D9D9",
                borderRadius: 9999,
                flexShrink: 0,
              }}
              aria-hidden
            />
          </button>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              color: "#000",
              fontSize: 28,
              fontWeight: 400,
              margin: "0 0 0",
              ...font,
            }}
          >
            Welcome back.
          </h1>
        </div>

        <div
          style={{
            maxWidth: 488,
            width: "100%",
            padding: "33px 44px 30px 32px",
            background: "rgba(255, 255, 255, 0.85)",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            borderRadius: 25,
            border: "2px solid #81B3E8",
            marginBottom: 40,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
<<<<<<< HEAD
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
=======
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ color: "#000", fontSize: 20, fontWeight: 500, ...font }}>Current progress:</div>
              <div style={{ color: "#000", fontSize: 16, ...font }}>
                Major: {majorName ?? "—"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                <div style={{ color: "#7C7C7C", fontSize: 16, ...font }}>
                  Completed Units: {hasProgress ? completed : "—"}
                </div>
                <div style={{ color: "#7C7C7C", fontSize: 16, ...font }}>
                  Unit Standing: {hasProgress ? standing : "—"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#000", ...font }}>total units</span>
              <UnitsBar completed={hasProgress ? completed : 0} />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: 36 }}>
          <SectionLabel>Quick actions</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {majorId && (
              <ActionCard
                title={majorName ?? "Your major"}
                subtitle="View prerequisite tree"
                accent="#358162"
                onClick={() => onOpenMajor?.(majorId)}
              />
            )}
            <ActionCard
              title="New tree"
              subtitle="Start a fresh degree plan"
              accent="#85B110"
              onClick={onPlantNewTree}
            />
          </div>
        </div>

        {/* Term info row */}
        {(admitTerm || gradTerm) && (
          <div style={{ marginBottom: 36 }}>
            <SectionLabel>Timeline</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
              {admitTerm && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "#BBBBBB", letterSpacing: "0.04em", textTransform: "uppercase", ...font }}>Admitted</span>
                  <span style={{ fontSize: 15, color: "#3A3A3A", ...font }}>{admitTerm}</span>
                </div>
              )}
              {gradTerm && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "#BBBBBB", letterSpacing: "0.04em", textTransform: "uppercase", ...font }}>Expected graduation</span>
                  <span style={{ fontSize: 15, color: "#3A3A3A", ...font }}>{gradTerm}</span>
                </div>
              )}
>>>>>>> af5b5428b0c370b0511114d1007407b32ca0da7b
            </div>
          </div>
        )}

        {/* Completed courses */}
        {hasProgress && (
          <div>
            <SectionLabel>Your completed courses</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {uclaCourses.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: "#9A9A9A", marginBottom: 8, ...font }}>UCLA Courses</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {uclaCourses.map(c => <CoursePill key={c} label={c} />)}
                  </div>
                </div>
              )}
              {apClasses.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: "#9A9A9A", marginBottom: 8, ...font }}>AP Credits</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {apClasses.map(c => <CoursePill key={c} label={c} />)}
                  </div>
                </div>
              )}
              {ibClasses.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: "#9A9A9A", marginBottom: 8, ...font }}>IB Credits</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ibClasses.map(c => <CoursePill key={c} label={c} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
