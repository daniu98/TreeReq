/**
 * SVG overlay for degree-tree connectors (spine, branches, prereqs).
 */
export function TreeEdgeLayer({ width, height, edges = [] }) {
  if (!width || !height || edges.length === 0) return null;

  return (
    <svg
      className="vmt-edges"
      width={width}
      height={height}
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {edges.map((edge) => {
        if (edge.kind === "elbow") {
          return (
            <path
              key={edge.id}
              d={edge.d}
              fill="none"
              stroke={edge.color}
              strokeWidth={edge.width ?? 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={edge.dashed ? "6 4" : undefined}
            />
          );
        }

        return (
          <g key={edge.id}>
            <line
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke={edge.color}
              strokeWidth={edge.width ?? 3}
              strokeLinecap="round"
              strokeDasharray={edge.dashed ? "6 4" : undefined}
            />
            {edge.dotStart ? (
              <circle cx={edge.x1} cy={edge.y1} r={(edge.width ?? 3) * 1.6} fill={edge.color} />
            ) : null}
            {edge.dotEnd ? (
              <circle cx={edge.x2} cy={edge.y2} r={(edge.width ?? 3) * 1.6} fill={edge.color} />
            ) : null}
            {edge.arrowEnd ? (
              <polygon
                points={arrowHeadPoints(edge.x2, edge.y2, edge.x1, edge.y1)}
                fill={edge.color}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function arrowHeadPoints(tipX, tipY, fromX, fromY) {
  const dx = tipX - fromX;
  const dy = tipY - fromY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const size = 8;
  const px = -uy;
  const py = ux;
  return [
    [tipX, tipY],
    [tipX - ux * size - px * (size * 0.55), tipY - uy * size - py * (size * 0.55)],
    [tipX - ux * size + px * (size * 0.55), tipY - uy * size + py * (size * 0.55)],
  ]
    .map((p) => p.join(","))
    .join(" ");
}
