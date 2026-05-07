export const INNER_WIDTH = 126;
export const LABEL_MAX_PX = 20;
export const LABEL_MIN_PX = 11;
export const COMPLETION_MAX_PX = 14;
export const COMPLETION_MIN_PX = 9;
export const CHAR_WIDTH_RATIO = 0.55;

export function calcFontSize(text, maxPx, minPx, innerWidth = INNER_WIDTH) {
  if (!text) return maxPx;
  const longestWord = text.split(/\s+/).reduce((a, b) => (a.length > b.length ? a : b), "");
  const fitsAt = innerWidth / (longestWord.length * CHAR_WIDTH_RATIO);
  return Math.max(minPx, Math.min(maxPx, Math.floor(fitsAt)));
}
