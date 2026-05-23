import { Tree } from "../ui/Tree.jsx";
import { getTreeNodes } from "../../data/mockTrees.js";

const font = { fontFamily: "var(--font-ui)", fontWeight: 400 };

export default function TreeViewMain({ tree, onBack }) {
  if (!tree) {
    return (
      <main style={{ flex: 1, padding: "36px 40px", ...font }}>
        <button type="button" onClick={onBack} style={backBtnStyle}>
          ← Back
        </button>
        <p>Tree not found.</p>
      </main>
    );
  }

  const nodes = getTreeNodes(tree.id);

  return (
    <main
      style={{
        flex: 1,
        position: "relative",
        background: "#fff",
        overflow: "auto",
        minWidth: 0,
        padding: "36px 40px 48px",
      }}
    >
      <button type="button" onClick={onBack} style={backBtnStyle}>
        ← Back to home
      </button>

      <header style={{ marginBottom: 32 }}>
        <h1 style={{ color: "#000", fontSize: 28, fontWeight: 400, margin: "0 0 8px", ...font }}>
          {tree.name}
        </h1>
        {tree.major ? (
          <p style={{ color: "#7C7C7C", fontSize: 16, margin: 0, ...font }}>{tree.major}</p>
        ) : null}
        <p style={{ color: "#9A9A9A", fontSize: 14, margin: "12px 0 0", ...font }}>
          Preview — full tree data will load from the server later.
        </p>
      </header>

      <TreeCanvas>
        <Tree nodes={nodes} />
      </TreeCanvas>
    </main>
  );
}

function TreeCanvas({ children }) {
  return (
    <div
      style={{
        padding: "24px",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: 16,
        border: "1px solid #EAEAEA",
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}

const backBtnStyle = {
  border: "none",
  background: "transparent",
  color: "#2764A6",
  fontSize: 15,
  fontFamily: "var(--font-ui)",
  cursor: "pointer",
  marginBottom: 20,
  padding: 0,
};
