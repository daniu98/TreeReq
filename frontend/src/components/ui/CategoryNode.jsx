import { calcFontSize, LABEL_MAX_PX, LABEL_MIN_PX } from "./nodeUtils.js";
import notStartedIcon from "../../assets/not-started.svg";
import inProgressIcon from "../../assets/in-progress.svg";
import completeIcon from "../../assets/complete.svg";

const INNER_WIDTH_OVERARCHING = 121; // 167px inner - 2*23px padding
const INNER_WIDTH_CATEGORY = 164;    // 210px inner - 2*23px padding

// Overarching Category: Figma specs - 7.41px border, 26.7px padding, 167px inner
const stylesOverarching = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "26.7px",
    borderRadius: "50%",
    boxSizing: "border-box",
    border: "7.41px solid var(--border-color, #85b110)",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "167px",
    height: "167px",
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

// Regular Category: Figma specs - 10px border, 5px padding, 210px inner
const stylesCategory = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px",
    borderRadius: "50%",
    boxSizing: "border-box",
    border: "10px solid var(--border-color, rgba(255,255,255,0.5))",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "210px",
    height: "210px",
    borderRadius: "50%",
    padding: "23px",
    boxSizing: "border-box",
    flexShrink: 0,
    background: "var(--bg, #9a9a9a)",
  },
  logo: {
    width: "48px",
    height: "48px",
    display: "block",
    flexShrink: 0,
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
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "normal",
    color: "#ffffff",
    textAlign: "center",
    margin: 0,
  },
};

export function CategoryNode({
  categoryName,
  color,
  type = "category",               // * hidden: "overarching" | "category"
  classNodesUnderCategory,        // * hidden: array of class node IDs
  completionPercentage = 0,         // ^ optional: defaults to 0%
  icon = null,                    // ^ optional: icon asset above category name (category type only)
}) {
  const isOverarching = type === "overarching";
  const styles = isOverarching ? stylesOverarching : stylesCategory;
  const innerWidth = isOverarching ? INNER_WIDTH_OVERARCHING : INNER_WIDTH_CATEGORY;
  
  // Clamp completion to 0-100 range
  const clampedCompletion = Math.max(0, Math.min(100, 
    typeof completionPercentage === "number" 
      ? completionPercentage 
      : parseInt(completionPercentage, 10) || 0));
  
  // Background color based on type and completion
  const defaultOverarchingBg = "linear-gradient(180deg, #85B110 0%, #358162 100%)";
  let bgColor;
  if (!isOverarching) {
    // Category: completion drives background color
    if (clampedCompletion === 0) bgColor = "#9A9A9A";
    else if (clampedCompletion === 100) bgColor = "#358162";
    else bgColor = "#85B110"; // 1-99%
  } else {
    // Overarching: use color prop or default gradient
    bgColor = color || defaultOverarchingBg;
  }
  
  const labelSize = calcFontSize(categoryName, LABEL_MAX_PX, LABEL_MIN_PX, innerWidth);
  
  // Parse completion for display using clamped value (only show for category type)
  const completionText = !isOverarching ? `${clampedCompletion}% complete` : null;

  return (
    <div style={{ ...styles.wrapper, "--border-color": color, "--bg": bgColor }}>
      <div style={styles.inner}>
        {!isOverarching && !icon && (
          <img 
            src={clampedCompletion === 0 ? notStartedIcon : 
                 clampedCompletion === 100 ? completeIcon : 
                 inProgressIcon} 
            alt="" 
            style={styles.logo} 
          />
        )}
        {!isOverarching && icon && <img src={icon} alt="" style={styles.logo} />}
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
