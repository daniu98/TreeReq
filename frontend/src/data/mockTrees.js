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
      { type: "category", categoryName: "Cognitive Science core", completionPercentage: 48 },
      { courseName: "PSYCH 85", status: "Completed", department: "PSYCH" },
      { courseName: "COM SCI 31", status: "In Progress", department: "COM SCI" },
      { courseName: "LING 1", status: "Planned", department: "LING" },
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
      { type: "category", categoryName: "Business economics prep", completionPercentage: 35 },
      { courseName: "ECON 1", status: "Completed", department: "ECON" },
      { courseName: "MATH 31A", status: "In Progress", department: "MATH" },
      { courseName: "STATS 10", status: "Planned", department: "STATS" },
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

export function loadRecentIds() {
  try {
    const raw = localStorage.getItem(RECENTS_STORAGE_KEY);
    if (!raw) return [...MOCK_RECENT_IDS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...MOCK_RECENT_IDS];
    return parsed.filter((id) => getTreeById(id));
  } catch {
    return [...MOCK_RECENT_IDS];
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
