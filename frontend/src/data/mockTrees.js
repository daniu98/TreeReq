/** Mock degree trees until backend tree objects exist. */

export const MOCK_FORESTS = [
  { id: "cogsci", name: "Cognitive science", major: "Cognitive Science, B.S." },
  { id: "bus-econ", name: "Business economics", major: "Business Economics, B.A." },
  { id: "public-affairs", name: "Public affairs", major: "Public Affairs, B.A." },
];

export const MOCK_RECENT_IDS = ["env-sci", "mech-aero"];

export const MOCK_ALL_TREES = [
  ...MOCK_FORESTS,
  { id: "env-sci", name: "Environmental science engineering", major: "Environmental Science, B.S." },
  { id: "mech-aero", name: "Mechanical engineering aero", major: "Mechanical Engineering, B.S." },
  { id: "aerospace", name: "Aerospace engineering with minor", major: "Aerospace Engineering, B.S." },
];

const TREE_BY_ID = Object.fromEntries(MOCK_ALL_TREES.map((t) => [t.id, t]));

export function getTreeById(id) {
  return TREE_BY_ID[id] ?? null;
}

export function getTreeNodes(_treeId) {
  return [
    { type: "category", categoryName: "Major prep", completionPercentage: 62 },
    { courseName: "COM SCI 31", status: "Completed", department: "COM SCI" },
    { courseName: "MATH 31B", status: "In Progress", department: "MATH" },
    { courseName: "PSYCH 85", status: "Planned", department: "PSYCH" },
  ];
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
    return Array.isArray(parsed) ? parsed : [...MOCK_RECENT_IDS];
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
  const next = [treeId, ...currentIds.filter((id) => id !== treeId)].slice(0, 5);
  saveRecentIds(next);
  return next;
}

export function resolveRecentTrees(ids) {
  return ids.map((id) => getTreeById(id)).filter(Boolean);
}
