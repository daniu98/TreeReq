import {
  IconCompleted,
  IconInProgress,
  IconPlanned,
  IconUnfulfilled,
} from "../tree/StatusIcons.jsx";

const FONT = '"Google Sans Flex", Inter, system-ui, sans-serif';

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

/**
 * StackSlotNode — visual pill for a "choose N" slot.
 *
 * Unassigned: dashed gray border, slot number disc, "Select Course" label.
 * Assigned:   identical to ClassNode — solid border color reflects status.
 */
export function StackSlotNode({ slotIndex, chooseN, assignedCourseId, status }) {
  if (!assignedCourseId) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "5px 30px 5px 20px",
          height: 85,
          boxSizing: "border-box",
          background: "#fafafa",
          border: "1.5px dashed #BDBDBD",
          borderRadius: 100,
          whiteSpace: "nowrap",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Slot number disc */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "2px dashed #BDBDBD",
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: "#BDBDBD" }}>
            {slotIndex + 1}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: "#BDBDBD", lineHeight: 1 }}>
            Select Course
          </span>
          <span style={{ fontFamily: FONT, fontSize: 16, color: "#BDBDBD", lineHeight: 1 }}>
            Slot {slotIndex + 1} of {chooseN}
          </span>
        </div>
      </div>
    );
  }

  // Assigned — looks identical to ClassNode
  const norm = normaliseStatus(status);
  const border = STATUS_BORDER[norm];
  const label = STATUS_LABEL[norm];

  return (
    <div
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
        whiteSpace: "nowrap",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <StatusIcon status={norm} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: "#000", lineHeight: 1 }}>
          {assignedCourseId}
        </span>
        <span style={{ fontFamily: FONT, fontSize: 16, color: "#9A9A9A", lineHeight: 1 }}>
          {label}
        </span>
      </div>
    </div>
  );
}
