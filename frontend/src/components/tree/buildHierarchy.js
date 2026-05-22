/**
 * Transforms a flat API response { nodes, edges, requirements } into a nested
 * hierarchy: root -> section -> category -> course (-> course prereq chains).
 *
 * The API doesn't yet return explicit sections, so we group categories by an
 * optional `section` field on each requirement. If absent, all categories fall
 * under a single implicit "Requirements" section.
 *
 * Course prerequisite chains: an edge (source -> target) means `source` must
 * be completed before `target`. In the tree, prereqs are children of the
 * course they unlock (left-to-right flow: prereq on the left, dependent on the
 * right). To avoid cycles and duplicate placement, each course is parented to
 * its primary category; further prereq chains beyond the immediate category
 * link become cross-branch edges (rendered separately as dashed connectors).
 */

const DEFAULT_SECTION = "Requirements";

export function buildHierarchy(apiResponse, majorName) {
  const { root, nodes = [], edges = [], requirements = [] } = apiResponse;

  // Index courses by id for quick lookup.
  const courseById = new Map(nodes.map((n) => [n.id, n]));

  // Build adjacency: which courses are prereqs of which.
  const prereqsOf = new Map(); // course_id -> [{ source, type }]
  for (const e of edges) {
    if (!prereqsOf.has(e.target)) prereqsOf.set(e.target, []);
    prereqsOf.get(e.target).push({ source: e.source, type: e.type ?? "required" });
  }

  // Track which courses are owned by which category requirement so we can
  // build cross-branch prereq edges later (when a course's prereq lives in
  // another category).
  const categoryOfCourse = new Map();
  for (const req of requirements) {
    for (const cid of req.courses ?? []) {
      categoryOfCourse.set(cid, req.category);
    }
  }

  // Group requirements by section.
  const sectionMap = new Map(); // section_name -> [requirement, ...]
  for (const req of requirements) {
    const section = req.section ?? DEFAULT_SECTION;
    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section).push(req);
  }

  // Visited courses (for prereq chain expansion within categories).
  const placedCourses = new Set();
  const crossBranchEdges = []; // [{ source, target, type }]

  // Recursively place a course node, attaching its in-category prereqs as
  // children. Out-of-category prereqs are emitted as cross-branch edges.
  function placeCourse(courseId, ownerCategory) {
    placedCourses.add(courseId);
    const course = courseById.get(courseId);
    const node = {
      kind: "course",
      id: courseId,
      data: course ?? {
        id: courseId,
        dept: courseId.split(/\s+/)[0] ?? courseId,
        number: courseId.split(/\s+/).slice(1).join(" "),
        title: "(unknown)",
        units: 0,
        is_elective: false,
      },
      children: [],
    };

    const incoming = prereqsOf.get(courseId) ?? [];
    for (const { source, type } of incoming) {
      const sourceCategory = categoryOfCourse.get(source);
      if (sourceCategory && sourceCategory === ownerCategory && !placedCourses.has(source)) {
        node.children.push(placeCourse(source, ownerCategory));
      } else {
        // Different category (or unknown owner) → cross-branch edge.
        crossBranchEdges.push({ source, target: courseId, type });
      }
    }
    return node;
  }

  // Build a section node with its category children attached.
  function buildSection(sectionName, reqs) {
    const categoryNodes = reqs.map((req) => {
      const courseChildren = (req.courses ?? [])
        .filter((cid) => !placedCourses.has(cid))
        .map((cid) => placeCourse(cid, req.category));
      return {
        kind: "category",
        id: `cat:${sectionName}:${req.category}`,
        data: {
          name: req.category,
          type: req.type ?? "required",
          choose_n: req.choose_n ?? null,
        },
        children: courseChildren,
      };
    });
    return {
      kind: "section",
      id: `sec:${sectionName}`,
      data: { name: sectionName },
      children: categoryNodes, // mutated below to also include the next section
    };
  }

  // Chain sections sequentially: root -> sec1 -> sec2 -> sec3, where each
  // section also has its categories as siblings of the next section. This
  // keeps sections at distinct depths so they spread horizontally instead of
  // stacking in one column.
  const sectionEntries = Array.from(sectionMap.entries());
  const sectionNodes = sectionEntries.map(([name, reqs]) => buildSection(name, reqs));
  for (let i = 0; i < sectionNodes.length - 1; i++) {
    sectionNodes[i].children.push(sectionNodes[i + 1]);
  }
  // The root only owns the first section in the chain.
  const firstSection = sectionNodes[0] ? [sectionNodes[0]] : [];

  return {
    root: {
      kind: "root",
      id: `root:${root}`,
      data: { name: majorName ?? root, major_id: root },
      children: firstSection,
    },
    crossBranchEdges,
  };
}
