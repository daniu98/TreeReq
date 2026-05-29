/**
 * Smooth bezier connector. Picks horizontal or vertical orientation based on
 * the dominant axis between source and target, connecting from the nearest
 * edge of each node.
 */
export function TreeEdge({ source, target, color = "#85b110", strokeWidth = 2.5 }) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  let path;

  if (Math.abs(dy) > Math.abs(dx)) {
    // Mostly vertical (section ↔ category): connect top/bottom edges.
    const fromBottom = dy > 0;
    const sx = source.x;
    const sy = fromBottom ? source.y + source.height / 2 : source.y - source.height / 2;
    const tx = target.x;
    const ty = fromBottom ? target.y - target.height / 2 : target.y + target.height / 2;
    const cy = (sy + ty) / 2;
    path = `M ${sx},${sy} C ${sx},${cy} ${tx},${cy} ${tx},${ty}`;
  } else {
    // Mostly horizontal (root → section, category → course): connect left/right edges.
    const toRight = dx > 0;
    const sx = toRight ? source.x + source.width / 2 : source.x - source.width / 2;
    const sy = source.y;
    const tx = toRight ? target.x - target.width / 2 : target.x + target.width / 2;
    const ty = target.y;
    const cx = (sx + tx) / 2;
    path = `M ${sx},${sy} C ${cx},${sy} ${cx},${ty} ${tx},${ty}`;
  }

  return (
    <path
      d={path}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
    />
  );
}
