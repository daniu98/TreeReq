import { DegreeTree } from "../tree/DegreeTree.jsx";
import { DraggableCanvas } from "../tree/DraggableCanvas.jsx";

/** Convert a major-id slug to a readable name, e.g. "cognitive-science-bs" → "Cognitive Science BS" */
function slugToName(id) {
  return id
    .replace(/-bs$/i, " BS")
    .replace(/-ba$/i, " BA")
    .replace(/-bm$/i, " BM")
    .replace(/-ms$/i, " MS")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function MajorTreePage({ majorId, onBack }) {
  const majorName = slugToName(majorId);

  return (
    <DraggableCanvas background="#f7f7f5">
      <div style={{ paddingTop: 72, paddingLeft: 48, paddingRight: 48, paddingBottom: 48 }}>
        <DegreeTree
          key={majorId}
          majorId={majorId}
          majorName={majorName}
        />
      </div>
    </DraggableCanvas>
  );
}
