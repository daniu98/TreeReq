import { hierarchy, tree as d3tree } from "d3-hierarchy";

/**
 * Per-kind sizing. Width is the horizontal slot reserved per node (used by
 * d3.tree's `nodeSize`). Height is the vertical slot.
 *
 * Note: d3.tree puts depth on the X axis when we treat it as horizontal.
 * To get a left→right tree we swap axes after layout (x,y → y,x).
 */
// Outer dimensions of each node kind, used by d3.tree's nodeSize().
// CategoryNode (overarching): 167 inner + 2*7.41 border + 2*26.7 padding ≈ 235
// CategoryNode (category):    210 inner + 2*10 border  + 2*5 padding   ≈ 240
// ClassNode (status pill):    ~155w x 70h
// RootNode is overarching scaled 0.55 ≈ 130
const NODE_KIND_SIZE = {
  root:     { w: 130, h: 130 },
  section:  { w: 235, h: 235 },
  category: { w: 240, h: 240 },
  course:   { w: 170, h: 80  },
};

/**
 * Compute positioned nodes + parent→child edges for a derived hierarchy.
 *
 * Returns:
 *   nodes: [{ id, kind, data, status, x, y, width, height }]
 *   edges: [{ id, source: {x,y}, target: {x,y}, sourceNode, targetNode }]
 */
export function layoutTree(rootDerived) {
  const root = hierarchy(rootDerived);

  // Vertical sibling spacing must clear the largest leaf node + gap.
  // Horizontal column spacing must clear the largest column node + gap.
  const verticalGap = 30;
  const horizontalGap = 120;

  const layout = d3tree().nodeSize([
    NODE_KIND_SIZE.course.h + verticalGap,
    NODE_KIND_SIZE.category.w + horizontalGap,
  ]);
  layout(root);

  // Swap x and y to make the tree flow left→right.
  const positioned = root.descendants().map((d) => {
    const size = NODE_KIND_SIZE[d.data.kind] ?? NODE_KIND_SIZE.course;
    return {
      id: d.data.id,
      kind: d.data.kind,
      data: d.data.data,
      status: d.data.status,
      completionPercentage: d.data.completionPercentage,
      completed: d.data.completed,
      unmetPrereqs: d.data.unmetPrereqs,
      x: d.y, // swapped
      y: d.x, // swapped
      width: size.w,
      height: size.h,
      depth: d.depth,
      _hierarchyNode: d,
    };
  });

  // Normalize so min-x and min-y start at a small margin.
  const xs = positioned.map((n) => n.x);
  const ys = positioned.map((n) => n.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const margin = 40;
  for (const n of positioned) {
    n.x = n.x - minX + margin;
    n.y = n.y - minY + margin;
  }

  // Build edges from hierarchy parent->child.
  const nodeById = new Map(positioned.map((n) => [n.id, n]));
  const edges = [];
  for (const n of positioned) {
    const hn = n._hierarchyNode;
    if (!hn.parent) continue;
    const parent = nodeById.get(hn.parent.data.id);
    if (!parent) continue;
    edges.push({
      id: `${parent.id}->${n.id}`,
      sourceNode: parent,
      targetNode: n,
    });
  }

  // Total canvas size.
  const totalWidth =
    Math.max(...positioned.map((n) => n.x + n.width / 2)) + margin;
  const totalHeight =
    Math.max(...positioned.map((n) => n.y + n.height / 2)) + margin;

  // Strip the d3 reference before returning so it doesn't leak.
  for (const n of positioned) delete n._hierarchyNode;

  return { nodes: positioned, edges, totalWidth, totalHeight, nodeById };
}
