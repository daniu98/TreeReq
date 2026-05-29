import { calcFontSize, LABEL_MAX_PX, LABEL_MIN_PX } from "./nodeUtils.js";
import completedIcon from "../../assets/completed-icon.svg";
import inProgressIcon from "../../assets/in-progress-icon.svg";
import plannedIcon from "../../assets/planned-icon.svg";
import unfulfilledIcon from "../../assets/unfulfilled-icon.svg";

const FONT = "Inter, system-ui, sans-serif";
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
    fontFamily: FONT,
    fontWeight: 700,
    lineHeight: "normal",
    color: "#ffffff",
    textAlign: "center",
    wordBreak: "break-word",
    margin: 0,
  },
  department: {
    fontFamily: FONT,
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
    fontFamily: FONT,
    fontWeight: 700,
    lineHeight: "normal",
    color: "#000000",
    textAlign: "left",
    wordBreak: "break-word",
    margin: 0,
  },
  status: {
    fontFamily: FONT,
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "normal",
    color: "rgba(0,0,0,0.4)",
    textAlign: "left",
    letterSpacing: "0.5px",
    margin: 0,
  },
};

function ClassNodeCircle({ courseName, color, department, prereqs = [], isPrereqFor = [], onClick }) {
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

function ClassNodeStatusCard({ courseName, status, department, prereqs = [], isPrereqFor = [], onClick }) {
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
 * Renders a class/course node. With `status`, uses the pill card layout.
 * Without `status`, uses the circular colored node.
 */
export function ClassNode({ courseName, color, status, department, prereqs = [], isPrereqFor = [], onClick }) {
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

/** Stacked collapsed view for categories with more than 7 courses. */
export function CourseStack({ hiddenCount, onExpand }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onExpand(); }}
      title={`Show all ${hiddenCount} courses`}
      style={{ position: "relative", width: 220, height: 70, cursor: "pointer" }}
    >
      {[2, 1, 0].map((i) => (
        <div key={i} style={{
          position: "absolute",
          top: i * 8,
          left: i * 5,
          right: -i * 5,
          height: 52,
          borderRadius: 50,
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
        {hiddenCount} courses
      </div>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
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
