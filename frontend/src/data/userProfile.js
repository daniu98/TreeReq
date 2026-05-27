export const PROFILE_STORAGE_KEY = "treereq_user_profile";

export function loadStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function mapOnboardingToProfile({ profile, academic }) {
  if (!profile) return null;

  const first = profile.firstName?.trim() ?? "";
  const last = profile.lastName?.trim() ?? "";
  const fullName = [first, last].filter(Boolean).join(" ") || "Student";
  const lastInitial = last ? `${last.charAt(0).toUpperCase()}.` : "";
  const displayName = first && lastInitial ? `${first} ${lastInitial}` : fullName;

  const major =
    (typeof profile.major === "object" && profile.major?.label) ||
    (typeof profile.majors === "string" && profile.majors.trim()) ||
    profile.major?.value ||
    "—";
  const minor =
    (typeof profile.minors === "string" && profile.minors.trim()) || "N/A";
  const majorFocus = major.split(",")[0]?.trim() || major;

  const apRaw = academic?.apClasses ?? [];
  const ibRaw = academic?.ibClasses ?? [];
  const uclaCourses = academic?.uclaCourses ?? [];

  return {
    displayName,
    fullName,
    major,
    minor,
    admitTerm: profile.admitTerm?.trim() || "—",
    admitLevel: profile.admitLevel?.trim() || "—",
    gradTerm: profile.gradTerm?.trim() || "—",
    majorFocus,
    uclaCourses,
    apClasses: apRaw.map((v) => (v.startsWith("AP ") ? v : `AP ${v}`)),
    ibClasses: ibRaw.map((v) => (v.startsWith("IB ") ? v : `IB ${v}`)),
  };
}
