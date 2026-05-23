import { buildMajorVisualTree } from "../lib/buildMajorVisualTree.js";
import { apiUrl } from "./apiBase.js";

export async function fetchMajors() {
  const res = await fetch(apiUrl("/api/majors"));
  if (!res.ok) throw new Error(`Failed to load majors (${res.status})`);
  return res.json();
}

export async function fetchMajor(majorId) {
  const res = await fetch(apiUrl(`/api/majors/${encodeURIComponent(majorId)}`));
  if (!res.ok) throw new Error(`Major not found (${res.status})`);
  return res.json();
}

/** Figma-style hierarchical tree (milestones → categories → courses) */
export async function fetchMajorVisualTree(majorId) {
  const res = await fetch(apiUrl(`/api/majors/${encodeURIComponent(majorId)}/visual-tree`));
  if (!res.ok) throw new Error(`Failed to load visual tree (${res.status})`);
  return res.json();
}

/** Prereq DAG from existing endpoint */
export async function fetchMajorPrereqTree(majorId) {
  const res = await fetch(apiUrl(`/api/majors/${encodeURIComponent(majorId)}/tree`));
  if (!res.ok) throw new Error(`Failed to load prereq tree (${res.status})`);
  return res.json();
}

/** Build client-side from a parsed JSON object (no API) */
export function buildVisualTreeFromJson(majorDoc) {
  return buildMajorVisualTree(majorDoc);
}
