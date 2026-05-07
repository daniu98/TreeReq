import { calcFontSize, LABEL_MAX_PX, LABEL_MIN_PX } from "./nodeUtils.js";

const NODE_DIAMETER = 200;
const INNER_WIDTH = 126;

const styles = {
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

export function ClassNode({
  courseName,
  color,
  department,                    // * hidden: used for filtering/metadata
  prereqs = [],                    // * hidden: array of prerequisite course IDs
  isPrereqFor = [],                // * hidden: array of courses this unlocks
  onClick,
}) {
  const labelSize = calcFontSize(courseName, LABEL_MAX_PX, LABEL_MIN_PX, INNER_WIDTH);

  return (
    <div 
      style={{ ...styles.wrapper, "--border-color": color, "--bg": color }}
      onClick={onClick}
      data-department={department}
      data-prereqs={JSON.stringify(prereqs)}
      data-unlocks={JSON.stringify(isPrereqFor)}
    >
      <div style={styles.inner}>
        <span style={styles.department}>{department}</span>
        <span style={{ ...styles.courseName, fontSize: `${labelSize}px` }}>
          {courseName}
        </span>
      </div>
    </div>
  );
}
