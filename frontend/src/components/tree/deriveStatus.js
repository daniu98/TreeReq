/**
 * Derive node statuses from a `statusMap` ({ course_id -> "planned" | "in_progress" | "completed" })
 * and a hierarchy of nodes.
 *
 * Course statuses:
 *   - "completed"   : statusMap[id] === "completed"
 *   - "in_progress" : statusMap[id] === "in_progress"
 *   - "planned"     : statusMap[id] === "planned"
 *   - "locked"      : not in statusMap AND has unmet required prerequisites
 *   - "unfulfilled" : not in statusMap AND all prerequisites met (default)
 *
 * Category / section / root statuses (derived):
 *   - "completed"   : all descendant courses completed
 *   - "in_progress" : some descendant courses completed
 *   - "not_started" : zero descendant courses completed
 *
 * A node also gets `completionPercentage` for category-level rendering.
 */

export function deriveStatuses(rootHierarchy, statusMap, prereqIndex) {
  function visit(node) {
    if (node.kind === "course") {
      const id = node.id;
      const explicit = statusMap[id]; // "planned" | "in_progress" | "completed" | undefined
      const prereqs = prereqIndex.get(id) ?? [];
      const requiredPrereqs = prereqs.filter((p) => p.type === "required");
      const allRequiredMet = requiredPrereqs.every(
        (p) => statusMap[p.source] === "completed"
      );

      let status;
      if (explicit === "completed") status = "completed";
      else if (explicit === "in_progress") status = "in_progress";
      else if (explicit === "planned") status = "planned";
      else if (!allRequiredMet && requiredPrereqs.length > 0) status = "locked";
      else status = "unfulfilled";

      const completed = status === "completed";
      const visitedChildren = (node.children ?? []).map(visit);
      const childTotal = visitedChildren.reduce((s, c) => s + (c.totalCourses ?? 0), 0);
      const childCompleted = visitedChildren.reduce((s, c) => s + (c.completedCourses ?? 0), 0);
      return {
        ...node,
        status,
        completed,
        completionPercentage: completed ? 100 : 0,
        totalCourses: 1 + childTotal,
        completedCourses: (completed ? 1 : 0) + childCompleted,
        unmetPrereqs: requiredPrereqs
          .filter((p) => statusMap[p.source] !== "completed")
          .map((p) => p.source),
        children: visitedChildren,
      };
    }

    const children = (node.children ?? []).map(visit);
    const totalCourses = children.reduce((sum, c) => sum + (c.totalCourses ?? 0), 0);
    const completedCourses = children.reduce(
      (sum, c) => sum + (c.completedCourses ?? 0),
      0
    );
    // For "choose N of M" categories, use choose_n as the denominator so that
    // completing N courses registers as 100% rather than requiring all M.
    const required = node.kind === "category" && node.data?.choose_n != null
      ? node.data.choose_n
      : totalCourses;
    const completionPercentage =
      required === 0 ? 0 : Math.min(100, Math.round((completedCourses / required) * 100));
    const status =
      completionPercentage === 100
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
