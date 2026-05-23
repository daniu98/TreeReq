/** Anchor on a node for connector lines (coordinates relative to container). */

export function getRectAnchor(el, containerEl, side) {
  if (!el || !containerEl) return null;

  const r = el.getBoundingClientRect();
  const c = containerEl.getBoundingClientRect();
  const scrollLeft = containerEl.scrollLeft || 0;
  const scrollTop = containerEl.scrollTop || 0;

  const left = r.left - c.left + scrollLeft;
  const top = r.top - c.top + scrollTop;
  const cx = left + r.width / 2;
  const cy = top + r.height / 2;

  switch (side) {
    case "left":
      return { x: left, y: cy };
    case "right":
      return { x: left + r.width, y: cy };
    case "top":
      return { x: cx, y: top };
    case "bottom":
      return { x: cx, y: top + r.height };
    case "center":
      return { x: cx, y: cy };
    default:
      return { x: cx, y: cy };
  }
}

export function shortenLine(x1, y1, x2, y2, padStart = 0, padEnd = 0) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    x1: x1 + ux * padStart,
    y1: y1 + uy * padStart,
    x2: x2 - ux * padEnd,
    y2: y2 - uy * padEnd,
  };
}

export const SPINE_RADIUS = 105;
export const CATEGORY_RADIUS = 115;
export const COURSE_RADIUS = 40;
