import { hierarchy, tree as d3tree } from "d3-hierarchy";

// Outer rendered diameters / dimensions for each node kind (px).
// All circle nodes are now 220px (matching Figma). Course pills are ~220px wide × 85px tall.
const NODE_KIND_SIZE = {
  root:     { w: 220, h: 220 },
  section:  { w: 220, h: 220 },
  category: { w: 220, h: 220 },
  course:   { w: 220, h: 85  },
};

// Vertical slot per leaf node: course pill is 85px tall; 240px gives comfortable spacing.
const VERTICAL_SLOT  = 240;
// Extra horizontal space between depth columns (edge-to-edge gap between circles/pills).
const HORIZONTAL_GAP = 80;

export function layoutTree(rootDerived) {
  const root = hierarchy(rootDerived);

  const layout = d3tree().nodeSize([
    VERTICAL_SLOT,
    NODE_KIND_SIZE.category.w + HORIZONTAL_GAP,
  ]);
  layout(root);

  // Swap axes: d3 lays out vertically; we want left→right.
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
  const margin = 80;
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
