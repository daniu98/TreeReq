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

function UnitsBar({ completed = 0, total = 180 }) {
  const chartH = 220;
  const fillH = Math.round((completed / total) * chartH);
  const ticks = [180, 175, 150, 125, 100, 75, 50, 25, 0];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
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
        {ticks.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 12,
              ...font,
              color: t === 180 || t === 0 ? "#000" : "#9A9A9A",
              lineHeight: 1,
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

export default function LandingMain({
  onPlantNewTree,
  onOpenTree,
  onOpenProfile,
  onOpenMajor,
  profileLabel = "Guest",
  userProfile = null,
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

  return (
    <main
      style={{
        flex: 1,
        position: "relative",
        background: "#fff",
        overflow: "visible",
        minWidth: 0,
      }}
    >
      <BackgroundBlobs />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "36px 40px 48px",
          maxWidth: 1200,
          marginLeft: 0,
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
