// Actual rendered outer diameters / dimensions for each node kind.
const NODE_KIND_SIZE = {
  root:     { w: 220, h: 220 },
  section:  { w: 220, h: 220 },
  category: { w: 220, h: 220 },
  course:   { w: 220, h: 85  },
};

const SECTION_R = NODE_KIND_SIZE.section.w / 2;   // 110
const CAT_R     = NODE_KIND_SIZE.category.h / 2;  // 110
const COURSE_W  = NODE_KIND_SIZE.course.w;         // 220

// Gap between section circle edge and nearest category extent
const SECTION_CAT_GAP = 20;
// Gap between adjacent category extents (their content bounding boxes)
const CAT_CAT_GAP     = 30;

// Courses: left-to-right prereq chains
// category center → first course column center (must > cat_r + course_w/2 = 220)
const COURSE_X_OFFSET    = 260;
// between consecutive depth levels (prereq → dependent)
const COURSE_COL_SPACING = 260;
// between vertically adjacent courses in the same depth column
const COURSE_Y_SPACING   = 100;

// Gap between the right edge of section i's deepest course and section i+1's left edge
const INTER_SECTION_GAP  = 80;
// root center → first section center
const ROOT_SECTION_GAP   = 400;

const MARGIN = 80;

// ── Helpers ──────────────────────────────────────────────────────────────────

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

/** Number of leaf courses (no in-category children) in a course subtree. */
function countLeaves(courseData) {
  const ch = courseData.children ?? [];
  if (ch.length === 0) return 1;
  return ch.reduce((s, c) => s + countLeaves(c), 0);
}

/** Depth of the deepest prereq chain in a course subtree (self = 1). */
function chainDepth(courseData) {
  const ch = courseData.children ?? [];
  if (ch.length === 0) return 1;
  return 1 + Math.max(...ch.map(chainDepth));
}

/**
 * Half the vertical span of a category's content, used for collision-free
 * vertical placement.
 *
 * The outermost pixel edge of a course node is:
 *   distance from catY to outermost course CENTER  (+courseH/2)
 *   + the course node's own half-height            (+course_h/2)
 *
 * Without the second term the boundary lands at the outermost course's
 * CENTER, so adjacent categories' pill edges overlap by one course_h/2.
 */
function categoryHalfSpan(catData) {
  const roots = catData.children ?? [];
  if (roots.length === 0) return CAT_R;
  const totalLeaves = roots.reduce((s, r) => s + countLeaves(r), 0);
  const courseH     = Math.max(0, totalLeaves - 1) * COURSE_Y_SPACING;
  const courseNodeR = NODE_KIND_SIZE.course.h / 2;  // 42.5 px
  return Math.max(CAT_R, courseH / 2 + courseNodeR);
}

/** Max chain depth across all course trees in a section (for X spacing). */
function sectionMaxChainDepth(sectionData) {
  let max = 0;
  for (const cat of sectionData.children ?? []) {
    for (const course of cat.children ?? []) {
      max = Math.max(max, chainDepth(course));
    }
  }
  return max;
}

// ── Course tree layout ────────────────────────────────────────────────────────

/**
 * Lay out all courses for one category as left-to-right prereq chains.
 * Root courses (no in-category prereqs) are the leftmost column; their
 * dependents extend rightward, one column per depth level.
 *
 * Uses a two-pass approach:
 *   Pass 1 – assign Y positions via leaf-slot counting (bottom-up).
 *   Pass 2 – create nodes and edges top-down so each node knows its parent.
 */
function layoutCategoryCourses(catNode, catData, secX, catY, nodes, edges) {
  const roots = catData.children ?? [];
  if (roots.length === 0) return;

  const totalLeaves = roots.reduce((s, r) => s + countLeaves(r), 0);
  const totalH      = Math.max(0, totalLeaves - 1) * COURSE_Y_SPACING;
  const topY        = catY - totalH / 2;

  // Pass 1: assign Y by counting leaf slots bottom-up
  let slot = 0;
  function assignY(courseData) {
    const ch = courseData.children ?? [];
    const nLeaves  = countLeaves(courseData);
    const slotStart = slot;

    const childResults = ch.map(c => assignY(c));

    let y;
    if (ch.length === 0) {
      // Leaf: own slot
      y = topY + slot * COURSE_Y_SPACING;
      slot++;
    } else {
      // Interior: vertically centered over its leaf range
      y = topY + (slotStart * 2 + nLeaves - 1) / 2 * COURSE_Y_SPACING;
    }
    return { courseData, y, childResults };
  }
  const rootResults = roots.map(r => assignY(r));

  // Pass 2: create nodes and edges top-down
  function createNodes(result, depth, parentNode) {
    const { courseData, y, childResults } = result;
    const x          = secX + COURSE_X_OFFSET + depth * COURSE_COL_SPACING;
    const courseNode = makeNode(courseData, x, y, 3);
    nodes.push(courseNode);
    edges.push(makeEdge(parentNode, courseNode));
    for (const child of childResults) {
      createNodes(child, depth + 1, courseNode);
    }
  }
  for (const result of rootResults) {
    createNodes(result, 0, catNode);
  }
}

// ── Main layout ───────────────────────────────────────────────────────────────

export function layoutTree(rootDerived) {
  const nodes = [];
  const edges = [];

  const spineY   = 0;
  const rootNode = makeNode(rootDerived, 0, spineY, 0);
  nodes.push(rootNode);

  const sections = rootDerived.children ?? [];

  // Section X positions are computed dynamically so each section's rightmost
  // course column never overlaps the next section's circle.
  let curX = ROOT_SECTION_GAP;

  sections.forEach((sectionData) => {
    const secX    = curX;
    const secNode = makeNode(sectionData, secX, spineY, 1);
    nodes.push(secNode);
    edges.push(makeEdge(rootNode, secNode));

    // ── Categories: split above/below spine, dynamically spaced ────────────
    const categories = sectionData.children ?? [];
    const aboveCount = Math.ceil(categories.length / 2);
    const aboveCats  = categories.slice(0, aboveCount);
    const belowCats  = categories.slice(aboveCount);

    // Above the spine (idx 0 = closest to spine, growing upward)
    let aboveBoundary = spineY - SECTION_R - SECTION_CAT_GAP;
    for (const catData of aboveCats) {
      const hs      = categoryHalfSpan(catData);
      const catY    = aboveBoundary - hs;   // center
      const catNode = makeNode(catData, secX, catY, 2);
      nodes.push(catNode);
      edges.push(makeEdge(secNode, catNode));
      layoutCategoryCourses(catNode, catData, secX, catY, nodes, edges);
      aboveBoundary = catY - hs - CAT_CAT_GAP;
    }

    // Below the spine (idx 0 = closest to spine, growing downward)
    let belowBoundary = spineY + SECTION_R + SECTION_CAT_GAP;
    for (const catData of belowCats) {
      const hs      = categoryHalfSpan(catData);
      const catY    = belowBoundary + hs;   // center
      const catNode = makeNode(catData, secX, catY, 2);
      nodes.push(catNode);
      edges.push(makeEdge(secNode, catNode));
      layoutCategoryCourses(catNode, catData, secX, catY, nodes, edges);
      belowBoundary = catY + hs + CAT_CAT_GAP;
    }

    // ── Advance X: clear this section's deepest course column ──────────────
    const maxDepth       = sectionMaxChainDepth(sectionData);
    const courseRightEdge = secX + COURSE_X_OFFSET + (maxDepth - 1) * COURSE_COL_SPACING + COURSE_W / 2;
    curX = courseRightEdge + INTER_SECTION_GAP + SECTION_R;
  });

  // ── Normalize so the top-left corner starts at MARGIN ────────────────────
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
