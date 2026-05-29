export const INNER_WIDTH = 126;
export const LABEL_MAX_PX = 20;
export const LABEL_MIN_PX = 11;
export const COMPLETION_MAX_PX = 14;
export const COMPLETION_MIN_PX = 9;
export const CHAR_WIDTH_RATIO = 0.55;

/**
 * Compute a font size that keeps text within a circle node.
 *
 * Two constraints are applied and the tighter one wins:
 *  1. Horizontal: the longest single word must fit in `innerWidth`.
 *  2. Vertical: all wrapped lines must fit in `innerHeight` (approximate).
 *
 * @param {string} text
 * @param {number} maxPx   - largest allowed font size
 * @param {number} minPx   - smallest allowed font size
 * @param {number} innerWidth   - usable text width in px (default 126)
 * @param {number} innerHeight  - usable text height in px (default 90)
 */
export function calcFontSize(
  text,
  maxPx = LABEL_MAX_PX,
  minPx = LABEL_MIN_PX,
  innerWidth = INNER_WIDTH,
  innerHeight = 90,
) {
  if (!text) return maxPx;

  // 1. Horizontal constraint: longest word must fit on one line.
  const longestWord = text.split(/\s+/).reduce((a, b) => (a.length > b.length ? a : b), "");
  const sizeFromWidth = innerWidth / (longestWord.length * CHAR_WIDTH_RATIO);

  // 2. Vertical constraint: all wrapped lines must fit in innerHeight.
  //    Estimate: lines ≈ totalChars / charsPerLine, height = lines * fontSize * lineHeight.
  //    Solving for fontSize: f <= sqrt(innerHeight * innerWidth / (totalChars * lineHeight * CHAR_WIDTH_RATIO))
  const totalChars = text.length; // include spaces — word-wrap means short words create extra lines
  const LINE_HEIGHT = 1.25;
  const sizeFromHeight = Math.sqrt(
    (innerHeight * innerWidth) / (totalChars * LINE_HEIGHT * CHAR_WIDTH_RATIO)
  );

  const computed = Math.min(sizeFromWidth, sizeFromHeight);
  return Math.max(minPx, Math.min(maxPx, Math.floor(computed)));
}
