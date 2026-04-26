import { useEffect, useMemo, useState } from "react";
import { Button } from "./components/ui/Button.jsx";
import { Select } from "./components/ui/Select.jsx";
import AuthForm from './components/features/auth/AuthForm'

const majors = [
  { value: "physics", label: "Physics" },
  { value: "cs", label: "Computer Science" },
  { value: "cogsci", label: "Cognitive Science" },
];

const minors = [
  { value: "", label: "None" },
  { value: "dh", label: "Digital Humanities" },
  { value: "math", label: "Mathematics" },
];

const coursePool = [
  { value: "COM SCI 31", label: "COM SCI 31" },
  { value: "MATH 31B", label: "MATH 31B" },
  { value: "PSYCH 85", label: "PSYCH 85" },
  { value: "COMMS 10", label: "COMMS 10" },
  { value: "CHEM 20A", label: "CHEM 20A" },
];

const page = {
  maxWidth: 520,
  margin: "0 auto",
  padding: "28px 20px 48px",
};

const navBar = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  padding: "12px 16px",
  background: "var(--bg-sidebar)",
  borderRadius: "var(--radius-md)",
  marginBottom: 28,
};

const navBtn = {
  border: "none",
  background: "transparent",
  padding: "8px 12px",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  fontSize: "0.9rem",
  cursor: "pointer",
};

function Chip({ label, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: "var(--surface-muted)",
        fontSize: "0.82rem",
      }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          lineHeight: 1,
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        ×
      </button>
    </span>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [major, setMajor] = useState("");
  const [minor, setMinor] = useState("");
  const [coursePick, setCoursePick] = useState("");
  const [taken, setTaken] = useState([]);

  const availableCourses = useMemo(
    () => coursePool.filter((c) => !taken.includes(c.value)),
    [taken]
  );

  useEffect(() => {
    if (coursePick && !availableCourses.some((c) => c.value === coursePick)) {
      setCoursePick("");
    }
  }, [availableCourses, coursePick]);

  function addCourse() {
    if (!coursePick || taken.includes(coursePick)) return;
    setTaken((t) => [...t, coursePick]);
    setCoursePick("");
  }

  const canGoNext = step === 0 && major !== "";

  return (
    <div style={{ ...page, background: "var(--bg-main)", minHeight: "100vh" }}>
      <nav style={navBar} aria-label="Primary">
        <button type="button" style={navBtn}>
          Notes
        </button>
        <button type="button" style={navBtn}>
          Previous trees
        </button>
        <button type="button" style={navBtn}>
          Progress
        </button>
        <button type="button" style={navBtn}>
          Settings
        </button>
        <button type="button" style={navBtn}>
          Help
        </button>
      </nav>

      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 20px" }}>
        Step {step + 1} of 2 (lo-fi: major / minor, then previous classes)
      </p>

      {step === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Select
            id="major"
            label="Choose major:"
            value={major}
            onChange={setMajor}
            options={majors}
            placeholder="Select a major"
          />
          <Select id="minor" label="Choose minor:" value={minor} onChange={setMinor} options={minors} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Select
            id="prev-class"
            label="Previous classes"
            value={coursePick}
            onChange={setCoursePick}
            options={availableCourses}
            placeholder="Pick a course"
          />
          <div>
            <Button type="button" variant="secondary" onClick={addCourse} disabled={!coursePick}>
              Add class
            </Button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 36 }}>
            {taken.map((code) => (
              <Chip key={code} label={code} onRemove={() => setTaken((t) => t.filter((x) => x !== code))} />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 32,
          gap: 12,
        }}
      >
        <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep(0)}>
          Previous
        </Button>
        <Button type="button" variant="primary" disabled={!canGoNext} onClick={() => setStep(1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
