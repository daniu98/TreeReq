const text = { color: "#7C7C7C", fontSize: 16, fontFamily: "var(--font-ui)", fontWeight: 400 };
const sectionLabel = { color: "#9A9A9A", fontSize: 16, fontFamily: "var(--font-section)", fontWeight: 400 };

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="#7C7C7C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="#7C7C7C" strokeWidth="2" />
      <path d="M16 16l5 5" stroke="#7C7C7C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2L16 10h-3v3h6l-4 9h-6l-4-9h6v-3H8L12 2z" fill="#7C7C7C" />
    </svg>
  );
}

function NavRow({ icon, label }) {
  return (
    <button
      type="button"
      style={{
        alignSelf: "stretch",
        padding: 8,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 15,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {icon ?? <span style={{ width: 24, flexShrink: 0 }} aria-hidden />}
        <span style={{ ...text, maxWidth: 203, flex: 1 }}>{label}</span>
      </div>
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: "100%",
        height: 0,
        borderTop: "1px solid #D9D9D9",
      }}
    />
  );
}

export default function AppSidebar() {
  return (
    <aside
      style={{
        width: 325,
        flexShrink: 0,
        minHeight: "100vh",
        background: "#fff",
        borderRight: "1px solid #EAEAEA",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 65,
          padding: "15px 40px",
          borderBottom: "1px solid #D9D9D9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            background: "#85B110",
            borderRadius: 9999,
          }}
          aria-hidden
        />
        <button
          type="button"
          aria-label="Toggle layout"
          style={{
            width: 30,
            height: 30,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              border: "2px solid #9A9A9A",
              borderRadius: 2,
            }}
            aria-hidden
          />
        </button>
      </div>

      <div
        style={{
          padding: "36px 40px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 25,
          flex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <NavRow icon={<PlusIcon />} label="New tree" />
          <NavRow icon={<SearchIcon />} label="Search" />
        </div>

        <Divider />

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ paddingLeft: 8, paddingRight: 8 }}>
            <span style={sectionLabel}>Forests</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <NavRow icon={<TreeIcon />} label="Cognitive science" />
            <NavRow icon={<TreeIcon />} label="Business economics" />
            <NavRow icon={<TreeIcon />} label="Public affairs" />
          </div>
        </div>

        <Divider />

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ paddingLeft: 8, paddingRight: 8 }}>
            <span style={sectionLabel}>Recents</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <NavRow icon={null} label="Environmental science engin..." />
            <NavRow icon={null} label="Mechanical engineering aero..." />
          </div>
        </div>
      </div>
    </aside>
  );
}
