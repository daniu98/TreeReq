import { calcFontSize, LABEL_MAX_PX, LABEL_MIN_PX } from "./nodeUtils.js";

const INNER_WIDTH_CIRCLE = 126;

const STATUS_DOT_COLOR = {
  Completed:   "#348162",
  "In Progress": "#84b10f",
  Planned:     "#8ecd9b",
  Unfulfilled: "#c8c8c8",
};

const STATUS_BORDER_COLOR = {
  Completed:   "#b0d9c8",
  "In Progress": "#d8edaa",
  Planned:     "#cde8d4",
  Unfulfilled: "#e0e0e0",
};

const circleStyles = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px",
    borderRadius: "50%",
    boxSizing: "border-box",
    border: "7px solid var(--border-color, #3b82f6)",
    cursor: "pointer",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    width: "172px",
    height: "172px",
    borderRadius: "50%",
    padding: "23px",
    boxSizing: "border-box",
    flexShrink: 0,
    background: "var(--bg, #3b82f6)",
  },
  courseName: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: 700,
    lineHeight: "normal",
    color: "#ffffff",
    textAlign: "center",
    wordBreak: "break-word",
    margin: 0,
  },
  department: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "11px",
    fontWeight: 500,
    lineHeight: "normal",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: 0,
  },
};

function ClassNodeCircle({ courseName, color, department, onClick }) {
  const labelSize = calcFontSize(courseName, LABEL_MAX_PX, LABEL_MIN_PX, INNER_WIDTH_CIRCLE);
  return (
    <div
      style={{ ...circleStyles.wrapper, "--border-color": color, "--bg": color }}
      onClick={onClick}
    >
      <div style={circleStyles.inner}>
        <span style={circleStyles.department}>{department}</span>
        <span style={{ ...circleStyles.courseName, fontSize: `${labelSize}px` }}>{courseName}</span>
      </div>
    </div>
  );
}

// Minimal pill matching the reference design:
// small status dot + course code text, thin border, ~26px tall
function ClassNodeStatusCard({ courseName, status, onClick }) {
  const dotColor    = STATUS_DOT_COLOR[status]    ?? STATUS_DOT_COLOR.Unfulfilled;
  const borderColor = STATUS_BORDER_COLOR[status] ?? STATUS_BORDER_COLOR.Unfulfilled;

  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 12px 5px 8px",
        borderRadius: 50,
        border: `1.5px solid ${borderColor}`,
        background: "#fff",
        gap: 7,
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: dotColor,
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11.5,
        fontWeight: 600,
        color: "#333",
        letterSpacing: "0.1px",
      }}>
        {courseName}
      </span>
    </div>
  );
}

/**
 * Renders a class/course node.
 * With `status` → minimal pill (dot + course code).
 * Without `status` → circular colored node.
 */
export function ClassNode({ courseName, color, status, department, onClick }) {
  if (status && STATUS_DOT_COLOR[status] !== undefined) {
    return <ClassNodeStatusCard courseName={courseName} status={status} onClick={onClick} />;
  }
  return <ClassNodeCircle courseName={courseName} color={color} department={department} onClick={onClick} />;
}
