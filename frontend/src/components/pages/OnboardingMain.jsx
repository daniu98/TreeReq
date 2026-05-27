import { useCallback, useEffect, useId, useRef, useState } from "react";
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { OnboardingSelect, OnboardingSelectAdd } from "../ui/OnboardingSelect.jsx";
import { submitGoogleAuthRequest } from "../../services/authApi";
import { fetchAcademicOptions } from "../../services/onboardingApi";
import { fetchMajors } from "../../services/onboardingApi";
import { submitOnboardingData } from "../../services/authApi";
import { verifySsoToken } from "../../services/authApi";
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

function OnboardingLanding({ onGoogleContinue, onSkipOnboarding, ssoToken, setSsoToken, onExitStart, onComplete }) {
  const hasGoogleId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [majors, setMajors] = useState([]);
  const [major, setMajor] = useState([]);
  const [exitingToHome, setExitingToHome] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setStatus("Verifying…");
      const data = await submitGoogleAuthRequest(credentialResponse.credential);
      setSsoToken(data.token);
      setEmail(data.email);
      if (data.onboarded) {
	sessionStorage.setItem("treereq-sso-token", data.token);
        sessionStorage.setItem("treereq-sso-email", data.email);
        setStatus("Welcome back! Redirecting…");
        onSkipOnboarding(data.email);
        return;
      }

      setStatus(data.message || "Signed in");
      onGoogleContinue(data.email);
    } catch (error) {
      console.error(error);
      const msg = error?.message || "Sign-in failed. Please try again.";
      setStatus(msg);
    }
  };
  
  const signInAsGuest = async () => {
    if(!form.major) {
      setStatus("Please select a major first to continue as a guest.");
      return;
    }
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const guestEmail = `guest_${randomSuffix}@guest.treereq.com`;
    try {
	const data = await submitOnboardingData(
	  guestEmail,
	  "",
	  "",
	  form.major?.value,
	  "",
	  "",
	  "",
	  "",
	  [],
	  [],
	  []
	);
	sessionStorage.setItem("treereq-sso-token", "is-guest");
        sessionStorage.setItem("treereq-sso-email", guestEmail);
	onSkipOnboarding(data.email);
    } catch (error) {
	console.error("Failed to save onboarding data:", error);
	return;
    }
    setStatus("Signed in as guest");
  }
  
  const statusIsError = /fail|error|wrong|server/i.test(status);
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
  const [form, setForm] = useState({
    major: null,
  });
  const handleSkipToMainApp = useCallback((userEmail) => {
    if (exitingToHome) return;
    setExitingToHome(true);
    onExitStart?.();
    window.setTimeout(() => {
      onComplete?.({ skipped: true, email: userEmail }); 
    }, HOME_EXIT_MS);
  }, [exitingToHome, onExitStart, onComplete]);

  const goProfile = useCallback((userEmail) => {
    setEmail(userEmail);
    setStep("profile");
  }, []);
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
              <div className="onboarding-landing__google" style={{ marginBottom: "0.5rem" }}>
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
	  {/* bookmark - make look better */}
	  <p className="onboarding-landing__help">Or continue as a guest.</p>
	  <OnboardingSelect
            id="ob-majors"
            label=""
            options={majors}
            value={form.major}
            onChange={(selectedOption) => setForm(prev => ({ ...prev, major: selectedOption }))}
            isSearchable
            isDisabled={loadState === "loading"}
            placeholder={
	      loadState === "loading" ? "Loading majors…" : "Search for a major…"
            }
          />
	  <button 
	    type="button" 
	    className="onboarding-btn onboarding-btn--secondary" 
	    style={{ marginTop: "1rem" }}
	    onClick={signInAsGuest}
	  >
	    Continue as Guest
	  </button>
        </div>
      </div>
    </div>
  );
}

const ADMIT_LEVEL_OPTIONS = [
  { value: "Freshman", label: "Freshman" },
  { value: "Sophomore", label: "Sophomore" },
  { value: "Junior", label: "Junior" },
  { value: "Senior", label: "Senior" },
  { value: "Transfer", label: "Transfer" },
];

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

function OnboardingCardShell({ children, footer }) {
  return (
    <div className="onboarding-card-page">
      <div className="onboarding-card onboarding-card--split">
        <div className="onboarding-card__form">
          <div className="onboarding-card__body">{children}</div>
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
        <OnboardingSelect
          id="ob-majors"
          label="Major"
          required
          options={majors}
          value={form.major}
          onChange={(selectedOption) => patch("major", selectedOption)}
          isSearchable
          isDisabled={loadState === "loading"}
          placeholder={
            loadState === "loading" ? "Loading majors…" : "Search for a major…"
          }
        />
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
        <OnboardingSelect
          id="ob-admit-level"
          label="Admit Level:"
          options={ADMIT_LEVEL_OPTIONS}
          value={ADMIT_LEVEL_OPTIONS.find((o) => o.value === form.admitLevel) || null}
          onChange={(opt) => patch("admitLevel", opt?.value ?? "")}
          placeholder="Select admit level…"
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
          <OnboardingSelectAdd
            id="ob-ap"
            label="Select AP classes you have taken:"
            options={options.apExams}
            selected={apSelected}
            onSelect={(value) => setApSelected((list) => addUnique(list, value))}
            onRemove={(value) => setApSelected((list) => list.filter((x) => x !== value))}
            disabled={optionsLoading || loadState === "error"}
            emptyMessage={options.apExams.length === 0 ? "No AP exams in database" : "Select…"}
          />
          <OnboardingSelectAdd
            id="ob-ib"
            label="Select IB classes you have taken:"
            options={options.ibExams}
            selected={ibSelected}
            onSelect={(value) => setIbSelected((list) => addUnique(list, value))}
            onRemove={(value) => setIbSelected((list) => list.filter((x) => x !== value))}
            disabled={optionsLoading || loadState === "error" || ibEmpty}
            emptyMessage={ibEmpty ? "IB catalog coming soon" : "Select…"}
          />
          <OnboardingSelectAdd
            id="ob-ucla"
            label="Select UCLA courses you have taken:"
            options={options.uclaCourses}
            selected={uclaSelected}
            onSelect={(value) => setUclaSelected((list) => addUnique(list, value))}
            onRemove={(value) => setUclaSelected((list) => list.filter((x) => x !== value))}
            disabled={optionsLoading || loadState === "error"}
            emptyMessage="Search or select a course…"
            searchable
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
  const [ssoToken, setSsoToken] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const handleSkipToMainApp = useCallback((userEmail) => {
    if (exitingToHome) return;
    setExitingToHome(true);
    onExitStart?.();
    window.setTimeout(() => {
      onComplete?.({ skipped: true, email: userEmail }); 
    }, HOME_EXIT_MS);
  }, [exitingToHome, onExitStart, onComplete]);

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
	sessionStorage.setItem("treereq-sso-token", ssoToken)
        sessionStorage.setItem("treereq-sso-email", email);
    } catch (error) {
	console.error("Failed to save onboarding data:", error);
    }
    window.setTimeout(() => {
      onComplete?.({ profile, academic });
    }, HOME_EXIT_MS);
  }, [academic, exitingToHome, onComplete, onExitStart, profile, email]);
  useEffect(() => {
		const checkSsoToken = async () => {
      if (!sessionStorage.getItem("treereq-sso-token")){
				setIsCheckingAuth(false);
				return;
			}
			try {
				const verificationData = await verifySsoToken(sessionStorage.getItem("treereq-sso-token"));
				if (verificationData["message"] == "Valid token"){
					handleSkipToMainApp(sessionStorage.getItem("treereq-sso-email"));
				}
				else {
					setIsCheckingAuth(false);
				}
			} catch (error) {
				setIsCheckingAuth(false);
			}
		};
		checkSsoToken();
  }, [handleSkipToMainApp]);
  if (isCheckingAuth) {
		return ( // made by Gemini
    <div className="tree-loader-container">
      <style>{`
        .tree-loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, sans-serif;
          height: 100vh; 
          width: 100%;
          background-color: #ffffff;
        }

        /* Leaf pulsing animation */
        .tree-leaf {
          animation: leafPulse 0.5s infinite ease-in-out alternate;
        }
        
        /* Stagger the animations so they don't all pulse at the exact same time */
        .leaf-1 { animation-delay: 0s; }
        .leaf-2 { animation-delay: 0.4s; }
        .leaf-3 { animation-delay: 0.8s; }

        @keyframes leafPulse {
          0% {
            transform: scale(0.85);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        /* Text fading animation */
        .loading-text {
          margin-top: 24px;
          color: #2e7d32;
          font-weight: 500;
          font-size: 1.1rem;
          letter-spacing: 0.5px;
          animation: textFade 1.5s infinite alternate ease-in-out;
        }

        @keyframes textFade {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* SVG Tree Art */}
      <svg
        width="120"
        height="140"
        viewBox="0 0 100 120"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Loading content"
        role="img"
      >
        {/* Trunk & Branches */}
        <path
          d="M 50 110 L 50 60"
          stroke="#795548"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 50 85 L 25 55"
          stroke="#795548"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 50 75 L 75 45"
          stroke="#795548"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Leaves (Circles with specific transform origins to scale from their centers) */}
        <circle
          cx="25"
          cy="55"
          r="18"
          fill="#81c784"
          className="tree-leaf leaf-1"
          style={{ transformOrigin: "25px 55px" }}
        />
        <circle
          cx="75"
          cy="45"
          r="18"
          fill="#4caf50"
          className="tree-leaf leaf-2"
          style={{ transformOrigin: "75px 45px" }}
        />
        <circle
          cx="50"
          cy="25"
          r="24"
          fill="#2e7d32"
          className="tree-leaf leaf-3"
          style={{ transformOrigin: "50px 25px" }}
        />
      </svg>

      <div className="loading-text">Planting seeds...</div>
    </div>
		);
    return null;
  }
  let stepContent;
  if (step === "welcome") {
    stepContent = (
      <OnboardingLanding onGoogleContinue={goProfile} onSkipOnboarding={handleSkipToMainApp} ssoToken={ssoToken} setSsoToken={setSsoToken} />
    );
  } else if (step === "profile") {
    console.log(ssoToken);
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
