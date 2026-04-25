export function Button({
  children,
  variant = "secondary",
  type = "button",
  disabled,
  ...props
}) {
  const base = {
    border: "none",
    borderRadius: "999px",
    padding: "10px 18px",
    fontWeight: 600,
    fontSize: "0.9rem",
    transition: "opacity 0.15s, transform 0.1s",
  };
  const variants = {
    primary: {
      ...base,
      background: "var(--surface-strong)",
      color: "var(--text-on-dark)",
    },
    secondary: {
      ...base,
      background: "var(--surface-muted)",
      color: "var(--text-primary)",
    },
    ghost: {
      ...base,
      background: "transparent",
      color: "var(--text-muted)",
    },
    dangerGhost: {
      ...base,
      background: "transparent",
      color: "var(--surface-dark)",
    },
  };
  const style = {
    ...variants[variant],
    opacity: disabled ? 0.45 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
  return (
    <button type={type} disabled={disabled} style={style} {...props}>
      {children}
    </button>
  );
}
