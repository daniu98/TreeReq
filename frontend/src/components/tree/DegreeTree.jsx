import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMajorTree, setCourseCompletion } from "../../services/treeApi.js";
import { buildHierarchy } from "./buildHierarchy.js";
import { buildPrereqIndex, deriveStatuses } from "./deriveStatus.js";
import { layoutTree } from "./treeLayout.js";
import { RootNode } from "./RootNode.jsx";
import { SectionNode } from "./SectionNode.jsx";
import { CategoryNode } from "../ui/CategoryNode.jsx";
import { ClassNode } from "../ui/ClassNode.jsx";
import { TreeEdge } from "./TreeEdge.jsx";

/**
 * Top-level degree-requirements tree. Fetches the major tree from the API,
 * builds a nested hierarchy, derives statuses from the user's `completionMap`,
 * runs an auto-layout, and renders nodes + edges.
 *
 * Props:
 *   majorId           — required. e.g. "cogsci"
 *   majorName         — optional display label for the root node.
 *   activeCourseId    — optional id of the course considered "current".
 *   onNodeClick(node) — optional callback for non-course node clicks.
 *   onCourseToggle    — optional async (courseId, nextCompleted) => void.
 *                       If omitted, defaults to POST /api/courses/{id}/completion.
 */
export function DegreeTree({
  majorId,
  majorName,
  activeCourseId,
  onNodeClick,
  onCourseToggle,
  mockResponse, // optional: bypass fetch (for testing)
}) {
  const [apiResponse, setApiResponse] = useState(mockResponse ?? null);
  const [loading, setLoading] = useState(!mockResponse);
  const [error, setError] = useState(null);
  const [completionMap, setCompletionMap] = useState({});
  const [tooltip, setTooltip] = useState(null); // { x, y, text }

  // Fetch the tree on mount / majorId change (skipped when mockResponse given).
  useEffect(() => {
    if (mockResponse) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMajorTree(majorId)
      .then((res) => {
        if (cancelled) return;
        setApiResponse(res);
        // Seed completion map from any backend-provided completed flags.
        const seed = {};
        for (const n of res.nodes ?? []) {
          if (n.completed === true) seed[n.id] = true;
        }
        setCompletionMap(seed);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [majorId, mockResponse]);

  // Build hierarchy + layout whenever the API response or completion map changes.
  const layout = useMemo(() => {
    if (!apiResponse) return null;
    const { root, crossBranchEdges } = buildHierarchy(apiResponse, majorName);
    const prereqIndex = buildPrereqIndex(apiResponse.edges ?? []);
    const derived = deriveStatuses(root, completionMap, prereqIndex);
    const positioned = layoutTree(derived);
    return { ...positioned, crossBranchEdges };
  }, [apiResponse, majorName, completionMap]);

  const handleCourseClick = useCallback(
    async (node) => {
      if (node.status === "locked") {
        setTooltip({
          x: node.x,
          y: node.y - node.height / 2 - 8,
          text: `Locked. Complete: ${node.unmetPrereqs.join(", ")}`,
        });
        setTimeout(() => setTooltip(null), 3000);
        return;
      }
      const nextCompleted = !(completionMap[node.id] === true);
      // Optimistic update.
      setCompletionMap((prev) => ({ ...prev, [node.id]: nextCompleted }));
      try {
        if (onCourseToggle) {
          await onCourseToggle(node.id, nextCompleted);
        } else {
          await setCourseCompletion(node.id, nextCompleted);
        }
      } catch (err) {
        // Roll back on failure.
        setCompletionMap((prev) => ({ ...prev, [node.id]: !nextCompleted }));
        console.error("Failed to persist course completion:", err);
      }
    },
    [completionMap, onCourseToggle]
  );

  if (loading) {
    return (
      <div style={stateStyles.container}>
        <p style={stateStyles.text}>Loading {majorName ?? majorId}...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div style={stateStyles.container}>
        <p style={{ ...stateStyles.text, color: "#c0392b" }}>
          Could not load tree: {error.message}
        </p>
      </div>
    );
  }
  if (!layout) return null;

  const { nodes, edges, totalWidth, totalHeight } = layout;

  return (
    <div style={{ position: "relative", width: totalWidth, height: totalHeight }}>
      <svg
        width={totalWidth}
        height={totalHeight}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {edges.map((e) => (
          <TreeEdge key={e.id} source={e.sourceNode} target={e.targetNode} />
        ))}
      </svg>

      {nodes.map((node) => (
        <PositionedNode
          key={node.id}
          node={node}
          isActive={node.id === activeCourseId}
          onCourseClick={handleCourseClick}
          onNodeClick={onNodeClick}
        />
      ))}

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            background: "#1a1a1a",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "Inter, system-ui, sans-serif",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

function PositionedNode({ node, isActive, onCourseClick, onNodeClick }) {
  const style = {
    position: "absolute",
    left: node.x,
    top: node.y,
    transform: "translate(-50%, -50%)",
  };

  return (
    <div style={style}>
      {renderNode(node, isActive, onCourseClick, onNodeClick)}
    </div>
  );
}

function renderNode(node, isActive, onCourseClick, onNodeClick) {
  switch (node.kind) {
    case "root":
      return (
        <RootNode
          name={node.data.name}
          status={node.status}
          isActive={isActive}
          onClick={() => onNodeClick?.(node)}
        />
      );
    case "section":
      return (
        <SectionNode
          name={node.data.name}
          status={node.status}
          isActive={isActive}
          onClick={() => onNodeClick?.(node)}
        />
      );
    case "category":
      return (
        <div
          onClick={() => onNodeClick?.(node)}
          style={{
            cursor: "pointer",
            outline: isActive ? "4px solid #FFD66B" : "none",
            outlineOffset: 4,
            borderRadius: "50%",
          }}
        >
          <CategoryNode
            categoryName={node.data.name}
            completionPercentage={node.completionPercentage}
          />
        </div>
      );
    case "course":
      return (
        <div
          style={{
            outline: isActive ? "3px solid #FFD66B" : "none",
            outlineOffset: 3,
            borderRadius: 999,
          }}
        >
          <ClassNode
            courseName={`${node.data.dept} ${node.data.number}`}
            status={courseStatusLabel(node.status)}
            department={node.data.dept}
            onClick={() => onCourseClick(node)}
          />
        </div>
      );
    default:
      return null;
  }
}

function courseStatusLabel(status) {
  switch (status) {
    case "completed": return "Completed";
    case "in_progress": return "In Progress";
    case "planned": return "Planned";
    case "locked": return "Unfulfilled";
    default: return "Planned";
  }
}

const stateStyles = {
  container: {
    padding: "48px 24px",
    textAlign: "center",
  },
  text: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 15,
    color: "#666",
    margin: 0,
  },
};
