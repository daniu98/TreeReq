const styles = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px",
    borderRadius: "50%",
    boxSizing: "border-box",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "172px",
    height: "172px",
    borderRadius: "50%",
    padding: "23px",
    boxSizing: "border-box",
    flexShrink: 0,
  },
  logo: {
    width: "48px",
    height: "48px",
    display: "block",
    flexShrink: 0,
  },
  textGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
  },
  label: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "normal",
    color: "#ffffff",
    textAlign: "center",
    wordBreak: "break-word",
    margin: 0,
  },
  completion: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "normal",
    color: "#ffffff",
    textAlign: "center",
    margin: 0,
  },
};

const INNER_WIDTH = 126;
const LABEL_MAX_PX = 20;
const LABEL_MIN_PX = 11;
const COMPLETION_MAX_PX = 14;
const COMPLETION_MIN_PX = 9;
const CHAR_WIDTH_RATIO = 0.55;

function calcFontSize(text, maxPx, minPx) {
  if (!text) return maxPx;
  const longestWord = text.split(/\s+/).reduce((a, b) => (a.length > b.length ? a : b), "");
  const fitsAt = INNER_WIDTH / (longestWord.length * CHAR_WIDTH_RATIO);
  return Math.max(minPx, Math.min(maxPx, Math.floor(fitsAt)));
}

export function Node({
  label = "Category",
  borderColor = "#85b110",
  background = "linear-gradient(180deg, #85b110 0%, #358162 100%)",
  logo = null,
  completion = null,
}) {
  const labelSize = calcFontSize(label, LABEL_MAX_PX, LABEL_MIN_PX);
  const completionSize = calcFontSize(completion, COMPLETION_MAX_PX, COMPLETION_MIN_PX);

  return (
    <div style={{ ...styles.wrapper, border: `7px solid ${borderColor}` }}>
      <div style={{ ...styles.inner, background }}>
        {logo && <img src={logo} alt="" style={styles.logo} />}
        <div style={styles.textGroup}>
          <span style={{ ...styles.label, fontSize: `${labelSize}px` }}>{label}</span>
          {completion != null && (
            <span style={{ ...styles.completion, fontSize: `${completionSize}px` }}>{completion}</span>
          )}
        </div>
      </div>
    </div>
  );
}
