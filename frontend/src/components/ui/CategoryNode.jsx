import { calcFontSize } from "./nodeUtils.js";
import {
  IconCompleted,
  IconInProgress,
  IconUnfulfilled,
} from "../tree/StatusIcons.jsx";

/**
 * CategoryNode — two visual variants matching the Figma design:
 *
 *  "overarching"  (root / section hubs):
 *    220px outer circle — gradient ring (#85b110→#358162) + gradient-filled
 *    inner circle (~172px) + centered white label text. No icon, no %.
 *
 *  "category"  (department nodes):
 *    220px circle — 10px solid white border, solid fill that reflects status
 *    (gray / lime-green / dark-green), status icon (48px) + label + "X% complete".
 */

// Inner text-area widths for font-size calculation.
const INNER_WIDTH_OVERARCHING = 126; // 172px inner circle - 2*23px padding
const INNER_WIDTH_CATEGORY    = 120; // approx usable text width inside 220px circle

const GRAD = "linear-gradient(180deg, #85b110 0%, #358162 100%)";

// ─── Overarching (section/root) ─────────────────────────────────────────────

function OverarchingNode({ categoryName }) {
  const labelSize = calcFontSize(categoryName, 20, 11, INNER_WIDTH_OVERARCHING);

  return (
    // Outer gradient ring (7px "stroke" via padding)
    <div
      style={{
        width: 220,
        height: 220,
        borderRadius: "50%",
        background: GRAD,
        padding: 7,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/* White gap separating ring from inner fill */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "#ffffff",
          padding: 17,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Gradient-filled inner circle */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: GRAD,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              fontFamily: '"Google Sans Flex", Inter, system-ui, sans-serif',
              fontSize: labelSize,
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.25,
              wordBreak: "break-word",
              margin: 0,
            }}
          >
            {categoryName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Regular category (department) ──────────────────────────────────────────

function StatusIcon({ completion, bgColor }) {
  // Icon disc is white on a colored node background so it stands out clearly.
  // Incomplete: CircleWrap matches the node bg so the white circle path itself
  // forms the visible disc boundary (matching Figma's no-fill icon frame).
  if (completion === 100) return <IconCompleted bg="#ffffff" color="#358162" size={48} />;
  if (completion > 0)    return <IconInProgress bg="#ffffff" color="#85B110" size={48} />;
  return <IconUnfulfilled bg={bgColor} color="#ffffff" size={48} />;
}

function DepartmentNode({ categoryName, completionPercentage }) {
  const clamped = Math.max(0, Math.min(100,
    typeof completionPercentage === "number"
      ? completionPercentage
      : parseInt(completionPercentage, 10) || 0
  ));

  let bgColor;
  if (clamped === 100)    bgColor = "#358162";
  else if (clamped > 0)  bgColor = "#85B110";
  else                   bgColor = "#9A9A9A";

  // Usable height for the label text. Generous padding is intentional: the
  // sqrt formula assumes perfect char-packing, but real word-wrap wastes space
  // on short words that don't fill the line. A conservative 72px budget keeps
  // long labels (5+ lines) from pushing "X% complete" off the bottom of the circle.
  const LABEL_HEIGHT = 72;
  const labelSize = calcFontSize(categoryName, 20, 11, INNER_WIDTH_CATEGORY, LABEL_HEIGHT);

  return (
    <div
      style={{
        width: 220,
        height: 220,
        borderRadius: "50%",
        border: "10px solid rgba(255,255,255,0.5)",
        background: bgColor,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <StatusIcon completion={clamped} bgColor={bgColor} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          maxWidth: INNER_WIDTH_CATEGORY,
        }}
      >
        <span
          style={{
            fontFamily: '"Google Sans Flex", Inter, system-ui, sans-serif',
            fontSize: labelSize,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.25,
            wordBreak: "break-word",
            margin: 0,
          }}
        >
          {categoryName}
        </span>
        <span
          style={{
            fontFamily: '"Google Sans Flex", Inter, system-ui, sans-serif',
            fontSize: 14,
            fontWeight: 400,
            color: "#ffffff",
            textAlign: "center",
            margin: 0,
          }}
        >
          {clamped}% complete
        </span>
      </div>
    </div>
  );
}

// ─── Public export ───────────────────────────────────────────────────────────

export function CategoryNode({
  categoryName,
  type = "category",
  completionPercentage = 0,
}) {
  if (type === "overarching") {
    return <OverarchingNode categoryName={categoryName} />;
  }
  return (
    <DepartmentNode
      categoryName={categoryName}
      completionPercentage={completionPercentage}
    />
  );
}
