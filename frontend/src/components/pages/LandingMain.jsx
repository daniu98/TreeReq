import { MOCK_REVISIT_TREES } from "../../data/mockTrees.js";

const font = { fontFamily: "var(--font-ui)", fontWeight: 400 };

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

function UnitsBar({ completed = 75, total = 180 }) {
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

const REVISIT_TREES = [
  { id: "aerospace", label: "Aerospace engineering with minor..." },
  { id: "env-sci", label: "Environmental science engineering..." },
  { id: "mech-aero", label: "Mechanical engineering aero..." },
];

export default function LandingMain({
  onPlantNewTree,
  onOpenTree,
  onOpenProfile,
  profileLabel = "Your profile",
}) {
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
              margin: "0 0 20px",
              ...font,
            }}
          >
            Welcome back, Steve.
          </h1>
          <button
            type="button"
            onClick={onPlantNewTree}
            style={{
              height: 50,
              padding: "11px 14px",
              background: "#85B110",
              boxShadow: "0px 4px 13.7px rgba(0, 0, 0, 0.25)",
              borderRadius: 27,
              border: "3px solid rgba(133, 177, 16, 0.59)",
              color: "#fff",
              fontSize: 16,
              ...font,
              cursor: "pointer",
            }}
          >
            plant new tree
          </button>
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
              <div style={{ color: "#000", fontSize: 16, ...font }}>Major: Cognitive Science, B.S.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                <div style={{ color: "#7C7C7C", fontSize: 16, ...font }}>Completed Units: 75</div>
                <div style={{ color: "#7C7C7C", fontSize: 16, ...font }}>Unit Standing: Sophomore</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#000", ...font }}>total units</span>
              <UnitsBar />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ color: "#7C7C7C", fontSize: 20, fontWeight: 400, margin: 0, ...font }}>Revisit...</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center" }}>
            {MOCK_REVISIT_TREES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenTree?.(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  maxWidth: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 275,
                    maxWidth: "40vw",
                    height: 67,
                    background: "rgba(255, 255, 255, 0.5)",
                    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                    borderRadius: 9,
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <span style={{ color: "#000", fontSize: 14, ...font }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
