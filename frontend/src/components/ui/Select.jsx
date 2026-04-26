const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid transparent",
  background: "var(--surface-strong)",
  color: "var(--text-on-dark)",
  fontFamily: "var(--body-text-font-family)",
  fontSize: "var(--body-text-font-size)",
  appearance: "none",
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, #fafafa 50%), linear-gradient(135deg, #fafafa 50%, transparent 50%)",
  backgroundPosition:
    "calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px)",
  backgroundSize: "6px 6px, 6px 6px",
  backgroundRepeat: "no-repeat",
};

export function Select({ id, label, value, onChange, options, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label ? (
        <label
          htmlFor={id}
          style={{
            fontFamily: "var(--labels-font-family)",
            fontSize: "var(--labels-font-size)",
            color: "var(--text-muted)",
            fontWeight: 500
          }}
        >
          {label}
        </label>
      ) : null}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={fieldStyle}
        disabled={options.length === 0}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.length === 0 ? (
          <option value="">No options</option>
        ) : (
          options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ color: "#18181b" }}>
              {opt.label}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
