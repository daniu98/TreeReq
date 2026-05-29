/**
 * Split flat Mongo categories into section + department sub-categories (CogSci-style layout).
 */

const SECTION_ORDER = ["Preparation for the Major", "The Major", "Capstone"];
const KNOWN_SECTIONS = new Set(SECTION_ORDER);

const DEPT_LABELS = {
  MATH: "Mathematics",
  "COM SCI": "Computer Science",
  PHYSICS: "Physics",
  PSYCH: "Psychology",
  PHIL: "Philosophy",
};

const DEPT_SORT = ["MATH", "PHYSICS", "COM SCI", "PSYCH", "PHIL"];

function deptSortKey(dept) {
  const i = DEPT_SORT.indexOf(dept);
  return i === -1 ? DEPT_SORT.length : i;
}

function parseDept(courseId) {
  const i = courseId.lastIndexOf(" ");
  return i === -1 ? courseId : courseId.slice(0, i);
}

function compareCourses(a, b) {
  const da = parseDept(a);
  const db = parseDept(b);
  const sa = deptSortKey(da) - deptSortKey(db);
  if (sa !== 0) return sa;
  return a.localeCompare(b);
}

function deptLabel(dept) {
  return DEPT_LABELS[dept] ?? dept.replace(/\b\w/g, (c) => c.toUpperCase());
}

function categoryLabel(section, dept, chooseN, rtype) {
  if (section === "Capstone") {
    return chooseN == null ? "Capstone" : `Capstone (choose ${chooseN})`;
  }
  const label = deptLabel(dept);
  if (rtype === "elective" && chooseN) return `${label} (choose ${chooseN})`;
  return label;
}

function orderCourses(courseIds, edges) {
  if (courseIds.length <= 1) return [...courseIds];
  const set = new Set(courseIds);
  const incoming = Object.fromEntries(courseIds.map((c) => [c, new Set()]));
  for (const e of edges) {
    if (set.has(e.source) && set.has(e.target)) incoming[e.target].add(e.source);
  }
  const roots = courseIds.filter((c) => incoming[c].size === 0);
  const ordered = [];
  const seen = new Set();
  function visit(cid) {
    if (seen.has(cid)) return;
    for (const p of [...incoming[cid]].sort(compareCourses)) visit(p);
    seen.add(cid);
    ordered.push(cid);
  }
  for (const r of (roots.length ? roots : courseIds).sort(compareCourses)) visit(r);
  for (const c of courseIds.sort(compareCourses)) if (!seen.has(c)) ordered.push(c);
  return ordered;
}

function enrichRequirements(rawRequirements, edges = []) {
  const enriched = [];
  for (const req of rawRequirements) {
    const category = req.category || "Requirements";
    const courses = (req.courses || []).filter(Boolean);
    if (!courses.length) continue;
    const rtype = req.type || "required";
    const chooseN = req.choose_n ?? null;

    if (KNOWN_SECTIONS.has(category)) {
      const byDept = new Map();
      for (const cid of courses) {
        const d = parseDept(cid);
        if (!byDept.has(d)) byDept.set(d, []);
        byDept.get(d).push(cid);
      }
      if (byDept.size === 1) {
        const dept = [...byDept.keys()][0];
        enriched.push({
          section: category,
          category: categoryLabel(category, dept, chooseN, rtype),
          type: rtype,
          choose_n: chooseN,
          courses: orderCourses(courses, edges),
        });
      } else {
        for (const dept of [...byDept.keys()].sort((a, b) => deptSortKey(a) - deptSortKey(b))) {
          enriched.push({
            section: category,
            category: categoryLabel(category, dept, null, rtype),
            type: rtype,
            choose_n: null,
            courses: orderCourses(byDept.get(dept), edges),
          });
        }
      }
    } else if (req.section) {
      enriched.push({ ...req, courses: orderCourses(courses, edges) });
    } else {
      enriched.push({
        section: "Requirements",
        category,
        type: rtype,
        choose_n: chooseN,
        courses: orderCourses(courses, edges),
      });
    }
  }
  enriched.sort(
    (a, b) =>
      SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section) ||
      (a.category || "").localeCompare(b.category || "")
  );
  return enriched;
}

export function enrichTreeResponse(apiResponse) {
  if (!apiResponse) return apiResponse;
  const already = (apiResponse.requirements ?? []).some(
    (r) => r.section && !KNOWN_SECTIONS.has(r.category)
  );
  if (already) return apiResponse;
  return {
    ...apiResponse,
    requirements: enrichRequirements(apiResponse.requirements ?? [], apiResponse.edges ?? []),
  };
}
