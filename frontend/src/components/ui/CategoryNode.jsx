import { calcFontSize, LABEL_MAX_PX, LABEL_MIN_PX } from "./nodeUtils.js";

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
  completionPercentage = null,    // ^ optional: "75%" or number
  icon = null,                    // ^ optional: icon asset above category name (category type only)
}) {
  const isOverarching = type === "overarching";
  const styles = isOverarching ? stylesOverarching : stylesCategory;
  const innerWidth = isOverarching ? INNER_WIDTH_OVERARCHING : INNER_WIDTH_CATEGORY;
  
  const labelSize = calcFontSize(categoryName, LABEL_MAX_PX, LABEL_MIN_PX, innerWidth);
  
  // Parse completion for display
  const completionText = completionPercentage != null 
    ? (typeof completionPercentage === "number" 
        ? `${Math.round(completionPercentage)}% complete` 
        : completionPercentage)
    : null;

  return (
    <div style={{ ...styles.wrapper, "--border-color": color, "--bg": color }}>
      <div style={styles.inner}>
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
