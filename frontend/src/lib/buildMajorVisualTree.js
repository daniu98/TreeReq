/**
 * Client-side port of backend/tree_builder.py
 * Transforms any major JSON (parsed file or API payload) into a visual tree graph.
 */

const MILESTONE_LABELS = {
  root: null,
  prep: "Preparation for the Major",
  major: "The Major",
  capstone: "Capstone",
};

const PREP_KEYWORDS = [
  "preparation for the major",
  "preparation for major",
  "prep for the major",
  "preparatory",
  "preparation",
  "prep ",
  "lower division preparation",
];

const CAPSTONE_KEYWORDS = ["capstone", "senior capstone", "design project", "senior design"];

const MAJOR_KEYWORDS = [
  "the major",
  "upper division",
  "required course",
  "required courses",
  "breadth",
  "concentration",
  "core course",
  "elective",
  "electives",
];

function slug(text) {
  return (
    String(text || "node")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "node"
  );
}

function courseLookup(courses) {
  const map = new Map();
  for (const c of courses || []) {
    if (c?.course_id) map.set(c.course_id, c);
  }
  return map;
}

export function milestoneHeaderKey(categoryName) {
  const n = (categoryName || "").toLowerCase().trim();
  if (["preparation for the major", "preparation for major", "prep for the major"].includes(n)) return "prep";
  if (["the major", "major requirements", "major"].includes(n)) return "major";
  if (n === "capstone" || n.startsWith("capstone ")) return "capstone";
  if (CAPSTONE_KEYWORDS.some((k) => n.includes(k)) && n.length < 40) return "capstone";
  if (PREP_KEYWORDS.some((k) => n.includes(k)) && n.length < 50) return "prep";
  return null;
}

export function classifyMilestone(categoryName, reqType = "required") {
  const n = (categoryName || "").toLowerCase().trim();
  if (CAPSTONE_KEYWORDS.some((k) => n.includes(k))) return "capstone";
  if (PREP_KEYWORDS.some((k) => n.includes(k))) return "prep";
  if (MAJOR_KEYWORDS.some((k) => n.includes(k))) return "major";
  if (reqType === "elective") return "major";
  return "major";
}

function assignRequirementsToMilestones(requirements) {
  const buckets = { prep: [], major: [], capstone: [] };
  let active = null;

  requirements.forEach((req, idx) => {
    const catName = req.category || `Requirement ${idx + 1}`;
    const courses = req.courses || [];
    const header = milestoneHeaderKey(catName);

    if (header && courses.length === 0) {
      active = header;
      return;
    }

    let milestone;
    if (header) {
      active = header;
      milestone = header;
    } else {
      milestone =
        active != null ? active : classifyMilestone(catName, req.type || "required");
    }

    buckets[milestone].push({ ...req, category: catName, _index: idx });
  });

  return buckets;
}

function parsePrereqs(course) {
  const raw = course?.prereqs_parsed || {};
  return {
    required: [...(raw.required || [])],
    corequisites: [...(raw.corequisites || [])],
    one_of: (raw.one_of || []).map((g) => (Array.isArray(g) ? [...g] : [g])),
  };
}

function categoryNodeId(milestoneKey, categoryName, index) {
  return `cat:${slug(milestoneKey)}:${slug(categoryName)}:${index}`;
}

function courseNodeId(categoryKey, courseId) {
  return `course:${slug(categoryKey)}:${slug(courseId)}`;
}

/**
 * @param {object} majorDoc - { major_id, major_name|name, requirements[], courses[]? }
 * @returns Visual tree graph for rendering
 */
export function buildMajorVisualTree(majorDoc) {
  const majorId = majorDoc.major_id || slug(majorDoc.major_name || majorDoc.name || "major");
  const majorName = majorDoc.major_name || majorDoc.name || majorId;
  const requirements = majorDoc.requirements || [];
  const lookup = courseLookup(majorDoc.courses);

  const majorCourseIds = new Set();
  for (const req of requirements) {
    for (const cid of req.courses || []) {
      if (cid) majorCourseIds.add(cid);
    }
  }

  const electiveIds = new Set();
  for (const req of requirements) {
    if (req.type === "elective" || req.choose_n) {
      for (const cid of req.courses || []) electiveIds.add(cid);
    }
  }

  const buckets = assignRequirementsToMilestones(requirements);

  const nodes = [];
  const edges = [];
  const sections = [];
  let edgeSeq = 0;

  const addEdge = (source, target, kind, extra = {}) => {
    edges.push({ id: `e${edgeSeq++}`, source, target, kind, ...extra });
  };

  const rootId = `milestone:root:${majorId}`;
  nodes.push({
    id: rootId,
    kind: "milestone",
    role: "root",
    milestone_key: "root",
    label: majorName,
  });

  let prevMilestoneId = rootId;
  const milestoneChain = [{ key: "root", id: rootId, label: majorName }];
  const courseIdToNode = new Map();
  const pendingPrereqEdges = [];

  for (const mKey of ["prep", "major", "capstone"]) {
    const mId = `milestone:${mKey}:${majorId}`;
    const mLabel = MILESTONE_LABELS[mKey] || majorName;
    nodes.push({
      id: mId,
      kind: "milestone",
      role: "spine",
      milestone_key: mKey,
      label: mLabel,
    });
    milestoneChain.push({ key: mKey, id: mId, label: mLabel });
    addEdge(prevMilestoneId, mId, "spine");
    prevMilestoneId = mId;

    const sectionCategories = [];

    for (const [catIdx, req] of buckets[mKey].entries()) {
      const catName = req.category;
      const catKey = categoryNodeId(mKey, catName, catIdx);
      const chooseN = req.choose_n ?? null;
      const reqType = req.type || "required";
      const courseIds = [...new Set(req.courses || [])];

      let subtitle = null;
      if (chooseN) subtitle = `Choose ${chooseN}`;
      else if (reqType === "elective") subtitle = "Elective";

      nodes.push({
        id: catKey,
        kind: "category",
        milestone_key: mKey,
        label: catName,
        subtitle,
        type: reqType,
        choose_n: chooseN,
        completion_percentage: 0,
      });
      addEdge(mId, catKey, "contains");

      const courseNodes = [];
      const catPrereqEdges = [];

      for (const courseId of courseIds) {
        const info = lookup.get(courseId) || {};
        const dept = info.dept || (courseId.includes(" ") ? courseId.split(" ").slice(0, -1).join(" ") : courseId);
        const title = info.title || courseId;
        const nId = courseNodeId(catKey, courseId);

        nodes.push({
          id: nId,
          kind: "course",
          milestone_key: mKey,
          category_key: catKey,
          course_id: courseId,
          label: courseId,
          title,
          department: dept,
          units: info.units ?? 0,
          status: "Unfulfilled",
          is_elective: electiveIds.has(courseId),
        });
        addEdge(catKey, nId, "contains");
        courseIdToNode.set(courseId, nId);

        courseNodes.push({
          id: nId,
          course_id: courseId,
          courseName: courseId,
          department: dept,
          title,
          status: "Unfulfilled",
          is_elective: electiveIds.has(courseId),
        });

        const prereqs = parsePrereqs(info);
        for (const prereqId of prereqs.required) {
          if (majorCourseIds.has(prereqId)) {
            pendingPrereqEdges.push({ source: prereqId, target: courseId, kind: "prereq" });
            catPrereqEdges.push({ source: prereqId, target: courseId, kind: "prereq" });
          }
        }
        for (const prereqId of prereqs.corequisites) {
          if (majorCourseIds.has(prereqId)) {
            pendingPrereqEdges.push({ source: prereqId, target: courseId, kind: "corequisite" });
            catPrereqEdges.push({ source: prereqId, target: courseId, kind: "corequisite" });
          }
        }
        for (const group of prereqs.one_of) {
          for (const optionId of group) {
            if (majorCourseIds.has(optionId)) {
              pendingPrereqEdges.push({ source: optionId, target: courseId, kind: "one_of", group });
              catPrereqEdges.push({ source: optionId, target: courseId, kind: "one_of" });
            }
          }
        }
      }

      sectionCategories.push({
        category: {
          id: catKey,
          label: catName,
          type: reqType,
          choose_n: chooseN,
          subtitle,
          completion_percentage: 0,
        },
        courses: courseNodes,
        prereq_edges: catPrereqEdges,
      });
    }

    sections.push({
      milestone: { key: mKey, id: mId, label: mLabel },
      categories: sectionCategories,
    });
  }

  for (const pe of pendingPrereqEdges) {
    const src = courseIdToNode.get(pe.source);
    const tgt = courseIdToNode.get(pe.target);
    if (src && tgt) addEdge(src, tgt, pe.kind, pe.group ? { group: pe.group } : {});
  }

  return {
    major_id: majorId,
    major_name: majorName,
    milestones: milestoneChain,
    nodes,
    edges,
    sections,
    stats: {
      requirement_categories: requirements.length,
      courses: majorCourseIds.size,
      nodes: nodes.length,
      edges: edges.length,
    },
  };
}

/** Flatten spine milestones for the current linear Tree.jsx preview */
export function visualTreeToSpineNodes(visualTree) {
  return (visualTree.milestones || []).map((m) => ({
    type: "category",
    variant: m.key === "root" ? "overarching" : "overarching",
    categoryName: m.label,
    completionPercentage: m.key === "root" ? undefined : 0,
  }));
}

/** Flatten one category column: category + its courses (for horizontal strips) */
export function sectionToTreeNodes(section) {
  const out = [];
  const m = section.milestone;
  if (m) {
    out.push({
      type: "category",
      variant: "overarching",
      categoryName: m.label,
    });
  }
  for (const block of section.categories || []) {
    out.push({
      type: "category",
      categoryName: block.category.label,
      completionPercentage: block.category.completion_percentage ?? 0,
      subtitle: block.category.subtitle,
    });
    for (const c of block.courses || []) {
      out.push({
        courseName: c.courseName,
        department: c.department,
        status: c.status || "Unfulfilled",
      });
    }
  }
  return out;
}
