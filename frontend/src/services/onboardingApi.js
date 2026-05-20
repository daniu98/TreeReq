/**
 * @returns {Promise<{ apExams: {value: string, label: string}[], ibExams: {value: string, label: string}[], uclaCourses: {value: string, label: string}[] }>}
 */
export async function fetchAcademicOptions() {
  const response = await fetch("/api/onboarding/academic-options");
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to load options (${response.status})`);
  }
  return response.json();
}
export async function fetchMajors() {
  const response = await fetch ("/api/majors");
  if(!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to load majors (${response.status})`);
  }
  return response.json();
}
