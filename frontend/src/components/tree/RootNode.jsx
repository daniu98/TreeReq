import { CategoryNode } from "../ui/CategoryNode.jsx";

/**
 * Major root node (e.g. "Cognitive Science"). Uses the same overarching circle
 * style as section hubs — 220px gradient ring + gradient fill — at the same
 * scale so all nodes in the tree are visually consistent.
 */
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
      }}
    >
      <CategoryNode categoryName={name} type="overarching" />
    </div>
  );
}
