/**
 * Inline status icons used by ClassNode and CategoryNode. Each icon is a
 * colored circle with a white symbol inside, matching the Figma design.
 * All icons default to 48px and accept custom size/bg/color props.
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

export function IconCompleted({ size = 48, bg = "#358162", color = "#ffffff" }) {
  const inner = size * 0.55;
  return (
    <CircleWrap bg={bg} size={size}>
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12.5L10 17.5L19 7.5"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </CircleWrap>
  );
}

export function IconInProgress({ size = 48, bg = "#85B110", color = "#ffffff" }) {
  const inner = size * 0.6;
  return (
    <CircleWrap bg={bg} size={size}>
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none">
        <path
          d="M16.5 3.5l4 4-12 12H4.5v-4l12-12z"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
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

/** Gray circle with white X — matches Figma "Incomplete" icon. */
export function IconUnfulfilled({ size = 48, bg = "#9A9A9A", color = "#ffffff" }) {
  const inner = size * 0.5;
  return (
    <CircleWrap bg={bg} size={size}>
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none">
        <path
          d="M6 6L18 18M18 6L6 18"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
    </CircleWrap>
  );
}
