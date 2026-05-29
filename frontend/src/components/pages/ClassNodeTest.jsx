import { ClassNode } from "../ui/ClassNode.jsx";

/** Quick visual sandbox for ClassNode — renders every status variant. */
export default function ClassNodeTest() {
  return (
    <div
      style={{
        padding: 40,
        display: "flex",
        flexDirection: "column",
        gap: 32,
        fontFamily: "Inter, system-ui, sans-serif",
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ margin: 0 }}>ClassNode test</h1>

      <section>
        <h2 style={{ fontSize: 16, color: "#666", margin: "0 0 12px" }}>
          Status pills
        </h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <ClassNode courseName="MATH 31AL" status="Completed" department="MATH" />
          <ClassNode courseName="MATH 31B" status="In Progress" department="MATH" />
          <ClassNode courseName="PSYCH 85" status="Planned" department="PSYCH" />
          <ClassNode courseName="PIC 10C" status="Unfulfilled" department="PIC" />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, color: "#666", margin: "0 0 12px" }}>
          Circle variant (no status, just color)
        </h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <ClassNode courseName="LING 20" color="#85b110" department="LING" />
          <ClassNode courseName="PSYCH 100A" color="#358162" department="PSYCH" />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, color: "#666", margin: "0 0 12px" }}>
          Click handler
        </h2>
        <ClassNode
          courseName="PHIL 7"
          status="Planned"
          department="PHIL"
          onClick={() => alert("clicked PHIL 7")}
        />
      </section>
    </div>
  );
}
