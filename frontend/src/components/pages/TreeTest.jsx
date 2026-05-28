import { useState, useEffect } from "react";
import { DegreeTree } from "../tree/DegreeTree.jsx";
import { DraggableCanvas } from "../tree/DraggableCanvas.jsx";

const font = "Inter, system-ui, sans-serif";

const FALLBACK = [
  { major_id: "cognitive-science-bs",              name: "Cognitive Science BS" },
  { major_id: "computer-science-bs",               name: "Computer Science BS" },
];

export default function TreeTest() {
  const [majors, setMajors] = useState(FALLBACK);
  const [majorId, setMajorId] = useState(FALLBACK[0].major_id);

  useEffect(() => {
    fetch("/api/majors")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
          setMajors(sorted);
          setMajorId(sorted[0].major_id);
        }
      })
      .catch(() => {}); // keep fallback on error
  }, []);

  const majorName = majors.find((m) => m.major_id === majorId)?.name ?? majorId;

  return (
    <>
      {/* Top bar — rendered outside DraggableCanvas so it's not zoomed */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 20px",
          zIndex: 400,
          fontFamily: font,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: "#222" }}>TreeReq</span>

        <span style={{ color: "#ddd" }}>|</span>

        <select
          value={majorId}
          onChange={(e) => setMajorId(e.target.value)}
          style={{
            fontFamily: font,
            fontSize: 14,
            color: "#333",
            background: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "5px 10px",
            cursor: "pointer",
            outline: "none",
            maxWidth: 280,
          }}
        >
          {majors.map((m) => (
            <option key={m.major_id} value={m.major_id}>{m.name}</option>
          ))}
        </select>

        <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>
          Drag to pan · Scroll to zoom · Click any node for details
        </span>
      </div>

      {/* Canvas fills the screen under the top bar */}
      <DraggableCanvas background="#f7f7f5">
        <div style={{ paddingTop: 72, paddingLeft: 48, paddingRight: 48, paddingBottom: 48 }}>
          <DegreeTree
            key={majorId}
            majorId={majorId}
            majorName={majorName}
          />
        </div>
      </DraggableCanvas>
    </>
  );
}
