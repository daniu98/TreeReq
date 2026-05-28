import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { fetchMajorTree, setCourseCompletion } from "../../services/treeApi.js";
import { enrichTreeResponse } from "../../utils/enrichTreeResponse.js";
import { buildHierarchy } from "./buildHierarchy.js";
import { buildPrereqIndex, deriveStatuses } from "./deriveStatus.js";
import { layoutTree } from "./treeLayout.js";
import { RootNode } from "./RootNode.jsx";
import { SectionNode } from "./SectionNode.jsx";
import { CategoryNode } from "../ui/CategoryNode.jsx";
import { ClassNode } from "../ui/ClassNode.jsx";
import { TreeEdge } from "./TreeEdge.jsx";
import { PrereqEdge } from "./PrereqEdge.jsx";
import { NodeDetailPanel } from "./NodeDetailPanel.jsx";

export function DegreeTree({
  majorId,
  majorName,
  mockResponse,
}) {
  const [apiResponse, setApiResponse] = useState(mockResponse ?? null);
  const [loading, setLoading] = useState(!mockResponse);
  const [error, setError] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [selectedNodeId, setSelectedNodeId] = useState(null);

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
    const positioned = layoutTree(derived);
    return { ...positioned, crossBranchEdges, enriched };
  }, [apiResponse, majorName, statusMap]);

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
    setSelectedNodeId((prev) => prev === node.id ? null : node.id);
  }, []);

  const handleNavigate = useCallback((courseId) => {
    setSelectedNodeId(courseId);
  }, []);

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

  const { nodes, edges, crossBranchEdges, totalWidth, totalHeight, nodeById, enriched } = layout;
  const selectedNode = selectedNodeId ? nodeById?.get(selectedNodeId) : null;

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
          {(crossBranchEdges ?? []).map((e) => {
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

        {nodes.map((node) => (
          <PositionedNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            statusMap={statusMap}
            onClick={handleNodeClick}
          />
        ))}
      </div>

      {selectedNode && createPortal(
        <NodeDetailPanel
          node={selectedNode}
          statusMap={statusMap}
          nodeById={nodeById}
          onStatusChange={handleStatusChange}
          onNavigate={handleNavigate}
          onClose={() => setSelectedNodeId(null)}
        />,
        document.body
      )}
    </>
  );
}

function PositionedNode({ node, isSelected, statusMap, onClick }) {
  return (
    <div
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        transform: "translate(-50%, -50%)",
        cursor: "pointer",
      }}
      onClick={() => onClick(node)}
    >
      {renderNode(node, isSelected, statusMap)}
    </div>
  );
}

function renderNode(node, isSelected, statusMap) {
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
      const courseRing = isSelected
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
