import { useEffect, useRef, useState } from "react";

/**
 * Pan + zoom container. Fills its parent, intercepts pointer drag for panning
 * and wheel events for zooming. Pan offset and zoom level are clamped so the
 * user can't fling the content offscreen.
 *
 * - No scrollbars.
 * - Click + drag to pan.
 * - Mouse wheel / trackpad pinch to zoom (zoom-around-cursor).
 * - Bounds: at least PADDING px of content stays visible on every edge.
 * - Zoom: clamped to [MIN_SCALE, MAX_SCALE].
 */
const PADDING = 80;
const MIN_SCALE = 0.3;
const MAX_SCALE = 2.5;
const WHEEL_ZOOM_STEP = 0.0015; // higher = faster zoom

export function DraggableCanvas({ children, background = "#fafafa" }) {
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // Drag state in refs so pointer move doesn't trigger renders.
  const dragStateRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const sizeRef = useRef({ vw: 0, vh: 0, cw: 0, ch: 0 });
  // Latest values so wheel handler can compute against fresh state.
  const offsetRef = useRef(offset);
  const scaleRef = useRef(scale);
  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  // Measure viewport + natural content size.
  useEffect(() => {
    const measure = () => {
      const v = viewportRef.current;
      const c = contentRef.current;
      if (!v || !c) return;
      sizeRef.current = {
        vw: v.clientWidth,
        vh: v.clientHeight,
        cw: c.scrollWidth,
        ch: c.scrollHeight,
      };
      setOffset((prev) => clampOffset(prev, scaleRef.current, sizeRef.current));
    };
    measure();

    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  // Wheel listener attached non-passively so we can preventDefault and stop
  // browser-level page scroll/zoom from firing.
  useEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    const onWheel = (e) => {
      e.preventDefault();
      const oldScale = scaleRef.current;
      const factor = Math.exp(-e.deltaY * WHEEL_ZOOM_STEP);
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * factor));
      if (newScale === oldScale) return;

      // Zoom around the cursor: keep the world-space point under the cursor
      // fixed in screen space.
      const rect = v.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const oldOffset = offsetRef.current;
      const ratio = newScale / oldScale;
      const newOffset = {
        x: cx - (cx - oldOffset.x) * ratio,
        y: cy - (cy - oldOffset.y) * ratio,
      };
      const clamped = clampOffset(newOffset, newScale, sizeRef.current);
      setScale(newScale);
      setOffset(clamped);
    };
    v.addEventListener("wheel", onWheel, { passive: false });
    return () => v.removeEventListener("wheel", onWheel);
  }, []);

  function clampOffset({ x, y }, s, sizes) {
    const { vw, vh, cw, ch } = sizes;
    const scaledW = cw * s;
    const scaledH = ch * s;
    const minX = Math.min(PADDING, vw - scaledW - PADDING);
    const maxX = Math.max(PADDING, vw - scaledW - PADDING) === minX
      ? PADDING
      : PADDING; // simple: can't drag content past PADDING from left edge
    const minY = Math.min(PADDING, vh - scaledH - PADDING);
    const maxY = PADDING;
    // If content smaller than viewport, allow centering range.
    return {
      x: Math.max(Math.min(minX, maxX), Math.min(Math.max(minX, maxX), x)),
      y: Math.max(Math.min(minY, maxY), Math.min(Math.max(minY, maxY), y)),
    };
  }

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    const ds = dragStateRef.current;
    if (!ds.active) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    setOffset(clampOffset({ x: ds.originX + dx, y: ds.originY + dy }, scaleRef.current, sizeRef.current));
  };

  const endDrag = (e) => {
    if (dragStateRef.current.active) {
      dragStateRef.current.active = false;
      setIsDragging(false);
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    }
  };

  return (
    <div
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        position: "fixed",
        inset: 0,
        background,
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          transformOrigin: "0 0",
          transition: isDragging ? "none" : "transform 120ms ease-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
