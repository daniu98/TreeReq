/**
 * Derive node statuses from a `completionMap` ({ course_id -> bool })
 * and a hierarchy of nodes.
 *
 * Course statuses:
 *   - "completed"   : completionMap[id] === true
 *   - "locked"      : has unmet prerequisites
 *   - "in_progress" : not implemented at backend yet (reserved for future)
 *   - "planned"     : default (unlocked but not completed)
 *
 * Category / section / root statuses (derived):
 *   - "completed"   : all descendant courses completed
 *   - "in_progress" : some descendant courses completed
 *   - "not_started" : zero descendant courses completed
 *
 * A node also gets `completionPercentage` for category-level rendering.
 */

export function deriveStatuses(rootHierarchy, completionMap, prereqIndex) {
  // Walk depth-first, computing status for courses first then aggregating up.
  function visit(node) {
    if (node.kind === "course") {
      const id = node.id;
      const completed = completionMap[id] === true;
      const prereqs = prereqIndex.get(id) ?? [];
      const requiredPrereqs = prereqs.filter((p) => p.type === "required");
      const allRequiredMet = requiredPrereqs.every(
        (p) => completionMap[p.source] === true
      );
      const status = completed
        ? "completed"
        : allRequiredMet
        ? "planned"
        : "locked";
      return {
        ...node,
        status,
        completed,
        completionPercentage: completed ? 100 : 0,
        totalCourses: 1,
        completedCourses: completed ? 1 : 0,
        unmetPrereqs: requiredPrereqs
          .filter((p) => completionMap[p.source] !== true)
          .map((p) => p.source),
        children: (node.children ?? []).map(visit),
      };
    }

    const children = (node.children ?? []).map(visit);
    const totalCourses = children.reduce((sum, c) => sum + (c.totalCourses ?? 0), 0);
    const completedCourses = children.reduce(
      (sum, c) => sum + (c.completedCourses ?? 0),
      0
    );
    const completionPercentage = totalCourses === 0
      ? 0
      : Math.round((completedCourses / totalCourses) * 100);
    const status = completionPercentage === 100
      ? "completed"
      : completionPercentage > 0
      ? "in_progress"
      : "not_started";
    return {
      ...node,
      children,
      totalCourses,
      completedCourses,
      completionPercentage,
      status,
    };
  }

  return visit(rootHierarchy);
}

/** Build a quick prereq lookup index from API edges. */
export function buildPrereqIndex(edges) {
  const idx = new Map();
  for (const e of edges) {
    if (!idx.has(e.target)) idx.set(e.target, []);
    idx.get(e.target).push({ source: e.source, type: e.type ?? "required" });
  }
  return idx;
}
