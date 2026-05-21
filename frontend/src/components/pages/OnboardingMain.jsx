import { useCallback, useEffect, useId, useRef, useState } from "react";
import React from "react";
import Select from "react-select";
import { GoogleLogin } from "@react-oauth/google";
import { submitGoogleAuthRequest } from "../../services/authApi";
import { fetchAcademicOptions } from "../../services/onboardingApi";
import { fetchMajors } from "../../services/onboardingApi";
import { submitOnboardingData } from "../../services/authApi";
const ONBOARDING_HERO = "/images/onboarding-welcome-garden1.png";
const ONBOARDING_LANDING_ART = "/images/onboarding-welcome-garden1.png";
const ONBOARDING_CARD_ART = "/images/onboarding-welcome-garden1.png";
const TREE_REQ_LOGO = "/images/LOGO.png";

/** Figma S-curve clip for landing hero (747×832); y-values nudged up for a higher wave. */
const LANDING_WAVE_PATH =
  "M0 0H744.734C744.734 0 779.908 185 573.105 335 C366.302 495 744.734 832 744.734 832H0V0Z";

function readInitialStep() {
  try {
    const q = new URLSearchParams(window.location.search).get("onboarding");
    if (q === "welcome" || q === "profile" || q === "academic" || q === "excited") return q;
  } catch {
    /* ignore */
  }
  return "welcome";
}

const ONBOARDING_STEP_EXIT_MS = 480;

function OnboardingStepBridge({ stepKey, children }) {
  const contentRef = useRef(children);
  contentRef.current = children;

  const [frame, setFrame] = useState(() => ({
    key: stepKey,
    content: children,
    phase: "enter",
  }));

  useEffect(() => {
    if (stepKey === frame.key) {
      setFrame((prev) =>
        prev.key === stepKey ? { ...prev, content: contentRef.current } : prev,
      );
      return;
    }

    setFrame((prev) => ({ ...prev, phase: "exit" }));

    const timer = window.setTimeout(() => {
      setFrame({ key: stepKey, content: contentRef.current, phase: "enter" });
    }, ONBOARDING_STEP_EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [stepKey, frame.key]);

  return (
    <div className={`onboarding-step-bridge onboarding-step-bridge--${frame.phase}`}>
      {frame.content}
    </div>
  );
}

function TreeReqLogo({ size = "large" }) {
  return (
    <img
      src={TREE_REQ_LOGO}
      alt="TreeReq"
      className={`onboarding-logo ${size === "large" ? "onboarding-logo--lg" : "onboarding-logo--sm"}`}
    />
  );
}

function GoogleMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
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
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 2.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/** Landing left panel: hero image clipped to the S-curve (matches Figma). */
function LandingHeroArt() {
  const patternId = `landing-art-${useId().replace(/:/g, "")}`;
  return (
    <div className="onboarding-landing__art" aria-hidden>
      <svg
        className="onboarding-landing__art-svg"
        viewBox="0 0 747 832"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <pattern
            id={patternId}
            patternUnits="objectBoundingBox"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <image href={ONBOARDING_LANDING_ART} width="1" height="1" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        </defs>
        <path fill={`url(#${patternId})`} d={LANDING_WAVE_PATH} />
      </svg>
    </div>
  );
}

function ArtCurveLeft() {
  return (
    <svg
      className="onboarding-art-curve onboarding-art-curve--left"
      viewBox="0 0 120 1000"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M120 0 C40 120 8 220 8 340 C8 460 90 520 110 640 C130 760 20 860 0 1000 L120 1000 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

function ArtCurveRight() {
  return (
    <svg
      className="onboarding-art-curve onboarding-art-curve--right"
      viewBox="0 0 120 1000"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 0 C80 120 112 220 112 340 C112 460 30 520 10 640 C-10 760 100 860 120 1000 L0 1000 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

/** Right-side art on profile/academic cards (mirrored S-curve). */
function CardHeroArt() {
  const patternId = `card-art-${useId().replace(/:/g, "")}`;
  return (
    <div className="onboarding-card__art" aria-hidden>
      <svg
        className="onboarding-card__art-svg"
        viewBox="0 0 747 832"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <pattern
            id={patternId}
            patternUnits="objectBoundingBox"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <image href={ONBOARDING_CARD_ART} width="1" height="1" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        </defs>
        <g transform="scale(-1, 1) translate(-747, 0)">
          <path fill={`url(#${patternId})`} d={LANDING_WAVE_PATH} />
        </g>
      </svg>
    </div>
  );
}

function OnboardingArtPanel({ side = "left" }) {
  return (
    <div className={`onboarding-art-panel onboarding-art-panel--${side}`} aria-hidden>
      <img src={ONBOARDING_HERO} alt="" className="onboarding-art-panel__img" />
      {side === "left" ? <ArtCurveLeft /> : <ArtCurveRight />}
    </div>
  );
}

function OnboardingLanding({ onGoogleContinue }) {
  const hasGoogleId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [status, setStatus] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setStatus("Verifying…");
      const data = await submitGoogleAuthRequest(credentialResponse.credential);
      setStatus(data.message || "Signed in");
      onGoogleContinue(data.email);
    } catch (error) {
      console.error(error);
      setStatus("Sign-in failed. Please try again.");
    }
  };

  const statusIsError = /fail|error|wrong|server/i.test(status);

  return (
    <div className="onboarding-landing">
      <LandingHeroArt />

      <div className="onboarding-landing__panel">
        <div className="onboarding-landing__panel-inner">
          <p className="onboarding-landing__eyebrow">Welcome to</p>
          <TreeReqLogo size="large" />
          <p className="onboarding-landing__tagline">Degree-planning, reimagined.</p>

          <div className="onboarding-landing__signin">
            <p className="onboarding-landing__help">Please log in with your UCLA account.</p>

            {hasGoogleId ? (
              <div className="onboarding-landing__google">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setStatus("Sign-in was cancelled. Please try again.")}
                  text="signin_with"
                  shape="pill"
                  theme="outline"
                  size="large"
                  width="300"
                  useOneTap={false}
                  auto_select={false}
                />
              </div>
            ) : (
              <p className="onboarding-landing__help">
                Add <code>VITE_GOOGLE_CLIENT_ID</code> to <code>frontend/.env</code> to enable sign-in.
              </p>
            )}

            {status ? (
              <p
                className={`onboarding-landing__status ${statusIsError ? "onboarding-landing__status--error" : ""}`}
              >
                {status}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, id, className = "", ...props }) {
  return (
    <label className={`onboarding-field ${className}`.trim()} htmlFor={id}>
      <span className="onboarding-field__label">
        {label}
        {required ? " *" : ""}
      </span>
      <input id={id} className="onboarding-field__input" required={required} {...props} />
    </label>
  );
}

function AcademicChip({ label, onRemove }) {
  return (
    <span className="onboarding-academic-chip">
      <span className="onboarding-academic-chip-label">{label}</span>
      <button
        type="button"
        className="onboarding-academic-chip-remove"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        <span className="onboarding-academic-chip-x" aria-hidden />
      </button>
    </span>
  );
}

function labelForValue(value, options) {
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Native select: choosing an option adds a chip below. */
function AcademicSelectField({ id, label, options, selected, onSelect, onRemove, disabled, emptyMessage }) {
  const selectedSet = new Set(selected);
  const available = options.filter((o) => !selectedSet.has(o.value));

  function handleChange(e) {
    const value = e.target.value;
    if (!value) return;
    onSelect(value);
    e.target.value = "";
  }

  return (
    <section className="onboarding-academic-section onboarding-academic-section--dropdown">
      <label className="onboarding-academic-section-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="onboarding-academic-input"
        defaultValue=""
        onChange={handleChange}
        disabled={disabled || available.length === 0}
      >
        <option value="">{emptyMessage || "Select…"}</option>
        {available.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="onboarding-academic-chips" aria-live="polite">
        {selected.map((value) => (
          <AcademicChip
            key={value}
            label={labelForValue(value, options)}
            onRemove={() => onRemove(value)}
          />
        ))}
      </div>
    </section>
  );
}

/** Searchable combobox for large UCLA course lists. */
function AcademicSearchSelectField({ id, label, options, selected, onSelect, onRemove, disabled }) {
  const listId = `${id}-list`;
  const rootRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedSet = new Set(selected);
  const available = options.filter((o) => !selectedSet.has(o.value));
  const q = query.trim().toLowerCase();
  const filtered = (
    q
      ? available.filter(
          (o) =>
            o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
        )
      : available
  ).slice(0, 60);

  useEffect(() => {
    function onPointerDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function pick(value) {
    onSelect(value);
    setQuery("");
    setOpen(false);
  }

  return (
    <section className="onboarding-academic-section onboarding-academic-section--dropdown">
      <label className="onboarding-academic-section-label" htmlFor={id}>
        {label}
      </label>
      <div className="onboarding-academic-combobox" ref={rootRef}>
        <input
          id={id}
          type="text"
          className="onboarding-academic-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder={disabled ? "Loading courses…" : "Search or select a course…"}
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        />
        {open && !disabled ? (
          <ul id={listId} className="onboarding-academic-combobox__list" role="listbox">
            {filtered.length === 0 ? (
              <li className="onboarding-academic-combobox__empty">No matching courses</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value} role="option">
                  <button
                    type="button"
                    className="onboarding-academic-combobox__option"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(opt.value)}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      <div className="onboarding-academic-chips" aria-live="polite">
        {selected.map((value) => (
          <AcademicChip key={value} label={value} onRemove={() => onRemove(value)} />
        ))}
      </div>
    </section>
  );
}

function OnboardingCardShell({ children, footer }) {
  return (
    <div className="onboarding-card-page">
      <div className="onboarding-card onboarding-card--split">
        <div className="onboarding-card__form">
          {children}
          {footer}
        </div>
        <CardHeroArt />
      </div>
    </div>
  );
}

function OnboardingProfileStep({ onContinue }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    major: null,
    minors: "",
    admitTerm: "",
    admitLevel: "",
    gradTerm: "",
  });
  const [showHint, setShowHint] = useState(false);

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [majors, setMajors] = useState([]);
  function handleSubmit(e) {
    e.preventDefault();
      console.log(form.major);
    if (!form.firstName.trim() || !form.lastName.trim() || !form.major) {
      setShowHint(true);
      return;
    }
    setShowHint(false);
    onContinue?.(form);
  }
  const majorSelectStyles = { // styles made by gemini
    control: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: '#D9D9D9',
      border: 'none',
      borderRadius: '8px',
      boxShadow: 'none',
      padding: '4px',
      cursor: 'pointer',
      minHeight: '47px',
      maxHeight: '47px',
    }),
    placeholder: (baseStyles) => ({
      ...baseStyles,
      color: '#6b6b6b',
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      borderRadius: '8px',
      overflow: 'hidden',
    })
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
	setLoadState("loading");
	setLoadError("");
        const majors_raw = await fetchMajors();
	const fetchedMajors = majors_raw.map(item => ({
	  value: item.major_id,
	  label: item.name
	}));
	if (cancelled) return;
	setMajors(fetchedMajors);
	setLoadState("ready");
      } catch (err) {
	if (cancelled) return;
	setLoadError(err.message|| "Could not load majors.");
      }
    })();
  }, []);
  return (
    <OnboardingCardShell
      footer={
        <div className="onboarding-card__footer onboarding-card__footer--end">
          <button type="submit" form="onboarding-profile-form" className="onboarding-btn onboarding-btn--primary">
            Next →
          </button>
        </div>
      }
    >
      <h1 className="onboarding-card__title">First, let&apos;s get to know you.</h1>
      <form id="onboarding-profile-form" className="onboarding-profile-grid" onSubmit={handleSubmit} noValidate>
        {showHint ? (
          <p className="onboarding-card__hint onboarding-profile-grid__hint" role="alert">
            Please fill in First Name, Last Name, and Major(s).
          </p>
        ) : null}

        <Field
          id="ob-first"
          label="First Name"
          required
          autoComplete="given-name"
          value={form.firstName}
          onChange={(e) => patch("firstName", e.target.value)}
        />
        <Field
	  id="ob-last"
          label="Last Name"
          required
          autoComplete="family-name"
          value={form.lastName}
          onChange={(e) => patch("lastName", e.target.value)}
        />
	<div style={{ display: 'flex', flexDirection: 'column'}}>
	  <label style={{marginBottom: '10px'}}>Major *</label>
	  <Select
	    value={form.major}
	    id="ob-majors"
	    onChange={(selectedOption) => patch("major", selectedOption)}
	    options={majors}
	    styles={majorSelectStyles}
	    isSearchable={true}
	    isDisabled={loadState === "loading"} 
            placeholder={loadState === "loading" ? "No majors in database" : "Search for a major..."}
          />
	</div>
        <Field
          id="ob-minors"
          label="Minor"
          placeholder="Optional"
          value={form.minors}
          onChange={(e) => patch("minors", e.target.value)}
        />
        <Field
          id="ob-admit-term"
          label="Admit Term:"
          placeholder="e.g. Fall 2024"
          value={form.admitTerm}
          onChange={(e) => patch("admitTerm", e.target.value)}
        />
        <Field
          id="ob-admit-level"
          label="Admit Level:"
          placeholder="e.g. Freshman"
          value={form.admitLevel}
          onChange={(e) => patch("admitLevel", e.target.value)}
        />
        <Field
          id="ob-grad-term"
          label="Expected Graduation Term:"
          className="onboarding-field--solo"
          placeholder="e.g. Spring 2028"
          value={form.gradTerm}
          onChange={(e) => patch("gradTerm", e.target.value)}
        />
      </form>
    </OnboardingCardShell>
  );
}

function addUnique(list, value) {
  if (!value || list.includes(value)) return list;
  return [...list, value];
}

function OnboardingAcademicStep({ onBack, onComplete }) {
  const [majorSelected, setMajorSelected] = useState([]);
  const [apSelected, setApSelected] = useState([]);
  const [ibSelected, setIbSelected] = useState([]);
  const [uclaSelected, setUclaSelected] = useState([]);
  const [options, setOptions] = useState({ apExams: [], ibExams: [], uclaCourses: [] });
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadState("loading");
        setLoadError("");
        const data = await fetchAcademicOptions();
        if (cancelled) return;
        setOptions({
          apExams: data.apExams ?? [],
          ibExams: data.ibExams ?? [],
          uclaCourses: data.uclaCourses ?? [],
	  options: data.options ?? [],
        });
        setLoadState("ready");
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.message || "Could not load academic options.");
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleNext(e) {
    e.preventDefault();
    onComplete?.({
      apClasses: apSelected,
      ibClasses: ibSelected,
      uclaCourses: uclaSelected,
    });
  }

  const optionsLoading = loadState === "loading";
  const ibEmpty = options.ibExams.length === 0;

  return (
    <OnboardingCardShell
      footer={
        <div className="onboarding-card__footer">
          <button type="button" className="onboarding-btn onboarding-btn--muted" onClick={onBack}>
            ← Back
          </button>
          <button
            type="button"
            className="onboarding-btn onboarding-btn--primary"
            onClick={handleNext}
            disabled={loadState === "loading"}
          >
            Next →
          </button>
        </div>
      }
    >
      <h1 className="onboarding-card__title">Academic Background</h1>

      <div className="onboarding-academic-stack">
        {loadState === "error" ? (
          <p className="onboarding-academic-loading" role="alert">
            {loadError}{" "}
            <button type="button" className="onboarding-landing__email-link" onClick={() => window.location.reload()}>
              Retry
            </button>
          </p>
        ) : null}
        {optionsLoading ? (
          <p className="onboarding-academic-loading">Loading options from catalog…</p>
        ) : null}

        <div className="onboarding-academic-sections">
          <AcademicSelectField
            id="ob-ap"
            label="Select AP classes you have taken:"
            options={options.apExams}
            selected={apSelected}
            onSelect={(value) => setApSelected((list) => addUnique(list, value))}
            onRemove={(value) => setApSelected((list) => list.filter((x) => x !== value))}
            disabled={optionsLoading || loadState === "error"}
            emptyMessage={options.apExams.length === 0 ? "No AP exams in database" : "Select…"}
          />
          <AcademicSelectField
            id="ob-ib"
            label="Select IB classes you have taken:"
            options={options.ibExams}
            selected={ibSelected}
            onSelect={(value) => setIbSelected((list) => addUnique(list, value))}
            onRemove={(value) => setIbSelected((list) => list.filter((x) => x !== value))}
            disabled={optionsLoading || loadState === "error" || ibEmpty}
            emptyMessage={ibEmpty ? "IB catalog coming soon" : "Select…"}
          />
          <AcademicSearchSelectField
            id="ob-ucla"
            label="Select UCLA courses you have taken:"
            options={options.uclaCourses}
            selected={uclaSelected}
            onSelect={(value) => setUclaSelected((list) => addUnique(list, value))}
            onRemove={(value) => setUclaSelected((list) => list.filter((x) => x !== value))}
            disabled={optionsLoading || loadState === "error"}
          />
        </div>
      </div>
    </OnboardingCardShell>
  );
}

const HOME_EXIT_MS = 1200;

function OnboardingSuccessStep({ onContinue, exiting }) {
  return (
    <div className={`onboarding-success${exiting ? " onboarding-success--exit" : ""}`}>
      <div className="onboarding-success__bloom" aria-hidden />
      <img src={ONBOARDING_HERO} alt="" className="onboarding-success__bg" aria-hidden />
      <div className="onboarding-success__scrim" aria-hidden />
      <div className="onboarding-success__card">
        <TreeReqLogo size="small" />
        <p className="onboarding-success__message">
          Welcome to TreeReq, we&apos;re excited to grow with you!
        </p>
        <button
          type="button"
          className="onboarding-btn onboarding-btn--primary"
          onClick={onContinue}
          disabled={exiting}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default function OnboardingMain({ onComplete, onExitStart }) {
  const [step, setStep] = useState(() => readInitialStep());
  const [profile, setProfile] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [exitingToHome, setExitingToHome] = useState(false);
  const [email, setEmail] = useState("");
  const goProfile = useCallback((userEmail) => {
    setEmail(userEmail);
    setStep("profile");
  }, []);
  const handleSuccessContinue = useCallback(async () => {
    if (exitingToHome) return;
    setExitingToHome(true);
    onExitStart?.();
    try {
	await submitOnboardingData(
	  email,
	  profile.firstName,
	  profile.lastName,
	  profile.major?.value, 
	  profile.minors,
	  profile.admitTerm,
	  profile.admitLevel,
	  profile.gradTerm,
	  academic.apClasses,
	  academic.ibClasses,
	  academic.uclaCourses
	);
    } catch (error) {
	console.error("Failed to save onboarding data:", error);
    }
    window.setTimeout(() => {
      onComplete?.({ profile, academic });
    }, HOME_EXIT_MS);
  }, [academic, exitingToHome, onComplete, onExitStart, profile, email]);

  let stepContent;
  if (step === "welcome") {
    stepContent = (
      <OnboardingLanding onGoogleContinue={goProfile} />
    );
  } else if (step === "profile") {
    stepContent = (
      <OnboardingProfileStep
        onContinue={(data) => {
          setProfile(data);
          setStep("academic");
        }}
      />
    );
  } else if (step === "academic") {
    stepContent = (
      <OnboardingAcademicStep
        onBack={() => setStep("profile")}
        onComplete={(data) => {
          setAcademic(data);
          setStep("excited");
        }}
      />
    );
  } else {
    stepContent = (
      <OnboardingSuccessStep onContinue={handleSuccessContinue} exiting={exitingToHome} />
    );
  }

  return <OnboardingStepBridge stepKey={step}>{stepContent}</OnboardingStepBridge>;
}
