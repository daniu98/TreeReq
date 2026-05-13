import { useState } from "react";
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { submitGoogleAuthRequest } from "../../services/authApi";

/**
 * Initial onboarding step from URL (dev shortcuts).
 * Default is `welcome` so onboarding starts at Google sign-in.
 */
function readInitialStep() {
  try {
    const q = new URLSearchParams(window.location.search).get("onboarding");
    if (q === "excited") return "excited";
    if (q === "welcome") return "welcome";
    if (q === "profile") return "profile";
  } catch {
    /* ignore */
  }
  return "welcome";
}

const green = "#46B981";

/** First screen: mock welcome copy; Continue goes to Google sign-in. */
function OnboardingIntro({ onContinue }) {
  return (
    <div className="onboarding-intro-root">
      <p className="onboarding-intro-message">
        Welcome to TreeReq, we&apos;re excited to grow with you!
      </p>
      <button type="button" className="onboarding-intro-continue" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

/** Standard multicolor Google "G" icon. */
function GoogleMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
/** Step A: welcome + UCLA Google sign-in (split layout). */
function OnboardingWelcome({ onContinue }) {
  const [status, setStatus] = useState("");
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setStatus("Verifying token with server...");
      
      const modernToken = credentialResponse.credential;
            
      const data = await submitGoogleAuthRequest(modernToken);
      
      setStatus(data.message);
      onContinue();
      
    } catch (error) {
      console.error(error);
      setStatus("Server error. Please try again.");
    }
  };
  return (
    <div className="onboarding-first-root">
      <img
        className="onboarding-first-visual"
        src="https://placehold.co/747x832"
        alt=""
        aria-hidden="true"
      />
      <div className="onboarding-first-content">
        <div className="onboarding-first-title-wrap">
          <div className="onboarding-first-title">Welcome to TreeRec</div>
          <div className="onboarding-first-tagline">Degree-planning reimagined.</div>
        </div>
        <div className="onboarding-first-login-wrap">
          <div className="onboarding-first-help">Please log in with your UCLA account.</div>
          <div className="onboarding-first-google">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log("Google Popup closed or failed");
                setStatus("Login Failed. Please try again.");
              }}
              width="245px"
              useOneTap={false}
              auto_select={false}
            />
          </div>
          <p
            className="onboarding-first-status"
            style={{ color: status.includes("error") || status.includes("Failed") ? "red" : "green" }}
          >
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, id, ...props }) {
  return (
    <label className="onboarding-profile-field" htmlFor={id}>
      <span className="onboarding-profile-label">
        {label}
        {required ? " *" : ""}
      </span>
      <input id={id} className="onboarding-profile-input" required={required} {...props} />
    </label>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="onboarding-academic-chip">
      <span className="onboarding-academic-chip-label">{label}</span>
      <button type="button" className="onboarding-academic-chip-remove" onClick={onRemove} aria-label={`Remove ${label}`}>
        <span className="onboarding-academic-chip-x" aria-hidden />
      </button>
    </span>
  );
}

function AcademicCourseSection({ id, label, values, draft, onDraft, onAdd, onRemove }) {
  function commitDraft() {
    const v = draft.trim();
    if (!v) return;
    if (!values.includes(v)) onAdd(v);
    onDraft("");
  }

  return (
    <div className="onboarding-academic-section">
      <label className="onboarding-academic-section-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="onboarding-academic-input"
        value={draft}
        onChange={(e) => onDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitDraft();
          }
        }}
      />
      <div className="onboarding-academic-chips">
        {values.map((item) => (
          <Chip key={item} label={item} onRemove={() => onRemove(item)} />
        ))}
      </div>
    </div>
  );
}

/**
 * Final onboarding screen after Academic Background (before main app).
 * Full white viewport; copy at ~390×367 (desktop); user taps Continue when ready.
 */
function OnboardingExcitedStep({ onContinue }) {
  return (
    <div
      className="onboarding-excited-root"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "white",
        overflow: "hidden",
      }}
    >
      <div className="onboarding-excited-panel">
        <p className="onboarding-excited-message" role="status" aria-live="polite">
          Welcome to TreeReq, we&apos;re excited to grow with you!
        </p>
        <button type="button" className="onboarding-intro-continue" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}

/** Step C: academic background — AP / IB / UCLA chips + Back / Next. */
function OnboardingAcademicStep({ onBack, onComplete }) {
  const [apDraft, setApDraft] = useState("");
  const [ibDraft, setIbDraft] = useState("");
  const [uclaDraft, setUclaDraft] = useState("");
  const [apClasses, setApClasses] = useState(["AP Statistics"]);
  const [ibClasses, setIbClasses] = useState(["IB Math"]);
  const [uclaCourses, setUclaCourses] = useState(["COMMS 10"]);

  function handleNext(e) {
    e.preventDefault();
    onComplete?.({
      apClasses,
      ibClasses,
      uclaCourses,
    });
  }

  return (
    <div className="onboarding-profile-root">
      <div className="onboarding-profile-card onboarding-card--academic">
        <div className="onboarding-profile-accent" aria-hidden />
        <div className="onboarding-profile-form-panel onboarding-academic-panel">
          <div className="onboarding-academic-stack">
            <h1 className="onboarding-profile-headline">Academic Background</h1>

            <div className="onboarding-academic-sections">
              <AcademicCourseSection
                id="onboarding-ap"
                label="Select AP classes you have taken:"
                values={apClasses}
                draft={apDraft}
                onDraft={setApDraft}
                onAdd={(v) => setApClasses((list) => [...list, v])}
                onRemove={(v) => setApClasses((list) => list.filter((x) => x !== v))}
              />
              <AcademicCourseSection
                id="onboarding-ib"
                label="Select IB classes you have taken:"
                values={ibClasses}
                draft={ibDraft}
                onDraft={setIbDraft}
                onAdd={(v) => setIbClasses((list) => [...list, v])}
                onRemove={(v) => setIbClasses((list) => list.filter((x) => x !== v))}
              />
              <AcademicCourseSection
                id="onboarding-ucla"
                label="Select UCLA courses you have taken:"
                values={uclaCourses}
                draft={uclaDraft}
                onDraft={setUclaDraft}
                onAdd={(v) => setUclaCourses((list) => [...list, v])}
                onRemove={(v) => setUclaCourses((list) => list.filter((x) => x !== v))}
              />
            </div>
          </div>

          <div className="onboarding-academic-footer">
            <button type="button" className="onboarding-academic-back" onClick={onBack}>
              ←Back
            </button>
            <button type="button" className="onboarding-academic-next" onClick={handleNext}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Step B: profile card — matches mock (Google Sans Flex, gaps, blue accent, Next). */
function OnboardingProfileStep({ onContinue }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    majors: "",
    minors: "",
    admitTerm: "",
    admitLevel: "",
    gradTerm: "",
  });
  const [showRequiredHint, setShowRequiredHint] = useState(false);

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.majors.trim()) {
      setShowRequiredHint(true);
      return;
    }
    setShowRequiredHint(false);
    onContinue?.(form);
  }

  return (
    <div className="onboarding-profile-root">
      <div className="onboarding-profile-card">
        <div className="onboarding-profile-accent" aria-hidden />
        <div className="onboarding-profile-form-panel">
          <h1 className="onboarding-profile-headline">First, let&apos;s get to know you.</h1>

          <form className="onboarding-profile-form" onSubmit={handleSubmit} noValidate>
            {showRequiredHint ? (
              <p className="onboarding-profile-hint" role="alert">
                Please fill in First Name, Last Name, and Major(s).
              </p>
            ) : null}
            <Field
              id="onboarding-first-name"
              label="First Name"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => patch("firstName", e.target.value)}
            />
            <Field
              id="onboarding-last-name"
              label="Last Name"
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => patch("lastName", e.target.value)}
            />
            <Field
              id="onboarding-majors"
              label="Major(s)"
              required
              placeholder="e.g. Computer Science"
              value={form.majors}
              onChange={(e) => patch("majors", e.target.value)}
            />
            <Field
              id="onboarding-minors"
              label="Minor(s)"
              placeholder="Optional"
              value={form.minors}
              onChange={(e) => patch("minors", e.target.value)}
            />
            <Field
              id="onboarding-admit-term"
              label="Admit Term:"
              placeholder="e.g. Fall 2024"
              value={form.admitTerm}
              onChange={(e) => patch("admitTerm", e.target.value)}
            />
            <Field
              id="onboarding-admit-level"
              label="Admit Level:"
              placeholder="e.g. Freshman, Transfer"
              value={form.admitLevel}
              onChange={(e) => patch("admitLevel", e.target.value)}
            />
            <Field
              id="onboarding-grad-term"
              label="Expected Graduation Term:"
              placeholder="e.g. Spring 2028"
              value={form.gradTerm}
              onChange={(e) => patch("gradTerm", e.target.value)}
            />

            <div className="onboarding-profile-actions">
              <button type="submit" className="onboarding-profile-next">
                Next →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Onboarding: Google welcome → profile → academic → excited → main app.
 * `onComplete` runs when the user continues from the final screen with `{ profile, academic }`.
 */
export default function OnboardingMain({ onComplete }) {
  const [step, setStep] = useState(() => readInitialStep());
  const [profile, setProfile] = useState(null);
  const [academic, setAcademic] = useState(null);

  if (step === "intro") {
    return <OnboardingIntro onContinue={() => setStep("welcome")} />;
  }

  if (step === "welcome") {
    return <OnboardingWelcome onContinue={() => setStep("profile")} />;
  }

  if (step === "profile") {
    return (
      <OnboardingProfileStep
        onContinue={(data) => {
          setProfile(data);
          setStep("academic");
        }}
      />
    );
  }

  if (step === "academic") {
    return (
      <OnboardingAcademicStep
        onBack={() => setStep("profile")}
        onComplete={(data) => {
          setAcademic(data);
          setStep("excited");
        }}
      />
    );
  }

  return <OnboardingExcitedStep onContinue={() => onComplete?.({ profile, academic })} />;
}
