/**
 * Cross-branch prerequisite edge: dashed bezier curve from a course in one
 * branch to a course in another. Distinct color and dashed stroke set it
 * apart from the structural tree edges.
 */
export function PrereqEdge({
  source,
  target,
  color = "#2764A6",
  strokeWidth = 2,
}) {
  const sx = source.x + source.width / 2;
  const sy = source.y;
  const tx = target.x - target.width / 2;
  const ty = target.y;

  // Bezier control points: pull horizontally so the curve eases in/out.
  const dx = Math.max(60, Math.abs(tx - sx) / 2);
  const c1x = sx + dx;
  const c1y = sy;
  const c2x = tx - dx;
  const c2y = ty;

  const path = `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${tx},${ty}`;

  return (
    <g>
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray="6 5"
        strokeLinecap="round"
        opacity={0.85}
      />
      <polygon
        points={`${tx},${ty} ${tx - 8},${ty - 5} ${tx - 8},${ty + 5}`}
        fill={color}
        opacity={0.85}
      />
    </g>
  );
}
