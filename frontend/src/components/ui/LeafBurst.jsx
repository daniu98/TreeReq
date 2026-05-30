import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const COLORS = ["#358162", "#85B110", "#8FCE9C", "#5a9e6e", "#4caf7d", "#a8d5b5"];
const COUNT = 16;

function rand(min, max) { return min + Math.random() * (max - min); }

function LeafSvg({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 26" fill="none">
      <path
        d="M10 1 C6 1 1 5.5 1 12 C1 18 5.5 25 10 25 C14.5 25 19 18 19 12 C19 5.5 14 1 10 1Z"
        fill={color}
      />
      <line x1="10" y1="3" x2="10" y2="23" stroke="rgba(255,255,255,0.38)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="10" y1="10" x2="6" y2="14" stroke="rgba(255,255,255,0.22)" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="10" y1="14" x2="14" y2="18" stroke="rgba(255,255,255,0.22)" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

function LeafParticle({ originX, originY, tx, ty, size, color, spin, delay, onDone }) {
  const [flying, setFlying] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFlying(true), delay + 16);
    const t2 = setTimeout(() => { setGone(true); onDone(); }, delay + 950);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (gone) return null;

  return (
    <div style={{
      position: "fixed",
      left: originX - size / 2,
      top: originY - size / 2,
      pointerEvents: "none",
      zIndex: 9999,
      transform: flying
        ? `translate(${tx}px, ${ty}px) rotate(${spin}deg) scale(0)`
        : "translate(0,0) rotate(0deg) scale(1)",
      opacity: flying ? 0 : 1,
      transition: flying
        ? `transform 820ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 580ms ease-in ${delay + 220}ms`
        : "none",
      willChange: "transform, opacity",
    }}>
      <LeafSvg color={color} size={size} />
    </div>
  );
}

export function LeafBurst({ x, y, onDone }) {
  const [leaves] = useState(() =>
    Array.from({ length: COUNT }, (_, i) => {
      const baseAngle = (i / COUNT) * Math.PI * 2;
      const angle = baseAngle + rand(-0.25, 0.25);
      const dist = rand(55, 140);
      return {
        id: i,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: rand(11, 20),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        spin: rand(-400, 400),
        delay: rand(0, 90),
      };
    })
  );

  const [remaining, setRemaining] = useState(COUNT);

  useEffect(() => {
    if (remaining === 0) onDone?.();
  }, [remaining, onDone]);

  return createPortal(
    <>
      {leaves.map((leaf) => (
        <LeafParticle
          key={leaf.id}
          originX={x}
          originY={y}
          tx={leaf.tx}
          ty={leaf.ty}
          size={leaf.size}
          color={leaf.color}
          spin={leaf.spin}
          delay={leaf.delay}
          onDone={() => setRemaining((n) => n - 1)}
        />
      ))}
    </>,
    document.body
  );
}
