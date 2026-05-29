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

  if (pathname === "/" || pathname === "") {
    return { view: "landing", treeId: null };
  }
  const majorMatch = pathname.match(/^\/majors\/([^/]+)\/?$/);
  if (majorMatch) {
    return { view: decodeURIComponent(majorMatch[1]), treeId: null };
  }

  const prospectiveView = pathname.replace(/^\//, "").replace(/\/$/, "");
  return { view: prospectiveView, treeId: null };
}

export function pathForView(view, treeId = null) {
  if (view === "tree" && treeId) return `/tree/${encodeURIComponent(treeId)}`;
  if (view === "setup") return "/setup";
  if (view === "landing") return "/";

  return `/majors/${view}`;
}

export function getTreeDocumentTitle(tree) {
  if (!tree?.name) return "TreeReq";
  return `TreeReq — ${tree.name}`;
}
