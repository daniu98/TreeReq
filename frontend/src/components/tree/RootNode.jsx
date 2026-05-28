import { CategoryNode } from "../ui/CategoryNode.jsx";

/**
 * Major root node (e.g. "Cognitive Science"). Same overarching circle style
 * as section hubs but at ~50% scale. Reuses CategoryNode wrapped in a
 * CSS transform so all visual specs (gradient, border, typography) stay
 * Figma-accurate.
 */
const SCALE = 0.82;

export function RootNode({ name, isActive = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        outline: isActive ? "4px solid #FFD66B" : "none",
        outlineOffset: 2,
        borderRadius: "50%",
        display: "inline-block",
        transform: `scale(${SCALE})`,
        transformOrigin: "center",
      }}
    >
      <CategoryNode categoryName={name} type="overarching" />
    </div>
  );
}
