/**
 * Standard parent → child elbow connector. Horizontal jog from the parent's
 * right edge, vertical drop to the child's row, then horizontal into the
 * child's left edge. Arrow head at the destination.
 */
export function TreeEdge({ source, target, color = "#85b110", strokeWidth = 3 }) {
  const inset = strokeWidth / 2;
  const sx = source.x + source.width / 2 - inset;
  const sy = source.y;
  const tx = target.x - target.width / 2 + inset;
  const ty = target.y;

  // Mid-x where the vertical jog happens.
  const midX = sx + (tx - sx) / 2;

  const path = `M ${sx},${sy} L ${midX},${sy} L ${midX},${ty} L ${tx},${ty}`;

  return (
    <path
      d={path}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
