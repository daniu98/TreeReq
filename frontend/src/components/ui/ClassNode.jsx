import {
  IconCompleted,
  IconInProgress,
  IconPlanned,
  IconUnfulfilled,
} from "../tree/StatusIcons.jsx";

const FONT = "Inter, system-ui, sans-serif";

/** Stacked collapsed view shown when a category has more than 7 courses. */
export function CourseStack({ hiddenCount, onExpand }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onExpand(); }}
      title={`Show ${hiddenCount} more courses`}
      style={{ position: "relative", width: 220, height: 70, cursor: "pointer" }}
    >
      {[2, 1, 0].map((i) => (
        <div key={i} style={{
          position: "absolute",
          top: i * 8,
          left: i * 5,
          right: -i * 5,
          height: 52,
          borderRadius: 999,
          border: "2px solid #d0d0d0",
          background: i === 0 ? "#fff" : "#f5f5f5",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }} />
      ))}
      <div style={{
        position: "absolute",
        top: -8,
        right: 6,
        background: "#348162",
        color: "#fff",
        borderRadius: 12,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: FONT,
      }}>
        +{hiddenCount} more
      </div>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        color: "#888",
      }}>
        Click to expand
      </div>
    </div>
  );
}

/**
 * Course pill matching the Figma "Course Node" design: a horizontal white
 * pill with a colored status icon on the left and the course name + status
 * label on the right. Border color varies by status.
 *
 * Status accepted (case-insensitive): Completed, In Progress, Planned,
 * Unfulfilled (alias: Incomplete).
 */
const STATUS_BORDER = {
  Completed:    "#358162",
  "In Progress": "#85B110",
  Planned:      "#8FCE9C",
  Unfulfilled:  "#9A9A9A",
};

const STATUS_LABEL = {
  Completed:    "Completed",
  "In Progress": "In progress",
  Planned:      "Planned",
  Unfulfilled:  "Unfulfilled",
};

function normaliseStatus(s) {
  if (!s) return "Unfulfilled";
  const lower = String(s).toLowerCase();
  if (lower === "completed" || lower === "complete") return "Completed";
  if (lower === "in progress" || lower === "in_progress") return "In Progress";
  if (lower === "planned") return "Planned";
  return "Unfulfilled";
}

function StatusIcon({ status }) {
  switch (status) {
    case "Completed":   return <IconCompleted />;
    case "In Progress": return <IconInProgress />;
    case "Planned":     return <IconPlanned />;
    default:            return <IconUnfulfilled />;
  }
}

export function ClassNode({ courseName, status, onClick, onMouseEnter, onMouseLeave }) {
  const norm = normaliseStatus(status);
  const border = STATUS_BORDER[norm];
  const label = STATUS_LABEL[norm];

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "5px 30px 5px 20px",
        height: 85,
        boxSizing: "border-box",
        background: "#ffffff",
        border: `1.5px solid ${border}`,
        borderRadius: 100,
        cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <StatusIcon status={norm} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#000",
            lineHeight: 1,
          }}
        >
          {courseName}
        </span>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 16,
            color: "#9A9A9A",
            lineHeight: 1,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
