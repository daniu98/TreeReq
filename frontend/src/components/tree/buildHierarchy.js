/**
 * Transforms a flat API response { nodes, edges, requirements } into a nested
 * hierarchy: root -> section -> category -> course (-> dependent course chains).
 *
 * Tree direction: left-to-right, prereq on the LEFT, dependent on the RIGHT.
 * Within a department (category), a course with no in-dept prereqs connects
 * directly to the category node. Courses that depend on it appear as its
 * children (further right). Cross-department prereq/coreq edges are collected
 * separately and shown only on hover.
 */

const DEFAULT_SECTION = "Requirements";

export function buildHierarchy(apiResponse, majorName) {
  const { root, nodes = [], edges = [], requirements = [] } = apiResponse;

  // Index courses by id.
  const courseById = new Map(nodes.map((n) => [n.id, n]));

  // prereqsOf[target] = [{ source, type }]  — used to find root courses.
  const prereqsOf = new Map();
  // dependentsOf[source] = [{ target, type }] — used to build left→right chains.
  const dependentsOf = new Map();
  for (const e of edges) {
    if (!prereqsOf.has(e.target)) prereqsOf.set(e.target, []);
    prereqsOf.get(e.target).push({ source: e.source, type: e.type ?? "required" });

    if (!dependentsOf.has(e.source)) dependentsOf.set(e.source, []);
    dependentsOf.get(e.source).push({ target: e.target, type: e.type ?? "required" });
  }

  // Course → its requirement category.
  const categoryOfCourse = new Map();
  for (const req of requirements) {
    for (const cid of req.courses ?? []) {
      categoryOfCourse.set(cid, req.category);
    }
  }

  // Group requirements by section.
  const sectionMap = new Map();
  for (const req of requirements) {
    const section = req.section ?? DEFAULT_SECTION;
    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section).push(req);
  }

  const placedCourses = new Set();

  /**
   * Place a course node. Its in-category dependents (courses that require THIS
   * course, within the same department) become its children — implementing the
   * left-to-right prereq→dependent flow.
   */
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

    // Recurse into in-category dependents.
    const outgoing = dependentsOf.get(courseId) ?? [];
    for (const { target } of outgoing) {
      if (
        categoryOfCourse.get(target) === ownerCategory &&
        !placedCourses.has(target)
      ) {
        node.children.push(placeCourse(target, ownerCategory));
      }
    }
    return node;
  }

  function buildSection(sectionName, reqs) {
    const categoryNodes = reqs.map((req) => {
      const catCourses = req.courses ?? [];
      const catCourseSet = new Set(catCourses);

      // Root courses: those whose prereqs are all outside this category.
      const rootIds = catCourses
        .filter((cid) => !placedCourses.has(cid))
        .filter((cid) => {
          const prereqs = prereqsOf.get(cid) ?? [];
          return !prereqs.some((p) => catCourseSet.has(p.source));
        });

      const courseChildren = rootIds.map((cid) => placeCourse(cid, req.category));

      // Fallback: place any still-unplaced courses (cycles or orphaned nodes).
      const remaining = catCourses
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
        children: [...courseChildren, ...remaining],
      };
    });

    return {
      kind: "section",
      id: `sec:${sectionName}`,
      data: { name: sectionName },
      children: categoryNodes,
    };
  }

  // All sections are direct children of root so they appear in the same
  // column, stacked vertically — Preparation, The Major, Capstone side by side.
  const sectionEntries = Array.from(sectionMap.entries());
  const sectionNodes = sectionEntries.map(([name, reqs]) => buildSection(name, reqs));

  // Cross-branch edges: edges that connect courses in different categories.
  // These are rendered separately (on hover only).
  const seen = new Set();
  const crossBranchEdges = [];
  for (const e of edges) {
    const key = `${e.source}->${e.target}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const srcCat = categoryOfCourse.get(e.source);
    const tgtCat = categoryOfCourse.get(e.target);
    if (srcCat !== tgtCat) {
      crossBranchEdges.push({ source: e.source, target: e.target, type: e.type ?? "required" });
    }
  }

  return {
    root: {
      kind: "root",
      id: `root:${root}`,
      data: { name: majorName ?? root, major_id: root },
      children: sectionNodes,
    },
    crossBranchEdges,
  };
}