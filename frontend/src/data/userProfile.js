import { updateData } from '../services/authApi.js';
import { getData } from '../services/authApi.js';
export const PROFILE_STORAGE_KEY = "treereq_user_profile";

export async function loadStoredProfile() {
  const email = sessionStorage.getItem("treereq-sso-email");
  if(email != null){
    try {
      const email = sessionStorage.getItem("treereq-sso-email");
      const data = await getData(email);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data.message));
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return null;
      //console.log(JSON.parse(raw));
      return JSON.parse(raw);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  else{
    console.log("null");
    return null;
  }
}

export async function saveStoredProfile(profile) {
  try {
    const email = sessionStorage.getItem("treereq-sso-email");
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    await updateData(email, JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)));
  } catch {
    /* ignore */
  }
}
export function loadLocalProfileSync() { // written by gemini
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
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
  // apScores: { [examName]: score } e.g. { "Calculus BC": 5 }
  const apScores = academic?.apScores ?? {};

  return {
    displayName,
    fullName,
    major,
    majorId: profile.major?.value ?? null,
    minor,
    admitTerm: profile.admitTerm?.trim() || "—",
    admitLevel: profile.admitLevel?.trim() || "—",
    gradTerm: profile.gradTerm?.trim() || "—",
    majorFocus,
    uclaCourses,
    apClasses: apRaw.map((v) => (v.startsWith("AP ") ? v : `AP ${v}`)),
    apScores,
    ibClasses: ibRaw.map((v) => (v.startsWith("IB ") ? v : `IB ${v}`)),
  };
}

/**
 * Build a profile from the data returned by the backend for a returning
 * authenticated user (google_sso endpoint, onboarded: true).
 */
export function mapReturnedUserToProfile(data) {
  if (!data) return null;
  const first = (data.firstName || "").trim();
  const last = (data.lastName || "").trim();
  const fullName = [first, last].filter(Boolean).join(" ") || "Student";
  const lastInitial = last ? `${last.charAt(0).toUpperCase()}.` : "";
  const displayName = first && lastInitial ? `${first} ${lastInitial}` : fullName;
  const major = data.major || "—";
  return {
    displayName,
    fullName,
    major,
    majorId: data.majorId || null,
    minor: data.minor || "N/A",
    admitTerm: data.admitTerm || "—",
    admitLevel: data.admitLevel || "—",
    gradTerm: data.gradTerm || "—",
    majorFocus: major.split(",")[0]?.trim() || major,
    uclaCourses: data.uclaCourses ?? [],
    apClasses: (data.apClasses ?? []).map((v) => (v.startsWith("AP ") ? v : `AP ${v}`)),
    apScores: data.apScores ?? {},
    ibClasses: (data.ibClasses ?? []).map((v) => (v.startsWith("IB ") ? v : `IB ${v}`)),
  };
}

export function makeGuestProfile(major) {
  if (!major?.value || !major?.label) return null;
  return {
    displayName: null,
    fullName: null,
    major: major.label,
    majorId: major.value,
  };
}

