export async function submitAuthRequest(endpoint, email, password) {
  const response = await fetch(`/api/auth/${endpoint}`, {
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
  const response = await fetch('/api/auth/google-sso', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      token: tokenString 
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Google Auth failed");
  }

  return data;
}
