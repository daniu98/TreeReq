import { CategoryNode } from "../ui/CategoryNode.jsx";

/**
 * Section hub (e.g. "Preparation for the Major"). Visually identical to the
 * Figma "overarching category" node — reuses CategoryNode with type="overarching".
 * Outer dimensions: ~189px (167 inner + 2*7.41 border + 2*26.7 padding ≈ 232).
 */
export function SectionNode({ name, isActive = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        outline: isActive ? "4px solid #FFD66B" : "none",
        outlineOffset: 4,
        borderRadius: "50%",
        display: "inline-block",
      }}
    >
      <CategoryNode categoryName={name} type="overarching" />
    </div>
  );
}
