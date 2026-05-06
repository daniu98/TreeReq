import { useState } from "react";

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

/** Step 1: profile basics — layout matches design mock (card + blue accent + Next). */
export default function OnboardingMain({ onContinue }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    majors: "",
    minors: "",
    admitTerm: "",
    admitLevel: "",
    gradTerm: "",
  });

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.majors.trim()) return;
    onContinue?.(form);
  }

  return (
    <div className="onboarding-profile-root">
      <div className="onboarding-profile-card">
        <div className="onboarding-profile-accent" aria-hidden />
        <div className="onboarding-profile-form-panel">
          <h1 className="onboarding-profile-headline">First, let&apos;s get to know you.</h1>

          <form className="onboarding-profile-form" onSubmit={handleSubmit}>
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
