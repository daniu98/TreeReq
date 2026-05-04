import { useState } from "react";
import { submitAuthRequest } from "../../../services/authApi";

const styles = {
  card: {
    maxWidth: "360px",
    margin: "24px auto",
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
  },
  title: {
    marginTop: 0,
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
  },
  passwordLabel: {
    display: "block",
    marginBottom: "14px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "6px",
    padding: "10px",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
  },
  status: {
    minHeight: "20px",
    marginTop: "12px",
  },
};

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function handleAuth(endpoint) {
    if (!email.trim() || !password) {
      setStatus("Please fill out email and password.");
      return;
    }

    setStatus("Submitting...");
    try {
      const message = await submitAuthRequest(endpoint, email, password);
      setStatus(message);
    } catch (error) {
      setStatus(error.message || "Server error. Please try again.");
    }
  }

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>User Auth</h2>

      <label style={styles.label}>
        Email field
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@ucla.edu"
          style={styles.input}
        />
      </label>

      <label style={styles.passwordLabel}>
        Password field
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          style={styles.input}
        />
      </label>

      <div style={styles.buttonRow}>
        <button type="button" onClick={() => handleAuth("login")}>
          Log-in
        </button>
        <button type="button" onClick={() => handleAuth("signup")}>
          Sign-up
        </button>
      </div>

      <p style={styles.status}>{status}</p>
    </section>
  );
}
