import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fetchMajorTree, setCourseCompletion } from "../../services/treeApi.js";
import { enrichTreeResponse } from "../../utils/enrichTreeResponse.js";
import { buildHierarchy } from "./buildHierarchy.js";
import { buildPrereqIndex, deriveStatuses } from "./deriveStatus.js";
import { layoutTree } from "./treeLayout.js";
import { RootNode } from "./RootNode.jsx";
import { SectionNode } from "./SectionNode.jsx";
import { CategoryNode } from "../ui/CategoryNode.jsx";
import { ClassNode, CourseStack } from "../ui/ClassNode.jsx";
import { TreeEdge } from "./TreeEdge.jsx";
import { PrereqEdge } from "./PrereqEdge.jsx";
import { NodeDetailPanel } from "./NodeDetailPanel.jsx";

// How long to hover before the course expands (ms)
const HOVER_EXPAND_DELAY = 500;
// Scale factor when a course is expanded (~33% smaller than original 1.25)
const EXPAND_SCALE = 1.17;

export function DegreeTree({
  majorId,
  majorName,
  mockResponse,
  onFirstCategoryReady,
}) {
  const [apiResponse, setApiResponse] = useState(mockResponse ?? null);
  const [loading, setLoading] = useState(!mockResponse);
  const [error, setError] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // lockedCourseId: clicked course — stays expanded until clicked again or another is clicked
  const [lockedCourseId, setLockedCourseId] = useState(null);
  // hoveredCourseId: course under the pointer — shows arrows immediately
  const [hoveredCourseId, setHoveredCourseId] = useState(null);
  // hoverExpandedId: set after HOVER_EXPAND_DELAY ms — triggers visual enlargement
  const [hoverExpandedId, setHoverExpandedId] = useState(null);
  const hoverTimerRef = useRef(null);
  // Ref mirrors lockedCourseId for synchronous checks in mouse event handlers
  // (React state updates are async, so mouseleave could see stale lockedCourseId)
  const lockedRef = useRef(null);

  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const COLLAPSE_THRESHOLD = 7;

  useEffect(() => {
    if (mockResponse) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMajorTree(majorId)
      .then((res) => {
        if (cancelled) return;
        setApiResponse(res);
        const seed = {};
        for (const n of res.nodes ?? []) {
          if (n.completed === true) seed[n.id] = "completed";
        }
        setStatusMap(seed);
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [majorId, mockResponse]);

  const layout = useMemo(() => {
    if (!apiResponse) return null;
    const enriched = enrichTreeResponse(apiResponse);
    const { root, crossBranchEdges } = buildHierarchy(enriched, majorName);
    const prereqIndex = buildPrereqIndex(enriched.edges ?? []);
    const derived = deriveStatuses(root, statusMap, prereqIndex);
    const positioned = layoutTree(derived, lockedCourseId);
    return { ...positioned, crossBranchEdges, enriched };
  }, [apiResponse, majorName, statusMap, lockedCourseId]);

  const handleStatusChange = useCallback(async (courseId, newStatus) => {
    const prev = statusMap[courseId] ?? "unfulfilled";
    setStatusMap((m) => {
      const copy = { ...m };
      if (newStatus === "unfulfilled") delete copy[courseId];
      else copy[courseId] = newStatus;
      return copy;
    });
    try {
      if (newStatus === "completed") await setCourseCompletion(courseId, true);
      else if (prev === "completed") await setCourseCompletion(courseId, false);
    } catch (err) {
      setStatusMap((m) => {
        const copy = { ...m };
        if (prev === "unfulfilled") delete copy[courseId];
        else copy[courseId] = prev;
        return copy;
      });
    }
  }, [statusMap]);

  const handleNodeClick = useCallback((node) => {
    if (node.kind === "course") {
      clearTimeout(hoverTimerRef.current);
      if (lockedRef.current === node.id) {
        // Unlock: revert to normal hover state
        lockedRef.current = null;
        setLockedCourseId(null);
        setHoveredCourseId(null);
        setHoverExpandedId(null);
      } else {
        // Lock: reuse hover state paths, bypass the delay
        lockedRef.current = node.id;
        setLockedCourseId(node.id);
        setHoveredCourseId(node.id);   // arrows on
        setHoverExpandedId(node.id);   // expand immediately (no timer needed)
      }
    }
    setSelectedNodeId((prev) => prev === node.id ? null : node.id);
  }, []);

  const handleNavigate = useCallback((courseId) => {
    setSelectedNodeId(courseId);
  }, []);

  // While a course is locked, ignore all hover events on other courses so
  // only one course can ever be expanded at a time.
  const handleCourseMouseEnter = useCallback((courseId) => {
    if (lockedRef.current) return;
    setHoveredCourseId(courseId);
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoverExpandedId(courseId), HOVER_EXPAND_DELAY);
  }, []);

  const handleCourseMouseLeave = useCallback(() => {
    if (lockedRef.current) return;
    clearTimeout(hoverTimerRef.current);
    setHoveredCourseId(null);
    setHoverExpandedId(null);
  }, []);

  useEffect(() => {
    if (!layout || !onFirstCategoryReady) return;
    const firstCat = layout.nodes.find((n) => n.kind === "category");
    if (firstCat) onFirstCategoryReady({ x: firstCat.x, y: firstCat.y });
  }, [layout, onFirstCategoryReady]);

  // ── All hooks must run before any early return ────────────────────────────

  const edges = layout?.edges ?? [];

  // Map each category to its direct course children (sorted by Y).
  const categoryDirectCourses = useMemo(() => {
    const map = new Map();
    for (const edge of edges) {
      if (edge.sourceNode.kind === "category" && edge.targetNode.kind === "course") {
        const catId = edge.sourceNode.id;
        if (!map.has(catId)) map.set(catId, []);
        map.get(catId).push(edge.targetNode);
      }
    }
    for (const arr of map.values()) arr.sort((a, b) => a.y - b.y);
    return map;
  }, [edges]);

  // IDs hidden because their category has >threshold courses and is collapsed.
  // ALL courses in such a category are hidden (not just the excess).
  const hiddenNodeIds = useMemo(() => {
    const hidden = new Set();
    for (const [catId, directCourses] of categoryDirectCourses) {
      if (directCourses.length <= COLLAPSE_THRESHOLD) continue;
      if (expandedCategories.has(catId)) continue;
      // Hide every direct course and all its descendants.
      const queue = directCourses.map((n) => n.id);
      while (queue.length) {
        const id = queue.shift();
        if (hidden.has(id)) continue;
        hidden.add(id);
        for (const e of edges) {
          if (e.sourceNode.id === id && e.targetNode.kind === "course")
            queue.push(e.targetNode.id);
        }
      }
    }
    return hidden;
  }, [categoryDirectCourses, expandedCategories, edges]);

  // Stack placeholder — positioned at the category center, shows total count.
  const stackInfo = useMemo(() => {
    const stacks = [];
    for (const [catId, directCourses] of categoryDirectCourses) {
      if (directCourses.length <= COLLAPSE_THRESHOLD) continue;
      if (expandedCategories.has(catId)) continue;
      // Place the stack to the right of the category node.
      const catNode = layout?.nodes?.find((n) => n.id === catId);
      if (!catNode) continue;
      stacks.push({
        catId,
        hiddenCount: directCourses.length,
        x: catNode.x + catNode.width / 2 + 140,
        y: catNode.y,
      });
    }
    return stacks;
  }, [categoryDirectCourses, expandedCategories, layout]);

  // ── Early returns (after all hooks) ───────────────────────────────────────

  if (loading) return (
    <div style={stateStyle.wrap}><p style={stateStyle.text}>Loading {majorName ?? majorId}…</p></div>
  );
  if (error) return (
    <div style={stateStyle.wrap}>
      <p style={{ ...stateStyle.text, color: "#c0392b" }}>Could not load tree: {error.message}</p>
      <p style={{ ...stateStyle.text, fontSize: 13, marginTop: 8 }}>
        Start the backend: <code>uvicorn main:app --reload --port 8001</code>
      </p>
    </div>
  );
  if (!layout) return null;

  const { nodes, crossBranchEdges, totalWidth, totalHeight, nodeById } = layout;
  const selectedNode = selectedNodeId ? nodeById?.get(selectedNodeId) : null;

  // Arrows: show immediately on hover; stay locked after click
  const activeCourseId = lockedCourseId ?? hoveredCourseId;

  const visibleCrossEdges = activeCourseId
    ? (crossBranchEdges ?? []).filter(
        (e) => e.source === activeCourseId || e.target === activeCourseId
      )
    : [];

  return (
    <>
      <div style={{ position: "relative", width: totalWidth, height: totalHeight }}>
        <svg
          width={totalWidth}
          height={totalHeight}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {edges
            .filter((e) => !hiddenNodeIds.has(e.targetNode.id) && !hiddenNodeIds.has(e.sourceNode.id))
            .map((e) => (
              <TreeEdge
                key={e.id}
                source={e.sourceNode}
                target={e.targetNode}
                color={statusMap[e.sourceNode?.id] === "completed" ? "#348162" : "#85b110"}
              />
            ))}
          {visibleCrossEdges.map((e) => {
            const src = nodeById?.get(e.source);
            const tgt = nodeById?.get(e.target);
            if (!src || !tgt) return null;
            return (
              <PrereqEdge
                key={`x:${e.source}->${e.target}`}
                source={src}
                target={tgt}
                color={statusMap[e.source] === "completed" ? "#2a7a4e" : "#2764A6"}
              />
            );
          })}
        </svg>

        {nodes
          .filter((node) => !hiddenNodeIds.has(node.id))
          .map((node) => {
            const isLocked = node.id === lockedCourseId;
            const isHoverExpanded = !lockedCourseId && node.id === hoverExpandedId;
            const isExpanded = isLocked || isHoverExpanded;
            return (
              <PositionedNode
                key={node.id}
                node={node}
                isSelected={node.id === selectedNodeId}
                isExpanded={isExpanded}
                isLocked={isLocked}
                statusMap={statusMap}
                onClick={handleNodeClick}
                onMouseEnter={handleCourseMouseEnter}
                onMouseLeave={handleCourseMouseLeave}
              />
            );
          })}

        {/* Collapsed-category stack placeholders */}
        {stackInfo.map((s) => (
          <div
            key={`stack:${s.catId}`}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              transform: "translate(-50%, 0)",
            }}
          >
            <CourseStack
              hiddenCount={s.hiddenCount}
              onExpand={() =>
                setExpandedCategories((prev) => new Set([...prev, s.catId]))
              }
            />
          </div>
        ))}
      </div>

      {selectedNode && createPortal(
        <NodeDetailPanel
          node={selectedNode}
          statusMap={statusMap}
          nodeById={nodeById}
          onStatusChange={handleStatusChange}
          onNavigate={handleNavigate}
          onClose={() => {
            setSelectedNodeId(null);
            lockedRef.current = null;
            setLockedCourseId(null);
            setHoveredCourseId(null);
            setHoverExpandedId(null);
          }}
        />,
        document.body
      )}
    </>
  );
}

function PositionedNode({ node, isSelected, isExpanded, isLocked, onClick, onMouseEnter, onMouseLeave }) {
  const scale = isExpanded ? EXPAND_SCALE : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: "center center",
        transition: "transform 0.2s ease",
        cursor: "pointer",
        zIndex: isExpanded ? 10 : 1,
      }}
      onClick={() => onClick(node)}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={node.kind === "course" ? () => onMouseEnter(node.id) : undefined}
      onMouseLeave={node.kind === "course" ? () => onMouseLeave() : undefined}
    >
      {renderNode(node, isSelected, isLocked)}
    </div>
  );
}

function renderNode(node, isSelected, isLocked) {
  const circleRing = isSelected
    ? { outline: "3px solid #FFD66B", outlineOffset: 4, borderRadius: "50%" }
    : {};

  switch (node.kind) {
    case "root":
      return <div style={circleRing}><RootNode name={node.data.name} /></div>;

    case "section":
      return <div style={circleRing}><SectionNode name={node.data.name} /></div>;

    case "category":
      return (
        <div style={{ ...circleRing, borderRadius: "50%" }}>
          <CategoryNode
            categoryName={node.data.name}
            completionPercentage={node.completionPercentage}
          />
        </div>
      );

    case "course": {
      const status = courseStatusLabel(node.status);
      const courseRing = isLocked
        ? { outline: "2.5px solid #FFD66B", outlineOffset: 4, borderRadius: 50 }
        : isSelected
        ? { outline: "2px solid #FFD66B", outlineOffset: 3, borderRadius: 50 }
        : {};
      return (
        <div style={courseRing}>
          <ClassNode
            courseName={`${node.data.dept} ${node.data.number}`}
            status={status}
          />
        </div>
      );
    }

    default:
      return null;
  }
}

function courseStatusLabel(s) {
  if (s === "completed")   return "Completed";
  if (s === "in_progress") return "In Progress";
  if (s === "planned")     return "Planned";
  return "Unfulfilled";
}

const stateStyle = {
  wrap: { padding: "48px 24px", textAlign: "center" },
  text: { fontFamily: "Inter, system-ui, sans-serif", fontSize: 15, color: "#666", margin: 0 },
};
