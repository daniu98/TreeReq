import { useRef, useEffect, useState, useCallback } from "react";
import { CategoryNode } from "./CategoryNode.jsx";
import { ClassNode } from "./ClassNode.jsx";
import { NodeDetailCard } from "./NodeDetailCard.jsx";

const NODE_DIAMETER = 200;
const GAP = 60;

export function Tree({
  nodes = [],
  lineColor = "#85b110",
  lineWidth = 4,
}) {
  const containerRef = useRef(null);
  const nodeRefs = useRef([]);
  const [lines, setLines] = useState([]);
  const [selected, setSelected] = useState(null); // { node, anchorRect }

  const handleNodeClick = useCallback((node, el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSelected((prev) =>
      prev?.node === node ? null : { node, anchorRect: rect }
    );
  }, []);

  useEffect(() => {
    if (!containerRef.current || nodes.length < 2) {
      setLines([]);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();

    const centers = nodeRefs.current.map((el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    });

    const newLines = [];
    for (let i = 0; i < centers.length - 1; i++) {
      const a = centers[i];
      const b = centers[i + 1];
      if (!a || !b) continue;
      const r = NODE_DIAMETER / 2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist;
      const uy = dy / dist;
      newLines.push({
        x1: a.x + ux * r,
        y1: a.y + uy * r,
        x2: b.x - ux * r,
        y2: b.y - uy * r,
      });
    }
    setLines(newLines);
  }, [nodes]);

  const totalWidth = nodes.length * NODE_DIAMETER + (nodes.length - 1) * GAP;

  return (
    <>
    <div
      ref={containerRef}
      style={{ position: "relative", width: totalWidth, height: NODE_DIAMETER }}
    >
      <svg
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
        width={totalWidth}
        height={NODE_DIAMETER}
      >
        {lines.map((l, i) => (
          <g key={i}>
            <line
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={lineColor}
              strokeWidth={lineWidth}
              strokeLinecap="round"
            />
            <circle cx={l.x1} cy={l.y1} r={lineWidth * 1.8} fill={lineColor} />
            <circle cx={l.x2} cy={l.y2} r={lineWidth * 1.8} fill={lineColor} />
          </g>
        ))}
      </svg>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: `${GAP}px`,
          position: "relative",
        }}
      >
        {nodes.map((node, i) => (
          <div
            key={i}
            ref={(el) => (nodeRefs.current[i] = el)}
            style={{ flexShrink: 0 }}
            onClick={() => handleNodeClick(node, nodeRefs.current[i])}
          >
            {node.type === "category" ? (
              <CategoryNode {...node} />
            ) : (
              <ClassNode {...node} />
            )}
          </div>
        ))}
      </div>
    </div>

      {selected && (
        <NodeDetailCard
          node={selected.node}
          anchorRect={selected.anchorRect}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
