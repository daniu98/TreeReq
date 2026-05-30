import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fetchMajorTree, fetchApCredits, setCourseCompletion } from "../../services/treeApi.js";
import { enrichTreeResponse } from "../../utils/enrichTreeResponse.js";
import { buildHierarchy } from "./buildHierarchy.js";
import { buildPrereqIndex, deriveStatuses } from "./deriveStatus.js";
import { layoutTree } from "./treeLayout.js";
import { RootNode } from "./RootNode.jsx";
import { SectionNode } from "./SectionNode.jsx";
import { CategoryNode } from "../ui/CategoryNode.jsx";
import { ClassNode } from "../ui/ClassNode.jsx";
import { StackSlotNode } from "../ui/StackSlotNode.jsx";
import { TreeEdge } from "./TreeEdge.jsx";
import { PrereqEdge } from "./PrereqEdge.jsx";
import { NodeDetailPanel } from "./NodeDetailPanel.jsx";

// How long to hover before the course/slot expands (ms)
const HOVER_EXPAND_DELAY = 500;
// Scale factor when a course is expanded
const EXPAND_SCALE = 1.17;

function loadStatusMap(majorId) {
  try {
    const raw = localStorage.getItem(`treereq-status-${majorId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveStatusMap(majorId, map) {
  try {
    localStorage.setItem(`treereq-status-${majorId}`, JSON.stringify(map));
  } catch {}
}

export function DegreeTree({
  majorId,
  majorName,
  mockResponse,
  onFirstCategoryReady,
  userProfile,
  onProfileUpdate,
}) {
  const [apiResponse, setApiResponse] = useState(mockResponse ?? null);
  const [loading, setLoading] = useState(!mockResponse);
  const [error, setError] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // stackSelections: { [catId]: (string|null)[] }
  // catId = "cat:sectionName:categoryName", array index = slot index, value = assigned courseId or null
  const [stackSelections, setStackSelections] = useState({});

  // lockedCourseId: clicked course/slot — stays expanded until clicked again or another is clicked
  const [lockedCourseId, setLockedCourseId] = useState(null);
  // hoveredCourseId: node under the pointer — shows arrows immediately
  const [hoveredCourseId, setHoveredCourseId] = useState(null);
  // hoverExpandedId: set after HOVER_EXPAND_DELAY ms — triggers visual enlargement
  const [hoverExpandedId, setHoverExpandedId] = useState(null);
  const hoverTimerRef = useRef(null);
  // Ref mirrors lockedCourseId for synchronous checks in mouse event handlers
  const lockedRef = useRef(null);
  // Tracks whether the initial focus pan has fired — prevents re-centering on layout updates
  const focusFiredRef = useRef(false);

  useEffect(() => { focusFiredRef.current = false; }, [majorId]);

  useEffect(() => {
    if (mockResponse) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchMajorTree(majorId), fetchApCredits().catch(() => [])])
      .then(([res, apCreditRules]) => {
        if (cancelled) return;
        setApiResponse(res);

        // Start from any previously saved state for this major.
        const saved = loadStatusMap(majorId);
        const seed = { ...saved };

        // Seed from backend flags.
        for (const n of res.nodes ?? []) {
          if (n.completed === true && !seed[n.id]) seed[n.id] = "completed";
        }

        // Seed from profile uclaCourses.
        const profileCompleted = new Set(userProfile?.uclaCourses ?? []);
        for (const n of res.nodes ?? []) {
          if (profileCompleted.has(n.id) && !seed[n.id]) seed[n.id] = "completed";
        }

        // Seed from AP credit equivalents using stored scores.
        const apScores = userProfile?.apScores ?? {};
        for (const rule of apCreditRules) {
          const examName = rule.ap_exam; // e.g. "Calculus BC"
          const score = apScores[examName];
          if (!score) continue;
          if (score >= rule.score_min && score <= rule.score_max) {
            for (const courseId of rule.ucla_courses ?? []) {
              if (!seed[courseId]) seed[courseId] = "completed";
            }
          }
        }

        setStatusMap(seed);
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [majorId, mockResponse]); // intentionally omit userProfile — only seed on initial load
  useEffect(() => { // written by gemini
    if (!userProfile || !apiResponse) return;

    const profileCompleted = new Set([
      ...(userProfile.uclaCourses || []),
      ...(userProfile.apClasses || []),
      ...(userProfile.ibClasses || [])
    ]);

    setStatusMap((prev) => {
      let changed = false;
      const next = { ...prev };

      // 1. Ensure any course completed in the profile is completed in the tree
      profileCompleted.forEach((courseId) => {
        if (next[courseId] !== "completed") {
          next[courseId] = "completed";
          changed = true;
        }
      });

      // 2. If a course was un-checked/removed from the profile, remove it from the tree
      Object.keys(next).forEach((courseId) => {
        if (next[courseId] === "completed" && !profileCompleted.has(courseId)) {
          // Only remove if it's actually a node in this major's tree
          const isNodeInTree = apiResponse.nodes?.some(n => n.id === courseId);
          if (isNodeInTree) {
            delete next[courseId];
            changed = true;
          }
        }
      });

      return changed ? next : prev;
    });
  }, [userProfile, apiResponse]);
  const layout = useMemo(() => {
    if (!apiResponse) return null;
    const enriched = enrichTreeResponse(apiResponse);
    const { root, crossBranchEdges } = buildHierarchy(enriched, majorName);
    const prereqIndex = buildPrereqIndex(enriched.edges ?? []);
    const derived = deriveStatuses(root, statusMap, prereqIndex, stackSelections);
    const positioned = layoutTree(derived, lockedCourseId);
    return { ...positioned, crossBranchEdges, enriched };
  }, [apiResponse, majorName, statusMap, lockedCourseId, stackSelections]);

  // Persist statusMap to localStorage whenever it changes (after initial load).
  useEffect(() => {
    if (!apiResponse) return;
    saveStatusMap(majorId, statusMap);
  }, [statusMap, majorId, apiResponse]);

  const handleStatusChange = useCallback(async (courseId, newStatus) => {
    const prev = statusMap[courseId] ?? "unfulfilled";
    setStatusMap((m) => {
      const copy = { ...m };
      if (newStatus === "unfulfilled") delete copy[courseId];
      else copy[courseId] = newStatus;
      return copy;
    });

    // Keep profile.uclaCourses in sync so the landing page progress bar updates.
    if (onProfileUpdate && userProfile) {
      const current = userProfile.uclaCourses ?? [];
      if (newStatus === "completed" && !current.includes(courseId)) {
        onProfileUpdate({ ...userProfile, uclaCourses: [...current, courseId] });
      } else if (newStatus !== "completed" && prev === "completed") {
        onProfileUpdate({ ...userProfile, uclaCourses: current.filter((id) => id !== courseId) });
      }
    }

    try {
      if (newStatus === "completed") await setCourseCompletion(courseId, true);
      else if (prev === "completed") await setCourseCompletion(courseId, false);
    } catch {
      // Persistence endpoint not yet implemented — keep the optimistic local update.
    }
  }, [statusMap, userProfile, onProfileUpdate]);

  const handleStackSelect = useCallback((catId, slotIndex, courseId) => {
    setStackSelections((prev) => {
      const catSelections = [...(prev[catId] ?? [])];
      catSelections[slotIndex] = courseId;
      return { ...prev, [catId]: catSelections };
    });
  }, []);

  const handleStackRevert = useCallback((catId, slotIndex) => {
    const courseId = stackSelections[catId]?.[slotIndex] ?? null;
    setStackSelections((prev) => {
      const catSelections = [...(prev[catId] ?? [])];
      catSelections[slotIndex] = null;
      return { ...prev, [catId]: catSelections };
    });
    // Clear the reverted course's completion status and any lock state
    if (courseId) {
      setStatusMap((m) => {
        const copy = { ...m };
        delete copy[courseId];
        return copy;
      });
    }
    lockedRef.current = null;
    setLockedCourseId(null);
    setHoveredCourseId(null);
    setHoverExpandedId(null);
  }, [stackSelections]);

  // Nodes that behave like interactable courses (can lock/expand/show arrows).
  // Stack slots qualify only when they have an assigned course.
  function isInteractable(node) {
    if (node.kind === "course") return true;
    if (node.kind === "stack_slot" && node.assignedCourseId) return true;
    return false;
  }

  const handleNodeClick = useCallback((node) => {
    if (isInteractable(node)) {
      clearTimeout(hoverTimerRef.current);
      if (lockedRef.current === node.id) {
        lockedRef.current = null;
        setLockedCourseId(null);
        setHoveredCourseId(null);
        setHoverExpandedId(null);
      } else {
        lockedRef.current = node.id;
        setLockedCourseId(node.id);
        setHoveredCourseId(node.id);
        setHoverExpandedId(node.id);
      }
    }
    setSelectedNodeId((prev) => prev === node.id ? null : node.id);
  }, []);

  const handleNavigate = useCallback((courseId) => {
    setSelectedNodeId(courseId);
  }, []);

  const handleCourseMouseEnter = useCallback((nodeId) => {
    if (lockedRef.current) return;
    setHoveredCourseId(nodeId);
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoverExpandedId(nodeId), HOVER_EXPAND_DELAY);
  }, []);

  const handleCourseMouseLeave = useCallback(() => {
    if (lockedRef.current) return;
    clearTimeout(hoverTimerRef.current);
    setHoveredCourseId(null);
    setHoverExpandedId(null);
  }, []);

  useEffect(() => {
    if (!layout || !onFirstCategoryReady || focusFiredRef.current) return;
    const firstCat = layout.nodes.find((n) => n.kind === "category");
    if (firstCat) {
      focusFiredRef.current = true;
      onFirstCategoryReady({ x: firstCat.x, y: firstCat.y });
    }
  }, [layout, onFirstCategoryReady]);

  // ── All hooks must run before any early return ────────────────────────────

  const edges = layout?.edges ?? [];
  const nodeById = layout?.nodeById;

  // Map courseId → slot layout node (for assigned slots that need prereq arrows)
  const courseToSlotNode = useMemo(() => {
    if (!nodeById) return new Map();
    const map = new Map();
    for (const [catId, selections] of Object.entries(stackSelections)) {
      (selections ?? []).forEach((courseId, i) => {
        if (courseId) {
          const slotNode = nodeById.get(`slot:${catId}:${i}`);
          if (slotNode) map.set(courseId, slotNode);
        }
      });
    }
    return map;
  }, [stackSelections, nodeById]);

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

  const { nodes, crossBranchEdges, totalWidth, totalHeight, enriched } = layout;
  const selectedNode = selectedNodeId ? nodeById?.get(selectedNodeId) : null;

  // Arrows: resolve slot node to its assigned course ID for cross-edge lookup
  const activeNodeId = lockedCourseId ?? hoveredCourseId;
  const activeNode = activeNodeId ? nodeById?.get(activeNodeId) : null;
  const activeCourseId = activeNode?.kind === "stack_slot"
    ? (activeNode.assignedCourseId ?? null)
    : activeNodeId;

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
          {edges.map((e) => (
            <TreeEdge
              key={e.id}
              source={e.sourceNode}
              target={e.targetNode}
              color={statusMap[e.sourceNode?.id] === "completed" ? "#348162" : "#85b110"}
            />
          ))}
          {visibleCrossEdges.map((e) => {
            // Resolve course ID → layout node, falling back to the slot that holds it
            const src = nodeById?.get(e.source) ?? courseToSlotNode.get(e.source);
            const tgt = nodeById?.get(e.target) ?? courseToSlotNode.get(e.target);
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

        {nodes.map((node) => {
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
      </div>

      {selectedNode && createPortal(
        <NodeDetailPanel
          node={selectedNode}
          statusMap={statusMap}
          nodeById={nodeById}
          onStatusChange={handleStatusChange}
          onNavigate={handleNavigate}
          stackSelections={stackSelections}
          onStackSelect={handleStackSelect}
          onStackRevert={handleStackRevert}
          allCourses={enriched?.nodes ?? []}
          edges={edges}
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
  const interactable = node.kind === "course" || (node.kind === "stack_slot" && node.assignedCourseId);
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
      onMouseEnter={interactable ? () => onMouseEnter(node.id) : undefined}
      onMouseLeave={interactable ? () => onMouseLeave() : undefined}
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

    case "category": {
      // Strip "(choose N)" suffix — it appears in the side panel instead
      const displayName = node.data.choose_n != null
        ? node.data.name.replace(/\s*\(choose\s+\d+\)\s*$/i, "")
        : node.data.name;
      return (
        <div style={{ ...circleRing, borderRadius: "50%" }}>
          <CategoryNode
            categoryName={displayName}
            completionPercentage={node.completionPercentage}
          />
        </div>
      );
    }

    case "course": {
      const isStatusLocked = node.status === "locked";
      const courseRing = isLocked
        ? { outline: "2.5px solid #FFD66B", outlineOffset: 4, borderRadius: 50 }
        : isSelected
        ? { outline: "2px solid #FFD66B", outlineOffset: 3, borderRadius: 50 }
        : {};
      return (
        <div style={{ position: "relative", display: "inline-block", ...courseRing }}>
          <ClassNode
            courseName={`${node.data.dept} ${node.data.number}`}
            status={courseStatusLabel(node.status)}
          />
          {isStatusLocked && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: 100,
              background: "rgba(0,0,0,0.22)", pointerEvents: "none",
            }} />
          )}
        </div>
      );
    }

    case "stack_slot": {
      const isStatusLocked = node.status === "locked" && !!node.assignedCourseId;
      const slotRing = isLocked
        ? { outline: "2.5px solid #FFD66B", outlineOffset: 4, borderRadius: 50 }
        : isSelected
        ? { outline: "2px solid #FFD66B", outlineOffset: 3, borderRadius: 50 }
        : {};
      return (
        <div style={{ position: "relative", display: "inline-block", ...slotRing }}>
          <StackSlotNode
            slotIndex={node.data.slotIndex}
            chooseN={node.data.chooseN}
            assignedCourseId={node.assignedCourseId ?? null}
            status={courseStatusLabel(node.status)}
          />
          {isStatusLocked && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: 100,
              background: "rgba(0,0,0,0.22)", pointerEvents: "none",
            }} />
          )}
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
