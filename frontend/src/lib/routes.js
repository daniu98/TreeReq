import { getTreeById } from "../data/mockTrees.js";

/** Parse current pathname into app view + optional tree id. */
export function parseLocation(pathname = window.location.pathname) {
  const treeMatch = pathname.match(/^\/tree\/([^/]+)\/?$/);
  if (treeMatch) {
    const treeId = decodeURIComponent(treeMatch[1]);
    if (getTreeById(treeId)) {
      return { view: "tree", treeId };
    }
  }

  if (/^\/setup\/?$/.test(pathname)) {
    return { view: "setup", treeId: null };
  }

  return { view: "landing", treeId: null };
}

export function pathForView(view, treeId = null) {
  if (view === "tree" && treeId) return `/tree/${encodeURIComponent(treeId)}`;
  if (view === "setup") return "/setup";
  return "/";
}

export function getTreeDocumentTitle(tree) {
  if (!tree?.name) return "TreeReq";
  return `TreeReq — ${tree.name}`;
}
