// Actual rendered outer diameters / dimensions for each node kind.
const NODE_KIND_SIZE = {
  root:     { w: 220, h: 220 },
  section:  { w: 220, h: 220 },
  category: { w: 220, h: 220 },
  course:   { w: 220, h: 85  },
};

// Spine: root + sections in a horizontal row.
const SECTION_SPACING  = 260; // horizontal gap center-to-center between spine nodes
const ROOT_SECTION_GAP = 180; // gap from root center to first section center

// Categories: split above/below their section, stacked vertically.
const CAT_FIRST_OFFSET = 110; // distance from spine center to first category center
const CAT_SPACING      = 116; // vertical gap between adjacent categories on same side

// Courses: pill stack to the right of each category.
const COURSE_X_OFFSET  = 160; // horizontal distance from category center to course center
const COURSE_Y_SPACING = 34;  // vertical gap between adjacent course pills

const MARGIN = 80;

function makeNode(data, x, y, depth) {
  const size = NODE_KIND_SIZE[data.kind] ?? NODE_KIND_SIZE.course;
  return {
    id:                   data.id,
    kind:                 data.kind,
    data:                 data.data,
    status:               data.status,
    completionPercentage: data.completionPercentage,
    completed:            data.completed,
    unmetPrereqs:         data.unmetPrereqs,
    x,
    y,
    width:  size.w,
    height: size.h,
    depth,
  };
}

function makeEdge(src, tgt) {
  return { id: `${src.id}->${tgt.id}`, sourceNode: src, targetNode: tgt };
}

export function layoutTree(rootDerived) {
  const nodes = [];
  const edges = [];

  // ── Spine ─────────────────────────────────────────────────────────────────
  const spineY  = 0;
  const rootNode = makeNode(rootDerived, 0, spineY, 0);
  nodes.push(rootNode);

  const sections = rootDerived.children ?? [];

  sections.forEach((sectionData, si) => {
    const secX = ROOT_SECTION_GAP + si * SECTION_SPACING;
    const secNode = makeNode(sectionData, secX, spineY, 1);
    nodes.push(secNode);
    edges.push(makeEdge(rootNode, secNode));

    // ── Categories: half above spine, half below ───────────────────────────
    const categories = sectionData.children ?? [];
    const aboveCount = Math.ceil(categories.length / 2);

    categories.forEach((catData, ci) => {
      const above   = ci < aboveCount;
      const idx     = above ? ci : ci - aboveCount;
      const dir     = above ? -1 : 1;
      const catY    = spineY + dir * (CAT_FIRST_OFFSET + idx * CAT_SPACING);
      const catNode = makeNode(catData, secX, catY, 2);
      nodes.push(catNode);
      edges.push(makeEdge(secNode, catNode));

      // ── Courses: pill stack to the right of each category ─────────────
      const courses = catData.children ?? [];
      const totalH  = (courses.length - 1) * COURSE_Y_SPACING;
      courses.forEach((courseData, cri) => {
        const courseX = secX + COURSE_X_OFFSET;
        const courseY = catY - totalH / 2 + cri * COURSE_Y_SPACING;
        const courseNode = makeNode(courseData, courseX, courseY, 3);
        nodes.push(courseNode);
        edges.push(makeEdge(catNode, courseNode));
      });
    });
  });

  // ── Normalize so top-left starts at MARGIN ────────────────────────────────
  const minX = Math.min(...nodes.map((n) => n.x - n.width  / 2));
  const minY = Math.min(...nodes.map((n) => n.y - n.height / 2));
  for (const n of nodes) {
    n.x = n.x - minX + MARGIN;
    n.y = n.y - minY + MARGIN;
  }

  const nodeById    = new Map(nodes.map((n) => [n.id, n]));
  const totalWidth  = Math.max(...nodes.map((n) => n.x + n.width  / 2)) + MARGIN;
  const totalHeight = Math.max(...nodes.map((n) => n.y + n.height / 2)) + MARGIN;

  return { nodes, edges, totalWidth, totalHeight, nodeById };
}
