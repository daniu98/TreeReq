import { hierarchy, tree as d3tree } from "d3-hierarchy";

// Actual rendered outer diameters / dimensions for each node kind.
// CategoryNode (regular):     90px inner + 2*4px padding + 2*5px border = 108px
// CategoryNode (overarching): 110px inner + 2*7px padding + 2*5px border = 134px
// RootNode: overarching * 0.82 ≈ 110px
// ClassNode (minimal pill):   ~140px wide × 26px tall
const NODE_KIND_SIZE = {
  root:     { w: 110, h: 110 },
  section:  { w: 134, h: 134 },
  category: { w: 108, h: 108 },
  course:   { w: 150, h: 26   },
};

// nodeSize vertical slot: must be ≥ the largest circle at that depth (category = 108px)
// so adjacent 1-course categories get 120px separation → no overlap.
const VERTICAL_SLOT  = 120; // px per leaf node (course)
const HORIZONTAL_GAP = 70;  // extra horizontal space between depth columns

export function layoutTree(rootDerived) {
  const root = hierarchy(rootDerived);

  const layout = d3tree().nodeSize([
    VERTICAL_SLOT,
    NODE_KIND_SIZE.category.w + HORIZONTAL_GAP,
  ]);
  layout(root);

  // Swap axes: d3 lays out vertically, we want left→right.
  const positioned = root.descendants().map((d) => {
    const size = NODE_KIND_SIZE[d.data.kind] ?? NODE_KIND_SIZE.course;
    return {
      id:                   d.data.id,
      kind:                 d.data.kind,
      data:                 d.data.data,
      status:               d.data.status,
      completionPercentage: d.data.completionPercentage,
      completed:            d.data.completed,
      unmetPrereqs:         d.data.unmetPrereqs,
      x:     d.y,   // swapped
      y:     d.x,   // swapped
      width: size.w,
      height: size.h,
      depth: d.depth,
      _hierarchyNode: d,
    };
  });

  // Normalize so min-x and min-y start at a margin.
  const xs = positioned.map((n) => n.x);
  const ys = positioned.map((n) => n.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const margin = 60;
  for (const n of positioned) {
    n.x = n.x - minX + margin;
    n.y = n.y - minY + margin;
  }

  // Build parent→child edges from hierarchy.
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

  const totalWidth  = Math.max(...positioned.map((n) => n.x + n.width  / 2)) + margin;
  const totalHeight = Math.max(...positioned.map((n) => n.y + n.height / 2)) + margin;

  for (const n of positioned) delete n._hierarchyNode;

  return { nodes: positioned, edges, totalWidth, totalHeight, nodeById };
}
