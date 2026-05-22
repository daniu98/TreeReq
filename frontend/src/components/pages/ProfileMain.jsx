function EditIcon() {
  return (
    <svg className="profile-edit-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function SectionHeading({ title, onEdit }) {
  return (
    <div className="profile-section-heading">
      <h2 className="profile-section-heading__title">{title}</h2>
      <button type="button" className="profile-edit-btn" onClick={onEdit} aria-label={`Edit ${title}`}>
        <EditIcon />
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="profile-info-row">
      <span className="profile-info-row__label">{label}</span>
      <span className="profile-info-row__value">{value}</span>
    </div>
  );
}

function CourseChip({ label }) {
  return <span className="profile-chip">{label}</span>;
}

function ChipList({ items, emptyLabel }) {
  if (!items?.length) {
    return <p className="profile-empty-list">{emptyLabel}</p>;
  }
  return (
    <div className="profile-chip-list">
      {items.map((item) => (
        <CourseChip key={item} label={item} />
      ))}
    </div>
  );
}

export default function ProfileMain({ onClose, profile }) {
  const firstName = profile?.displayName?.split(" ")[0] ?? "there";
  const uclaCourses = profile?.uclaCourses ?? [];
  const prepCount = uclaCourses.length;

  if (!profile) {
    return (
      <main className="profile-page">
        <div className="profile-shell">
          <p className="profile-empty-list">No profile data yet. Complete onboarding first.</p>
          <button type="button" className="onboarding-btn onboarding-btn--primary" onClick={onClose}>
            Go to home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <header className="profile-shell__header">
          <h1 className="profile-shell__title">Welcome to your profile, {firstName}!</h1>
          <button type="button" className="profile-shell__close" onClick={onClose} aria-label="Close profile">
            <CloseIcon />
          </button>
        </header>

        <section className="profile-card" aria-labelledby="profile-info-heading">
          <div className="profile-card__head">
            <h2 id="profile-info-heading" className="profile-card__title">
              Profile Information
            </h2>
            <button type="button" className="profile-edit-btn" aria-label="Edit profile information">
              <EditIcon />
            </button>
          </div>

          <div className="profile-card__body profile-card__body--info">
            <div className="profile-identity">
              <div className="profile-avatar" aria-hidden />
              <span className="profile-identity__name">{profile.displayName}</span>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-col">
                <InfoRow label="Name:" value={profile.fullName} />
                <InfoRow label="Major:" value={profile.major} />
                <InfoRow label="Minor:" value={profile.minor} />
              </div>
              <div className="profile-info-col">
                <InfoRow label="Admit Term:" value={profile.admitTerm} />
                <InfoRow label="Admit Level:" value={profile.admitLevel} />
                <InfoRow label="Graduation Term:" value={profile.gradTerm} />
              </div>
            </div>
          </div>
        </section>

        <section className="profile-academic" aria-labelledby="profile-academic-heading">
          <SectionHeading title="Academic Information" onEdit={() => {}} />

          <article className="profile-card profile-card--ucla">
            <h3 className="profile-card__subtitle">UCLA Courses Taken:</h3>
            <div className="profile-ucla-layout">
              <div className="profile-ucla-copy">
                <p className="profile-ucla-copy__text">
                  Courses you have taken will be updated with your trees. You can also edit your courses
                  here.
                </p>
                <p className="profile-ucla-copy__major">
                  <strong>For Major:</strong> {profile.majorFocus}
                </p>
              </div>
              <div className="profile-prep-box">
                <p className="profile-prep-box__title">
                  Completed Preparation Courses: ({prepCount}/{prepCount})
                </p>
                <p className="profile-prep-box__courses">
                  {prepCount > 0 ? uclaCourses.join(", ") : "None added yet."}
                </p>
              </div>
            </div>
          </article>

          <div className="profile-dual-row">
            <article className="profile-card profile-card--compact">
              <h3 className="profile-card__subtitle">AP Classes Taken:</h3>
              <p className="profile-saved-label">Saved list:</p>
              <ChipList items={profile.apClasses} emptyLabel="None added yet." />
            </article>

            <article className="profile-card profile-card--compact">
              <h3 className="profile-card__subtitle">IB Classes Taken:</h3>
              <p className="profile-saved-label">Saved list:</p>
              <ChipList items={profile.ibClasses} emptyLabel="None added yet." />
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
