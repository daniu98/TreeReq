/** Mock degree trees until backend tree objects exist. */

const TREES = [
  {
    id: "cogsci",
    name: "Cognitive science",
    major: "Cognitive Science, B.S.",
    inForest: true,
    defaultRecent: false,
    revisit: false,
    nodes: [
      {
        type: "category",
        categoryName: "Cognitive Science core",
        completionPercentage: 48,
        courses: [
          { name: "PSYCH 85", status: "Completed" },
          { name: "COM SCI 31", status: "In Progress" },
          { name: "LING 1", status: "Planned" },
          { name: "PSYCH 100A", status: "Planned" },
        ],
      },
      {
        courseName: "PSYCH 85",
        status: "Completed",
        department: "PSYCH",
        description: "Introduction to psychology of personality. Survey of major theories of personality and supporting evidence.",
        prerequisites: [],
        advancedPrep: [],
      },
      {
        courseName: "COM SCI 31",
        status: "In Progress",
        department: "COM SCI",
        description: "Introduction to computer science programming in Python. Basic programming concepts including functions, conditionals, loops, recursion, and data structures.",
        prerequisites: [],
        advancedPrep: [],
      },
      {
        courseName: "LING 1",
        status: "Planned",
        department: "LING",
        description: "Introduction to the study of language. Covers phonetics, phonology, morphology, syntax, semantics, and language acquisition.",
        prerequisites: [],
        advancedPrep: ["LING 1", "PSYCH 85"],
      },
    ],
  },
  {
    id: "bus-econ",
    name: "Business economics",
    major: "Business Economics, B.A.",
    inForest: true,
    defaultRecent: false,
    revisit: false,
    nodes: [
      {
        type: "category",
        categoryName: "Business economics prep",
        completionPercentage: 35,
        courses: [
          { name: "ECON 1", status: "Completed" },
          { name: "MATH 31A", status: "In Progress" },
          { name: "STATS 10", status: "Planned" },
        ],
      },
      {
        courseName: "ECON 1",
        status: "Completed",
        department: "ECON",
        description: "Introduction to microeconomics. Covers supply and demand, consumer and producer theory, market structures, and welfare analysis.",
        prerequisites: [],
        advancedPrep: [],
      },
      {
        courseName: "MATH 31A",
        status: "In Progress",
        department: "MATH",
        description: "Differential and integral calculus of one variable. Topics include limits, derivatives, and integrals with applications.",
        prerequisites: [],
        advancedPrep: [],
      },
      {
        courseName: "STATS 10",
        status: "Planned",
        department: "STATS",
        description: "Introduction to statistical reasoning. Covers data collection, descriptive statistics, probability, and statistical inference.",
        prerequisites: ["MATH 31A"],
        advancedPrep: [],
      },
    ],
  },
  {
    id: "public-affairs",
    name: "Public affairs",
    major: "Public Affairs, B.A.",
    inForest: true,
    defaultRecent: false,
    revisit: false,
    nodes: [
      { type: "category", categoryName: "Public affairs foundation", completionPercentage: 20 },
      { courseName: "PUB AFF 1", status: "In Progress", department: "PUB AFF" },
      { courseName: "POL SCI 10", status: "Planned", department: "POL SCI" },
      { courseName: "SOCIOL 1", status: "Planned", department: "SOCIOL" },
    ],
  },
  {
    id: "env-sci",
    name: "Environmental science engineering",
    major: "Environmental Science, B.S.",
    inForest: false,
    defaultRecent: true,
    revisit: true,
    nodes: [
      { type: "category", categoryName: "Environmental science core", completionPercentage: 55 },
      { courseName: "CHEM 20A", status: "Completed", department: "CHEM" },
      { courseName: "ENVIRON 10", status: "In Progress", department: "ENVIRON" },
      { courseName: "MATH 31B", status: "Planned", department: "MATH" },
    ],
  },
  {
    id: "mech-aero",
    name: "Mechanical engineering aero",
    major: "Mechanical Engineering, B.S.",
    inForest: false,
    defaultRecent: true,
    revisit: true,
    nodes: [
      { type: "category", categoryName: "Mechanical engineering prep", completionPercentage: 41 },
      { courseName: "MATH 31A", status: "Completed", department: "MATH" },
      { courseName: "MECH&AE 82", status: "In Progress", department: "MECH&AE" },
      { courseName: "PHYSICS 1A", status: "Planned", department: "PHYSICS" },
    ],
  },
  {
    id: "aerospace",
    name: "Aerospace engineering with minor",
    major: "Aerospace Engineering, B.S.",
    inForest: false,
    defaultRecent: false,
    revisit: true,
    nodes: [
      { type: "category", categoryName: "Aerospace engineering major", completionPercentage: 28 },
      { courseName: "MECH&AE 82", status: "Completed", department: "MECH&AE" },
      { courseName: "MATH 32A", status: "In Progress", department: "MATH" },
      { courseName: "ENGR 96A", status: "Planned", department: "ENGR" },
    ],
  },
];

function toTreeMeta({ nodes, inForest, defaultRecent, revisit, ...meta }) {
  return meta;
}

const TREE_NODES_BY_ID = Object.fromEntries(TREES.map((t) => [t.id, t.nodes]));

export const MOCK_FORESTS = TREES.filter((t) => t.inForest).map(toTreeMeta);

export const MOCK_ALL_TREES = TREES.map(toTreeMeta);

export const MOCK_RECENT_IDS = TREES.filter((t) => t.defaultRecent).map((t) => t.id);

export const MOCK_REVISIT_TREES = TREES.filter((t) => t.revisit).map((t) => ({
  id: t.id,
  label: t.name.length > 32 ? `${t.name.slice(0, 29)}...` : t.name,
}));

const TREE_BY_ID = Object.fromEntries(MOCK_ALL_TREES.map((t) => [t.id, t]));

export function getTreeById(id) {
  return TREE_BY_ID[id] ?? null;
}

export function getTreeNodes(treeId) {
  return TREE_NODES_BY_ID[treeId] ?? TREE_NODES_BY_ID.cogsci;
}

export function filterTrees(trees, query) {
  const q = query.trim().toLowerCase();
  if (!q) return trees;
  return trees.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      (t.major && t.major.toLowerCase().includes(q))
  );
}

const RECENTS_STORAGE_KEY = "treereq-sidebar-recents";
const RECENT_TIMESTAMPS_KEY = "treereq-recent-timestamps";
const MAJOR_TIMESTAMPS_KEY = "treereq-major-timestamps";

export function loadMajorTimestamps() {
  try {
    const raw = localStorage.getItem(MAJOR_TIMESTAMPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMajorTimestamp(id) {
  try {
    const existing = loadMajorTimestamps();
    localStorage.setItem(MAJOR_TIMESTAMPS_KEY, JSON.stringify({ ...existing, [id]: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function loadRecentTimestamps() {
  try {
    const raw = localStorage.getItem(RECENT_TIMESTAMPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRecentTimestamp(id) {
  try {
    const existing = loadRecentTimestamps();
    localStorage.setItem(RECENT_TIMESTAMPS_KEY, JSON.stringify({ ...existing, [id]: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function loadRecentIds() {
  try {
    const raw = localStorage.getItem(RECENTS_STORAGE_KEY);
    if (!raw) return MOCK_RECENT_IDS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return MOCK_RECENT_IDS;
    const valid = parsed.filter((id) => getTreeById(id));
    return valid.length > 0 ? valid : MOCK_RECENT_IDS;
  } catch {
    return MOCK_RECENT_IDS;
  }
}

export function saveRecentIds(ids) {
  try {
    localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function bumpRecentIds(currentIds, treeId) {
  if (!getTreeById(treeId)) return currentIds;
  const next = [treeId, ...currentIds.filter((id) => id !== treeId)].slice(0, 5);
  saveRecentIds(next);
  return next;
}

export function resolveRecentTrees(ids) {
  return ids.map((id) => getTreeById(id)).filter(Boolean);
}
