/**
 * Inline status icons used by ClassNode and CategoryNode.
 *
 * Prop semantics:
 *   bg    = circle background color (the visible outer disc)
 *   color = symbol color inside the disc
 *   size  = diameter in px (disc + inner symbol scale together)
 *
 * CategoryNode calls each icon with the node's accent color as bg and white as color,
 * except Incomplete which uses bg="transparent" (the icon path itself draws the disc).
 * ClassNode uses default props (bg = accent, color = white).
 */

function CircleWrap({ bg, size = 48, children }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Complete — colored disc (bg) + white checkmark (color).
 * Checkmark from Figma node 3082-20502: vertices (0,6)→(6,12)→(18,0), stroke 4.8px rounded,
 * centered in a 40×40 viewBox.
 */
export function IconCompleted({ size = 48, bg = "#358162", color = "#ffffff" }) {
  const strokeW = (size / 40) * 4.8;
  return (
    <CircleWrap bg={bg} size={size}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path
          d="M11 20L17 26L29 14"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </CircleWrap>
  );
}

/**
 * In-progress — colored disc (bg) + pencil icon (color).
 * MDI pencil path from Figma node 3082-20505, viewBox 22.503×22.503.
 * CategoryNode: bg="#ffffff" color="#85B110" (white disc, green pencil).
 * ClassNode default: bg="#85B110" color="#ffffff" (green disc, white pencil).
 */
export function IconInProgress({ size = 48, bg = "#85B110", color = "#ffffff" }) {
  const pencilSize = Math.round(size * 0.625); // ~30px at 48px
  return (
    <CircleWrap bg={bg} size={size}>
      <svg width={pencilSize} height={pencilSize} viewBox="0 0 22.503 22.503" fill="none">
        <path
          d="M22.1375 5.05312C22.625 4.56563 22.625 3.75313 22.1375 3.29063L19.2125 0.365625C18.75 -0.121875 17.9375 -0.121875 17.45 0.365625L15.15 2.65312L19.8375 7.34062M0 17.8156L0 22.5031L4.6875 22.5031L18.5125 8.66563L13.825 3.97812L0 17.8156Z"
          fill={color}
          fillRule="nonzero"
        />
      </svg>
    </CircleWrap>
  );
}

export function IconPlanned({ size = 48, bg = "#8FCE9C", color = "#ffffff" }) {
  const inner = size * 0.6;
  return (
    <CircleWrap bg={bg} size={size}>
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill={color}>
        <path d="M6 3h12v18l-6-4-6 4V3z" />
      </svg>
    </CircleWrap>
  );
}

/**
 * Incomplete — transparent wrapper; the path itself draws a white circle with
 * a plus-shaped cutout rotated 45° (becomes an X).
 * Matches Figma node 3082-20533: circle-with-plus path, white fill, NONZERO winding,
 * rotated 45° so the plus arms become diagonal.
 */
export function IconUnfulfilled({ size = 48, bg = "#9A9A9A", color = "#ffffff" }) {
  const inner = Math.round(size * 0.833); // 40px at 48px
  return (
    <CircleWrap bg={bg} size={size}>
      <svg
        width={inner}
        height={inner}
        viewBox="0 0 40 40"
        fill="none"
        style={{ transform: "rotate(45deg)", flexShrink: 0 }}
      >
        <path
          d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM28 22L22 22L22 28C22 29.1 21.1 30 20 30C18.9 30 18 29.1 18 28L18 22L12 22C10.9 22 10 21.1 10 20C10 18.9 10.9 18 12 18L18 18L18 12C18 10.9 18.9 10 20 10C21.1 10 22 10.9 22 12L22 18L28 18C29.1 18 30 18.9 30 20C30 21.1 29.1 22 28 22Z"
          fill={color}
          fillRule="nonzero"
        />
      </svg>
    </CircleWrap>
  );
}
