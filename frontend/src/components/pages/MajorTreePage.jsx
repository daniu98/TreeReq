import { DegreeTree } from "../tree/DegreeTree.jsx";
import { DraggableCanvas } from "../tree/DraggableCanvas.jsx";

function slugToName(id) {
  return id
    .replace(/-bs$/i, " BS")
    .replace(/-ba$/i, " BA")
    .replace(/-bm$/i, " BM")
    .replace(/-ms$/i, " MS")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function MajorTreePage({ majorId, majorName, onBack }) {
  const displayName = majorName || slugToName(majorId);

  return (
    <>
      {/* Back button — floats above the canvas */}
      <div style={{
        position: "fixed",
        top: 14,
        left: 14,
        zIndex: 600,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 20,
            border: "1.5px solid #D9D9D9",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            fontFamily: "var(--font-ui), Inter, system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#444",
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
          }}
        >
          ← Home
        </button>
        <span style={{
          fontFamily: "var(--font-ui), Inter, system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#333",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          padding: "7px 14px",
          borderRadius: 20,
          border: "1.5px solid #eee",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        }}>
          {displayName}
        </span>
      </div>

      <DraggableCanvas background="#f7f7f5">
        <div style={{ paddingTop: 72, paddingLeft: 48, paddingRight: 48, paddingBottom: 48 }}>
          <DegreeTree
            key={majorId}
            majorId={majorId}
            majorName={displayName}
          />
        </div>
      </DraggableCanvas>
    </>
  );
}
