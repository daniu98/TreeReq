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
    border: "7px solid var(--border-color, #85b110)",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "172px",
    height: "172px",
    borderRadius: "50%",
    padding: "23px",
    boxSizing: "border-box",
    flexShrink: 0,
    background: "var(--bg, linear-gradient(180deg, #85b110 0%, #358162 100%))",
  },
  name: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: 700,
    lineHeight: "normal",
    color: "#ffffff",
    textAlign: "center",
    wordBreak: "break-word",
    margin: 0,
  },
  completion: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "normal",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    margin: 0,
  },
};

export function CategoryNode({
  categoryName,
  color,
  classNodesUnderCategory,        // * hidden: array of class node IDs
  completionPercentage = null,    // ^ optional: "75%" or number
}) {
  const labelSize = calcFontSize(categoryName, LABEL_MAX_PX, LABEL_MIN_PX, INNER_WIDTH);
  
  // Parse completion for display
  const completionText = completionPercentage != null 
    ? (typeof completionPercentage === "number" 
        ? `${Math.round(completionPercentage)}% complete` 
        : completionPercentage)
    : null;

  return (
    <div style={{ ...styles.wrapper, "--border-color": color, "--bg": color }}>
      <div style={styles.inner}>
        <span style={{ ...styles.name, fontSize: `${labelSize}px` }}>
          {categoryName}
        </span>
        {completionText && (
          <span style={styles.completion}>{completionText}</span>
        )}
      </div>
    </div>
  );
}
