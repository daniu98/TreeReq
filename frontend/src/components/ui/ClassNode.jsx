import { calcFontSize, LABEL_MAX_PX, LABEL_MIN_PX } from "./nodeUtils.js";
import completedIcon from "../../assets/completed-icon.svg";
import inProgressIcon from "../../assets/in-progress-icon.svg";
import plannedIcon from "../../assets/planned-icon.svg";
import unfulfilledIcon from "../../assets/unfulfilled-icon.svg";

const INNER_WIDTH_CIRCLE = 126;
const INNER_WIDTH_CARD = 126;

const STATUS_COLORS = {
  Completed: "#348162",
  "In Progress": "#84b10f",
  Planned: "#8ecd9b",
  Unfulfilled: "#9a9a9a",
};

const STATUS_ICONS = {
  Completed: completedIcon,
  "In Progress": inProgressIcon,
  Planned: plannedIcon,
  Unfulfilled: unfulfilledIcon,
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

const cardStyles = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "2px 24px 2px 2px",
    borderRadius: "50px",
    boxSizing: "border-box",
    border: "2px solid var(--border-color, #3b82f6)",
    cursor: "pointer",
    gap: "12px",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: "4px",
    width: "125px",
    height: "75px",
    borderRadius: "50%",
    boxSizing: "border-box",
    flexShrink: 0,
    background: "#ffffff",
  },
  courseName: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: 700,
    lineHeight: "normal",
    color: "#000000",
    textAlign: "left",
    wordBreak: "break-word",
    margin: 0,
  },
  status: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "normal",
    color: "rgba(0,0,0,0.4)",
    textAlign: "left",
    letterSpacing: "0.5px",
    margin: 0,
  },
};

function ClassNodeCircle({
  courseName,
  color,
  department,
  prereqs = [],
  isPrereqFor = [],
  onClick,
}) {
  const labelSize = calcFontSize(courseName, LABEL_MAX_PX, LABEL_MIN_PX, INNER_WIDTH_CIRCLE);

  return (
    <div
      style={{ ...circleStyles.wrapper, "--border-color": color, "--bg": color }}
      onClick={onClick}
      data-department={department}
      data-prereqs={JSON.stringify(prereqs)}
      data-unlocks={JSON.stringify(isPrereqFor)}
    >
      <div style={circleStyles.inner}>
        <span style={circleStyles.department}>{department}</span>
        <span style={{ ...circleStyles.courseName, fontSize: `${labelSize}px` }}>{courseName}</span>
      </div>
    </div>
  );
}

function ClassNodeStatusCard({
  courseName,
  status,
  department,
  prereqs = [],
  isPrereqFor = [],
  onClick,
}) {
  const borderColor = STATUS_COLORS[status] ?? "#3b82f6";
  const iconSrc = STATUS_ICONS[status];
  const labelSize = calcFontSize(courseName, LABEL_MAX_PX, LABEL_MIN_PX, INNER_WIDTH_CARD);

  return (
    <div
      style={{ ...cardStyles.wrapper, "--border-color": borderColor }}
      onClick={onClick}
      data-department={department}
      data-prereqs={JSON.stringify(prereqs)}
      data-unlocks={JSON.stringify(isPrereqFor)}
      data-status={status}
    >
      {iconSrc ? <img src={iconSrc} alt="" style={{ paddingLeft: "15px" }} /> : null}
      <div style={cardStyles.inner}>
        <span style={{ ...cardStyles.courseName, fontSize: `${labelSize}px` }}>{courseName}</span>
        <span style={cardStyles.status}>{status}</span>
      </div>
    </div>
  );
}

/**
 * Renders a class/course node. With `status`, uses the pill layout (Completed / In Progress / Planned / Unfulfilled).
 * Without `status`, uses the circular colored node (supply `color`).
 */
export function ClassNode({
  courseName,
  color,
  status,
  department,
  prereqs = [],
  isPrereqFor = [],
  onClick,
}) {
  if (status && STATUS_COLORS[status] !== undefined) {
    return (
      <ClassNodeStatusCard
        courseName={courseName}
        status={status}
        department={department}
        prereqs={prereqs}
        isPrereqFor={isPrereqFor}
        onClick={onClick}
      />
    );
  }

  return (
    <ClassNodeCircle
      courseName={courseName}
      color={color}
      department={department}
      prereqs={prereqs}
      isPrereqFor={isPrereqFor}
      onClick={onClick}
    />
  );
}
