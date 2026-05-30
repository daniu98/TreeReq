import { useEffect, useRef } from "react";

const STATUS_COLORS = {
  Completed: "#348162",
  "In Progress": "#84b110",
  Planned: "#8ecd9b",
  Unfulfilled: "#9a9a9a",
};

const CARD_WIDTH = 280;

function StatusDot({ status }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: STATUS_COLORS[status] ?? "#9a9a9a",
        flexShrink: 0,
        display: "inline-block",
      }}
    />
  );
}

function CloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      style={{
        position: "absolute",
        top: 8,
        right: 10,
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 18,
        color: "#aaa",
        lineHeight: 1,
        padding: "2px 4px",
      }}
    >
      ×
    </button>
  );
}

function CategoryCard({ node, onClose }) {
  return (
    <>
      <CloseButton onClose={onClose} />
      <div style={{ padding: "14px 32px 12px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111", lineHeight: 1.3 }}>
          {node.categoryName}
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
          {node.completionPercentage ?? 0}% complete
        </div>
      </div>
      <div style={{ padding: "10px 16px 14px", maxHeight: 220, overflowY: "auto" }}>
        {node.courses?.length > 0 ? (
          node.courses.map((c, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}
            >
              <StatusDot status={c.status} />
              <span style={{ fontSize: 13, color: "#222" }}>{c.name}</span>
            </div>
          ))
        ) : (
          <span style={{ fontSize: 13, color: "#aaa" }}>No courses listed</span>
        )}
      </div>
    </>
  );
}

function CourseCard({ node, onClose }) {
  const hasPrereqs = node.prerequisites?.length > 0;
  const hasAdvancedPrep = node.advancedPrep?.length > 0;

  return (
    <>
      <CloseButton onClose={onClose} />
      <div style={{ padding: "14px 32px 12px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 4,
          }}
        >
          {node.department}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111", lineHeight: 1.3 }}>
          {node.courseName}
        </div>
        {node.status && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <StatusDot status={node.status} />
            <span
              style={{
                fontSize: 12,
                color: STATUS_COLORS[node.status] ?? "#888",
                fontWeight: 500,
              }}
            >
              {node.status}
            </span>
          </div>
        )}
      </div>
      {node.description && (
        <div
          style={{
            padding: "10px 16px",
            borderBottom: hasPrereqs || hasAdvancedPrep ? "1px solid #f0f0f0" : "none",
            fontSize: 13,
            color: "#444",
            lineHeight: 1.55,
          }}
        >
          {node.description}
        </div>
      )}
      {hasPrereqs && (
        <div
          style={{
            padding: "10px 16px",
            borderBottom: hasAdvancedPrep ? "1px solid #f0f0f0" : "none",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 6,
            }}
          >
            Enforced Prerequisites
          </div>
          {node.prerequisites.map((p, i) => (
            <div key={i} style={{ fontSize: 13, color: "#222", padding: "2px 0" }}>
              {p}
            </div>
          ))}
        </div>
      )}
      {hasAdvancedPrep && (
        <div style={{ padding: "10px 16px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 6,
            }}
          >
            Additional Info
          </div>
          {node.advancedPrep.map((p, i) => (
            <div key={i} style={{ fontSize: 13, color: "#222", padding: "2px 0" }}>
              {p}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function NodeDetailCard({ node, anchorRect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  if (!node || !anchorRect) return null;

  const GAP = 12;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = anchorRect.right + GAP;
  if (left + CARD_WIDTH > viewportWidth - 8) {
    left = anchorRect.left - CARD_WIDTH - GAP;
  }

  const estimatedHeight = 320;
  let top = anchorRect.top + anchorRect.height / 2 - estimatedHeight / 2;
  top = Math.max(8, Math.min(top, viewportHeight - estimatedHeight - 8));

  const isCategory = node.type === "category" || node.type === "overarching";

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left,
        top,
        width: CARD_WIDTH,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        zIndex: 1000,
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {isCategory ? (
        <CategoryCard node={node} onClose={onClose} />
      ) : (
        <CourseCard node={node} onClose={onClose} />
      )}
    </div>
  );
}
