import {
  IconCompleted,
  IconInProgress,
  IconPlanned,
  IconUnfulfilled,
} from "../tree/StatusIcons.jsx";

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
