import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAcademicOptions } from "../../services/onboardingApi.js";
import { fetchMajors } from "../../services/majorsApi.js";

const FONT = "Inter, system-ui, var(--font-ui), sans-serif";

const inputStyle = {
  flex: 1,
  padding: "6px 10px",
  border: "1px solid #D8D8D8",
  borderRadius: 7,
  background: "#F8F8F8",
  fontSize: 13,
  fontFamily: FONT,
  color: "#333",
  outline: "none",
  minWidth: 0,
  width: "100%",
};

// ── Generic form field ────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, readOnly = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="profile-info-row">
      <span className="profile-info-row__label">{label}:</span>
      {readOnly ? (
        <span className="profile-info-row__value" style={{ color: "#888" }}>{value || "—"}</span>
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputStyle, ...(focused ? { borderColor: "#81B3E8", background: "#fff" } : {}) }}
        />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="profile-info-row">
      <span className="profile-info-row__label">{label}:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: "pointer" }}
      >
        <option value="">— select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Searchable dropdown ───────────────────────────────────────────────────────

function SearchDropdown({ options, selected, onAdd, placeholder, loading, error }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return options
      .filter(o => o.label.toLowerCase().includes(q) && !selected.includes(o.label))
      .slice(0, 8);
  }, [options, query, selected]);

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1 }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={loading ? "Loading options…" : error ? "Could not load options" : placeholder}
        disabled={loading || !!error}
        style={inputStyle}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #D8D8D8",
          borderRadius: 8,
          boxShadow: "0px 4px 14px rgba(0,0,0,0.10)",
          maxHeight: 220,
          overflowY: "auto",
          zIndex: 200,
        }}>
          {filtered.map(o => (
            <DropdownOption
              key={o.value ?? o.label}
              label={o.label}
              onSelect={() => {
                onAdd(o.label);
                setQuery("");
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
      {open && query.trim() && filtered.length === 0 && !loading && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #D8D8D8",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 13,
          color: "#AAAAAA",
          fontFamily: FONT,
          zIndex: 200,
        }}>
          No results for "{query}"
        </div>
      )}
    </div>
  );
}

function DropdownOption({ label, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        width: "100%",
        padding: "8px 12px",
        border: "none",
        background: hovered ? "#F0F7FF" : "transparent",
        textAlign: "left",
        cursor: "pointer",
        fontSize: 13,
        fontFamily: FONT,
        color: "#333",
      }}
    >
      {label}
    </button>
  );
}

// ── Course chip with remove ───────────────────────────────────────────────────

function EditableChip({ label, onRemove }) {
  return (
    <span className="profile-chip" style={{ display: "inline-flex", alignItems: "center", gap: 5, paddingRight: 6 }}>
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, color: "#999", fontSize: 14, lineHeight: 1 }}
      >
        ×
      </button>
    </span>
  );
}

// ── Course section (compact card with search dropdown) ────────────────────────

function CourseSection({ title, courses, onAdd, onRemove, options, loading, error, placeholder }) {
  return (
    <article className="profile-card profile-card--compact">
      <h3 className="profile-card__subtitle">{title}:</h3>
      <div className="profile-chip-list" style={{ marginBottom: 10, minHeight: 24 }}>
        {courses.length === 0
          ? <p className="profile-empty-list">None added yet.</p>
          : courses.map(c => <EditableChip key={c} label={c} onRemove={() => onRemove(c)} />)
        }
      </div>
      <SearchDropdown
        options={options}
        selected={courses}
        onAdd={onAdd}
        placeholder={placeholder}
        loading={loading}
        error={error}
      />
    </article>
  );
}

// ── Close icon ────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileEdit({ profile, onSave, onDiscard }) {
  const nameParts = (profile?.fullName ?? "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [major, setMajor] = useState(profile?.major && profile.major !== "—" ? profile.major : "");
  const [minor, setMinor] = useState(profile?.minor === "N/A" ? "" : (profile?.minor ?? ""));
  const [admitTerm, setAdmitTerm] = useState(profile?.admitTerm === "—" ? "" : (profile?.admitTerm ?? ""));
  const [admitLevel, setAdmitLevel] = useState(profile?.admitLevel === "—" ? "" : (profile?.admitLevel ?? ""));
  const [gradTerm, setGradTerm] = useState(profile?.gradTerm === "—" ? "" : (profile?.gradTerm ?? ""));
  const [apClasses, setApClasses] = useState([...(profile?.apClasses ?? [])]);
  const [ibClasses, setIbClasses] = useState([...(profile?.ibClasses ?? [])]);
  const [uclaCourses, setUclaCourses] = useState([...(profile?.uclaCourses ?? [])]);

  const [academicOptions, setAcademicOptions] = useState({ apExams: [], ibExams: [], uclaCourses: [] });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [majorId, setMajorId] = useState(profile?.majorId ?? null);
  const [majorOptions, setMajorOptions] = useState([]);
  const [majorsLoading, setMajorsLoading] = useState(true);

  useEffect(() => {
    fetchAcademicOptions()
      .then(data => {
        setAcademicOptions({
          apExams: data.apExams ?? [],
          ibExams: data.ibExams ?? [],
          uclaCourses: data.uclaCourses ?? [],
        });
        setOptionsLoading(false);
      })
      .catch(() => {
        setOptionsError("Could not load options");
        setOptionsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMajors()
      .then(data => {
        setMajorOptions(Array.isArray(data) ? data.map(m => ({ value: m.major_id, label: m.name })) : []);
        setMajorsLoading(false);
      })
      .catch(() => setMajorsLoading(false));
  }, []);

  function handleSave() {
    const first = firstName.trim();
    const last = lastName.trim();
    const fullName = [first, last].filter(Boolean).join(" ") || profile?.fullName || "Student";
    const lastInitial = last ? `${last.charAt(0).toUpperCase()}.` : "";
    const displayName = first && lastInitial ? `${first} ${lastInitial}` : fullName;
    const savedMajor = major.trim() || profile?.major || "—";
    const majorFocus = savedMajor.split(",")[0]?.trim() || savedMajor;

    onSave?.({
      ...profile,
      displayName,
      fullName,
      major: savedMajor,
      majorId: majorId ?? profile?.majorId ?? null,
      majorFocus,
      minor: minor.trim() || "N/A",
      admitTerm: admitTerm.trim() || "—",
      admitLevel: admitLevel.trim() || "—",
      gradTerm: gradTerm.trim() || "—",
      apClasses,
      ibClasses,
      uclaCourses,
    });
  }

  const previewName = [firstName, lastName].filter(Boolean).join(" ") || "—";
  const loading = optionsLoading;
  const err = optionsError || "";

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <header className="profile-shell__header">
          <h1 className="profile-shell__title">Edit Profile</h1>
          <button type="button" className="profile-shell__close" onClick={onDiscard} aria-label="Discard changes">
            <CloseIcon />
          </button>
        </header>

        {/* ── Profile Information ── */}
        <section className="profile-card" aria-labelledby="edit-info-heading">
          <div className="profile-card__head">
            <h2 id="edit-info-heading" className="profile-card__title">Profile Information</h2>
          </div>
          <div className="profile-card__body profile-card__body--info">
            <div className="profile-identity">
              <div className="profile-avatar" aria-hidden />
              <span className="profile-identity__name">{previewName}</span>
            </div>
            <div className="profile-info-grid">
              <div className="profile-info-col">
                <Field label="First name" value={firstName} onChange={setFirstName} placeholder="First name" />
                <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Last name" />
                <div className="profile-info-row">
                  <span className="profile-info-row__label">Major:</span>
                  <SearchDropdown
                    options={majorOptions}
                    selected={[]}
                    onAdd={(label) => {
                      setMajor(label);
                      const opt = majorOptions.find(o => o.label === label);
                      setMajorId(opt?.value ?? null);
                    }}
                    placeholder={majorsLoading ? "Loading majors…" : major || "Search for a major…"}
                    loading={majorsLoading}
                    error=""
                  />
                </div>
                {major && (
                  <div className="profile-info-row">
                    <span className="profile-info-row__label" />
                    <span style={{ fontSize: 13, color: "#358162", fontFamily: FONT }}>{major}</span>
                  </div>
                )}
                <Field label="Minor" value={minor} onChange={setMinor} placeholder="e.g. Computer Science" />
              </div>
              <div className="profile-info-col">
                <Field label="Admit term" value={admitTerm} onChange={setAdmitTerm} placeholder="e.g. Fall 2024" />
                <SelectField
                  label="Admit level"
                  value={admitLevel}
                  onChange={setAdmitLevel}
                  options={["Freshman", "Sophomore", "Junior", "Senior", "Transfer"]}
                />
                <Field label="Graduation term" value={gradTerm} onChange={setGradTerm} placeholder="e.g. Spring 2028" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Academic Information ── */}
        <section className="profile-academic" aria-labelledby="edit-academic-heading">
          <div className="profile-section-heading">
            <h2 id="edit-academic-heading" className="profile-section-heading__title">Academic Information</h2>
          </div>

          <article className="profile-card profile-card--ucla">
            <h3 className="profile-card__subtitle">UCLA Courses Taken:</h3>
            <div className="profile-ucla-layout">
              <div className="profile-ucla-copy">
                <p className="profile-ucla-copy__text">
                  Add UCLA courses you have already completed. These count toward your unit total.
                </p>
                <p className="profile-ucla-copy__major">
                  <strong>For Major:</strong> {profile?.majorFocus ?? profile?.major ?? "—"}
                </p>
              </div>
              <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="profile-chip-list" style={{ minHeight: 24 }}>
                  {uclaCourses.length === 0
                    ? <p className="profile-empty-list">None added yet.</p>
                    : uclaCourses.map(c => (
                        <EditableChip key={c} label={c} onRemove={() => setUclaCourses(prev => prev.filter(x => x !== c))} />
                      ))
                  }
                </div>
                <SearchDropdown
                  options={academicOptions.uclaCourses}
                  selected={uclaCourses}
                  onAdd={c => setUclaCourses(prev => prev.includes(c) ? prev : [...prev, c])}
                  placeholder="Search UCLA courses…"
                  loading={loading}
                  error={err}
                />
              </div>
            </div>
          </article>

          <div className="profile-dual-row">
            <CourseSection
              title="AP Classes"
              courses={apClasses}
              onAdd={c => setApClasses(prev => prev.includes(c) ? prev : [...prev, c])}
              onRemove={c => setApClasses(prev => prev.filter(x => x !== c))}
              options={academicOptions.apExams}
              loading={loading}
              error={err}
              placeholder="Search AP exams…"
            />
            <CourseSection
              title="IB Classes"
              courses={ibClasses}
              onAdd={c => setIbClasses(prev => prev.includes(c) ? prev : [...prev, c])}
              onRemove={c => setIbClasses(prev => prev.filter(x => x !== c))}
              options={academicOptions.ibExams}
              loading={loading}
              error={err}
              placeholder="Search IB exams…"
            />
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8, paddingBottom: 32 }}>
          <button
            type="button"
            onClick={onDiscard}
            style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #D0D0D0", background: "#fff", fontSize: 14, fontFamily: FONT, cursor: "pointer", color: "#555" }}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#358162", fontSize: 14, fontFamily: FONT, cursor: "pointer", color: "#fff", fontWeight: 500 }}
          >
            Save changes
          </button>
        </div>
      </div>
    </main>
  );
}
