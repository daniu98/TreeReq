import { calcFontSize, LABEL_MAX_PX, LABEL_MIN_PX } from "./nodeUtils.js";
import notStartedIcon from "../../assets/CategoryNode/not-started.svg";
import inProgressIcon from "../../assets/CategoryNode/in-progress.svg";
import completeIcon from "../../assets/CategoryNode/complete.svg";

// Text-area width inside each circle type (inner - 2*innerPadding)
const INNER_WIDTH_OVERARCHING = 94; // 110px inner - 2*8px inner-padding
const INNER_WIDTH_CATEGORY    = 74; //  90px inner - 2*8px inner-padding

// Overarching (section hubs): 110px inner + 2*7px padding + 2*5px border = ~134px total
const stylesOverarching = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px",
    borderRadius: "50%",
    boxSizing: "border-box",
    border: "5px solid var(--border-color, #85b110)",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    padding: "8px",
    boxSizing: "border-box",
    flexShrink: 0,
    background: "var(--bg, linear-gradient(180deg, #85b110 0%, #358162 100%))",
  },
  name: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#ffffff",
    textAlign: "center",
    wordBreak: "break-word",
    margin: 0,
  },
  completion: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "9px",
    fontWeight: 400,
    lineHeight: "normal",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    margin: 0,
  },
};

// Regular category: 90px inner + 2*4px padding + 2*5px border = ~108px total
const stylesCategory = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    borderRadius: "50%",
    boxSizing: "border-box",
    border: "5px solid var(--border-color, rgba(255,255,255,0.5))",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    padding: "8px",
    boxSizing: "border-box",
    flexShrink: 0,
    background: "var(--bg, #9a9a9a)",
  },
  logo: {
    width: "22px",
    height: "22px",
    display: "block",
    flexShrink: 0,
  },
  name: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#ffffff",
    textAlign: "center",
    wordBreak: "break-word",
    margin: 0,
  },
  completion: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "9px",
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
  type = "category",
  completionPercentage = 0,
  icon = null,
}) {
  const isOverarching = type === "overarching";
  const styles = isOverarching ? stylesOverarching : stylesCategory;
  const innerWidth = isOverarching ? INNER_WIDTH_OVERARCHING : INNER_WIDTH_CATEGORY;

  const clampedCompletion = Math.max(0, Math.min(100,
    typeof completionPercentage === "number"
      ? completionPercentage
      : parseInt(completionPercentage, 10) || 0));

  let bgColor;
  if (!isOverarching) {
    if (clampedCompletion === 0)   bgColor = "#9A9A9A";
    else if (clampedCompletion === 100) bgColor = "#358162";
    else bgColor = "#85B110";
  } else {
    bgColor = color || "linear-gradient(180deg, #85B110 0%, #358162 100%)";
  }

  const labelSize = calcFontSize(categoryName, LABEL_MAX_PX, LABEL_MIN_PX, innerWidth);
  const completionText = !isOverarching ? `${clampedCompletion}%` : null;

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
