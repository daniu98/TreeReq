import { apiUrl } from "./apiBase.js";

export async function submitAuthRequest(endpoint, email, password) {
  const response = await fetch(apiUrl(`/api/auth/${endpoint}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data.message;
}

export async function submitGoogleAuthRequest(tokenString) {
  const response = await fetch(apiUrl("/api/auth/google-sso"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: tokenString }),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      response.status === 404
        ? "Sign-in endpoint missing. Run the backend on port 8000 with the latest code."
        : `Bad response from server (${response.status}).`
    );
  }
  if (!response.ok) {
    const detail = data?.detail;
    let message;
    if (typeof detail === "string") message = detail;
    else if (Array.isArray(detail)) {
      message = detail.map((x) => x?.msg || x).filter(Boolean).join("; ");
    }
    throw new Error(message || data?.message || "Google sign-in failed");
  }

  return data;
}
export async function submitOnboardingData(email, firstName, lastName, major, minor, admitTerm, admitLevel, expectedGraduationTerm, apClasses, ibClasses, uclaClasses){
  const response = await fetch(apiUrl("/api/auth/submit-onboarding-data"), {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({
      email,
      firstName,
      lastName,
      major,
      minor,
      admitTerm,
      admitLevel,
      expectedGraduationTerm,
      apClasses,
      ibClasses,
      uclaClasses,
    }),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      response.status === 404
        ? "Sign-in endpoint missing. Run the backend on port 8000 with the latest code."
        : `Bad response from server (${response.status}).`
    );
  }
  if (!response.ok) {
    const detail = data?.detail;
    let message;
    if (typeof detail === "string") message = detail;
    else if (Array.isArray(detail)) {
      message = detail.map((x) => x?.msg || x).filter(Boolean).join("; ");
    }
    throw new Error(message || data?.message || "Google sign-in failed");
  }

  return data;
}
export async function checkIfOnboarded(email){
  const response = await fetch(apiUrl("/api/auth/check-if-onboarded"), {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({email}),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      response.status === 404
        ? "Sign-in endpoint missing. Run the backend on port 8000 with the latest code."
        : `Bad response from server (${response.status}).`
    );
  }
  if (!response.ok) {
    const detail = data?.detail;
    let message;
    if (typeof detail === "string") message = detail;
    else if (Array.isArray(detail)) {
      message = detail.map((x) => x?.msg || x).filter(Boolean).join("; ");
    }
    throw new Error(message || data?.message || "Google sign-in failed");
  }

  return data;
}
