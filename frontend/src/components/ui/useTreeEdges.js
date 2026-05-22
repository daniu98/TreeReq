import { useLayoutEffect, useState, useCallback } from "react";
import {
  getRectAnchor,
  shortenLine,
  SPINE_RADIUS,
  CATEGORY_RADIUS,
  COURSE_RADIUS,
} from "./treeGeometry.js";

const SPINE_COLOR = "#85B110";
const BRANCH_COLOR = "#358162";
const PREREQ_COLOR = "#9A9A9A";

export function useTreeEdges(canvasRef, edgeSpecs, deps = []) {
  const [edges, setEdges] = useState([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !edgeSpecs?.length) {
      setEdges([]);
      setReady(false);
      return;
    }

    const w = Math.max(canvas.scrollWidth, canvas.offsetWidth);
    const h = Math.max(canvas.scrollHeight, canvas.offsetHeight);
    setSize({ width: w, height: h });

    const nodes = canvas.querySelectorAll("[data-tree-node]");
    const byId = new Map();
    nodes.forEach((el) => {
      const id = el.getAttribute("data-tree-node");
      if (id) byId.set(id, el);
    });

    const built = [];

    for (const spec of edgeSpecs) {
      const fromEl = byId.get(spec.from);
      const toEl = byId.get(spec.to);
      if (!fromEl || !toEl) continue;

      const padFrom =
        spec.padFrom ??
        (spec.kind === "spine"
          ? SPINE_RADIUS
          : spec.kind === "prereq"
            ? COURSE_RADIUS
            : CATEGORY_RADIUS);
      const padTo =
        spec.padTo ??
        (spec.kind === "spine"
          ? SPINE_RADIUS
          : spec.kind === "prereq"
            ? COURSE_RADIUS
            : CATEGORY_RADIUS);

      const a = getRectAnchor(fromEl, canvas, spec.fromSide || "right");
      const b = getRectAnchor(toEl, canvas, spec.toSide || "left");
      if (!a || !b) continue;

      const color =
        spec.color ||
        (spec.kind === "spine"
          ? SPINE_COLOR
          : spec.kind === "prereq"
            ? PREREQ_COLOR
            : BRANCH_COLOR);

      if (spec.kind === "branch") {
        const line = shortenLine(a.x, a.y, b.x, b.y, padFrom, padTo);
        const midY = (line.y1 + line.y2) / 2;
        built.push({
          id: spec.id,
          kind: "elbow",
          d: `M ${line.x1} ${line.y1} L ${line.x1} ${midY} L ${line.x2} ${midY} L ${line.x2} ${line.y2}`,
          color,
          width: 3,
        });
        continue;
      }

      const line = shortenLine(a.x, a.y, b.x, b.y, padFrom, padTo);
      built.push({
        id: spec.id,
        kind: spec.kind,
        ...line,
        color,
        width: spec.kind === "spine" ? 4 : spec.kind === "prereq" ? 2.5 : 3,
        dotStart: spec.kind === "spine",
        dotEnd: spec.kind === "spine",
        arrowEnd: spec.kind === "prereq",
        dashed: spec.kind === "stem",
      });
    }

    setEdges(built);
    setReady(built.length > 0 && w > 200);
  }, [canvasRef, edgeSpecs]);

  useLayoutEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) measure();
    };

    run();
    const t1 = requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });

    const canvas = canvasRef.current;
    if (!canvas) {
      return () => {
        cancelled = true;
        cancelAnimationFrame(t1);
      };
    }

    const ro = new ResizeObserver(() => run());
    ro.observe(canvas);
    window.addEventListener("resize", run);

    return () => {
      cancelled = true;
      cancelAnimationFrame(t1);
      ro.disconnect();
      window.removeEventListener("resize", run);
    };
  }, [measure, ...deps]);

  return { edges, size, ready };
}
