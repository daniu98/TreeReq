import { Node } from "./components/ui/Node.jsx";
import imgUnfulfilledIcon from "./assets/unfulfilled-icon.svg";

export default function App() {
  return (
    <div style={{ display: "flex", gap: "32px", padding: "40px", flexWrap: "wrap", alignItems: "center" }}>
      <Node label="Cognitive Science" />
      <Node label="Physics" borderColor="#3b82f6" background="#1e40af" />
      <Node label="Math" borderColor="#9333ea" background="linear-gradient(180deg, #9333ea 0%, #4f46e5 100%)" />
      <Node
        label="Additional Required Courses"
        borderColor="rgba(255,255,255,0.5)"
        background="#9a9a9a"
        logo={imgUnfulfilledIcon}
        completion="0% complete"
      />
    </div>
  );
}