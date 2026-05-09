const labelStyle = {
  color: "#9A9A9A",
  fontSize: 14,
  fontFamily: "var(--font-ui)",
  fontWeight: 400,
};

const valueStyle = {
  color: "#2A2A2A",
  fontSize: 18,
  fontFamily: "var(--font-ui)",
  fontWeight: 500,
};

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
    </div>
  );
}

export default function ProfileMain({ onBack }) {
  return (
    <main
      style={{
        flex: 1,
        position: "relative",
        background: "#fff",
        overflow: "auto",
        minWidth: 0,
        padding: "36px 40px 48px",
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          border: "none",
          background: "transparent",
          color: "#2764A6",
          fontSize: 15,
          fontFamily: "var(--font-ui)",
          cursor: "pointer",
          marginBottom: 20,
          padding: 0,
        }}
      >
        ← Back to home
      </button>

      <section
        style={{
          maxWidth: 720,
          borderRadius: 24,
          border: "1px solid #EAEAEA",
          padding: 28,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "linear-gradient(180deg, #D9D9D9 0%, #C7C7C7 100%)",
            }}
            aria-hidden
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 28 }}>Steve M.</h1>
            <span style={{ ...labelStyle, fontSize: 16 }}>Profile</span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
          }}
        >
          <DetailRow label="Major" value="Cognitive Science, B.S." />
          <DetailRow label="Minor" value="None" />
          <DetailRow label="Completed Units" value="75" />
          <DetailRow label="Class Standing" value="Sophomore" />
        </div>
      </section>
    </main>
  );
}
