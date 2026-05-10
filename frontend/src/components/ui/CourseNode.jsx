import { calcFontSize, LABEL_MAX_PX, LABEL_MIN_PX } from "./nodeUtils.js";
import completedIcon from "../../assets/completed-icon.svg";
import inProgressIcon from "../../assets/in-progress-icon.svg";
import plannedIcon from "../../assets/planned-icon.svg";
import unfulfilledIcon from "../../assets/unfulfilled-icon.svg";
const NODE_DIAMETER = 200;
const INNER_WIDTH = 126;

const styles = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "2px 24px 2px 2px",
    borderRadius: "50px",
    boxSizing: "border-box",
    border: "2px solid var(--border-color, #3b82f6)",
    cursor: "pointer",
    gap: "12px"  
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
    background: "var(--bg, #3b82f6)",
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
    fontWeight: 0,
    lineHeight: "normal",
    color: "rgba(0,0,0,0.4)",
    textAlign: "left",
    letterSpacing: "0.5px",
    margin: 0,
  },
};

export function CourseNode({
  courseName,
  status, // "Completed", "In Progress", "Planned", or "Unfulfilled"
  department,                    // * hidden: used for filtering/metadata
  prereqs = [],                    // * hidden: array of prerequisite course IDs
  isPrereqFor = [],                // * hidden: array of courses this unlocks
  onClick,
}) {
   const labelSize = calcFontSize(courseName, LABEL_MAX_PX, LABEL_MIN_PX, INNER_WIDTH);
    const colorDict = { "Completed": "#348162", "In Progress": "#84b10f", "Planned": "#8ecd9b", "Unfulfilled": "#9a9a9a"}
    const imgDict = { "Completed": completedIcon, "In Progress": inProgressIcon, "Planned": plannedIcon, "Unfulfilled": unfulfilledIcon}
  return (
    <div 
      style={{ ...styles.wrapper, "--border-color": colorDict[status], "--bg": "ffffff" }}
      onClick={onClick}
      data-department={department}
      data-prereqs={JSON.stringify(prereqs)}
      data-unlocks={JSON.stringify(isPrereqFor)}
      data-status={status}	
    >
      <img src={imgDict[status]} style={{ paddingLeft: '15px' }}/>
      <div style={styles.inner}>
        <span style={{ ...styles.courseName, fontSize: `${labelSize}px` }}>
          {courseName}
        </span>
	<span style={styles.status}>{status}</span>
      </div>
    </div>
  );
}
