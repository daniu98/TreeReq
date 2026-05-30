/**
 * Fetch the prerequisite tree for a major.
 * Returns shape: { root, nodes, edges, requirements }
 *  - root: major_id
 *  - nodes: [{ id, dept, number, title, units, is_elective }]
 *  - edges: [{ source, target, type }]   // type: required | corequisite | one_of
 *  - requirements: [{ category, type, choose_n, courses, section? }]
 */
import { apiUrl } from "./apiBase.js";

/**
 * Fetch all AP credit mappings: exam + score range → UCLA course IDs.
 * Returns [{ ap_exam, score_min, score_max, ucla_courses: string[] }]
 */
export async function fetchApCredits() {
  const url = apiUrl("/api/onboarding/ap-credits");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`AP credits fetch failed (${response.status})`);
  return response.json();
}

export async function fetchMajorTree(majorId) {
  const url = apiUrl(`/api/majors/${encodeURIComponent(majorId)}/tree`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load tree for ${majorId} (${response.status})`);
  }
  return response.json();
}

/**
 * Fetch full course details (description, prereqs_parsed, etc.) for a single course.
 */
export async function fetchCourseDetails(courseId) {
  const encodedId = courseId.replace(/ /g, "+");
  const url = apiUrl(`/api/courses/${encodedId}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}`);
  return response.json();
}

/**
 * Persist a course's completion status.
 * Backend endpoint to be implemented: POST /api/courses/{course_id}/completion
 */
export async function setCourseCompletion(courseId, completed) {
  const url = `/api/courses/${encodeURIComponent(courseId)}/completion`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update ${courseId}`);
  }
  return response.json();
}
