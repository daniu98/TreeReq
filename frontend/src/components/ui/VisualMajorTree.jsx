import { useMemo, useRef } from "react";
import { CategoryNode } from "./CategoryNode.jsx";
import { ClassNode } from "./ClassNode.jsx";
import { TreeEdgeLayer } from "./TreeEdgeLayer.jsx";
import { useTreeEdges } from "./useTreeEdges.js";
import { CATEGORY_RADIUS, COURSE_RADIUS } from "./treeGeometry.js";

const SPINE_KEYS = ["prep", "major", "capstone"];
const SPINE_CHAIN = ["root", "prep", "major", "capstone"];

export function VisualMajorTree({ visualTree }) {
  const canvasRef = useRef(null);

  const sectionsByKey = useMemo(() => {
    const map = {};
    for (const sec of visualTree?.sections || []) {
      map[sec.milestone?.key] = sec;
    }
    return map;
  }, [visualTree]);

  const edgeSpecs = useMemo(() => buildEdgeSpecs(sectionsByKey), [sectionsByKey]);
  const { edges, size, ready } = useTreeEdges(canvasRef, edgeSpecs, [visualTree]);

  if (!visualTree) return null;

  const milestones = visualTree.milestones || [];
  const root = milestones.find((m) => m.key === "root");
  const spineByKey = Object.fromEntries(
    milestones.filter((m) => SPINE_KEYS.includes(m.key)).map((m) => [m.key, m])
  );

  return (
    <div className="vmt-scroll">
      <div ref={canvasRef} className="vmt">
        {ready ? (
          <TreeEdgeLayer width={size.width} height={size.height} edges={edges} />
        ) : null}

        <div className="vmt-layout">
          {/* Spine row */}
          <div className="vmt-layout__root-spine">
            {root ? (
              <div className="vmt__spine-node" data-tree-node="root">
                <CategoryNode
                  type="overarching"
                  categoryName={root.label}
                  color="linear-gradient(180deg, #85B110 0%, #358162 100%)"
                />
              </div>
            ) : null}
          </div>

          {SPINE_KEYS.map((key) => {
            const m = spineByKey[key];
            return (
              <div key={key} className={`vmt-layout__spine vmt-layout__spine--${key}`}>
                {m ? (
                  <div className="vmt__spine-node" data-tree-node={`milestone-${key}`}>
                    <CategoryNode
                      type="overarching"
                      categoryName={m.label}
                      color="linear-gradient(180deg, #85B110 0%, #358162 100%)"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}

          {/* Content row — empty under root */}
          <div className="vmt-layout__root-content" aria-hidden />

          {SPINE_KEYS.map((key) => (
            <div key={`${key}-col`} className={`vmt-layout__content vmt-layout__content--${key}`}>
              <MilestoneColumn section={sectionsByKey[key]} milestoneKey={key} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MilestoneColumn({ milestoneKey, section }) {
  const categories = section?.categories || [];

  if (!categories.length) {
    return <p className="vmt__empty">No requirements in this section.</p>;
  }

  return (
    <div className="vmt__column">
      {categories.map((block, idx) => (
        <CategoryBranch
          key={block.category.id}
          block={block}
          milestoneKey={milestoneKey}
          index={idx}
        />
      ))}
    </div>
  );
}

function CategoryBranch({ block, milestoneKey, index }) {
  const { category, courses } = block;
  const catId = `cat-${milestoneKey}-${index}`;
  const subtitle =
    category.subtitle || (category.choose_n ? `Choose ${category.choose_n}` : null);

  const rows = useMemo(
    () => layoutCourseRows(courses, block.prereq_edges || []),
    [courses, block.prereq_edges]
  );

  return (
    <div className="vmt__branch">
      <div className="vmt__category-wrap" data-tree-node={catId}>
        <CategoryNode
          type="category"
          categoryName={category.label}
          completionPercentage={category.completion_percentage ?? 0}
        />
      </div>

      {subtitle ? <p className="vmt__category-sub">{subtitle}</p> : null}

      <div className="vmt__courses">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="vmt__course-row">
            {row.map((course) => (
              <div
                key={course.id}
                className="vmt__course-wrap"
                data-tree-node={`course-${course.id}`}
              >
                <ClassNode
                  courseName={course.courseName}
                  status={course.status || "Unfulfilled"}
                  department={course.department}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function layoutCourseRows(courses, prereqEdges) {
  const byId = new Map(courses.map((c) => [c.course_id, c]));
  const prereqOf = new Map();
  for (const e of prereqEdges) {
    if (e.kind !== "prereq") continue;
    if (!byId.has(e.source) || !byId.has(e.target)) continue;
    prereqOf.set(e.target, e.source);
  }

  const targets = new Set(prereqOf.keys());
  const roots = courses.filter((c) => !targets.has(c.course_id));
  const chains = [];

  for (const root of roots) {
    const chain = [];
    let cur = root.course_id;
    const seen = new Set();
    while (cur && byId.has(cur) && !seen.has(cur)) {
      seen.add(cur);
      chain.push(byId.get(cur));
      const next = [...prereqOf.entries()].find(([t, s]) => s === cur)?.[0];
      cur = next;
    }
    if (chain.length > 0) chains.push(chain);
  }

  const covered = new Set(chains.flat().map((c) => c.course_id));
  for (const c of courses) {
    if (!covered.has(c.course_id)) chains.push([c]);
  }

  return chains;
}

function buildEdgeSpecs(sectionsByKey) {
  const specs = [];

  for (let i = 0; i < SPINE_CHAIN.length - 1; i++) {
    const from = SPINE_CHAIN[i];
    const to = SPINE_CHAIN[i + 1];
    specs.push({
      id: `spine-${from}-${to}`,
      from: from === "root" ? "root" : `milestone-${from}`,
      to: `milestone-${to}`,
      kind: "spine",
      fromSide: "right",
      toSide: "left",
    });
  }

  for (const key of SPINE_KEYS) {
    const section = sectionsByKey[key];
    if (!section?.categories?.length) continue;

    section.categories.forEach((block, idx) => {
      const catNodeId = `cat-${key}-${idx}`;
      specs.push({
        id: `branch-${key}-${idx}`,
        from: `milestone-${key}`,
        to: catNodeId,
        kind: "branch",
        fromSide: "bottom",
        toSide: "top",
      });

      const rows = layoutCourseRows(block.courses || [], block.prereq_edges || []);

      for (const row of rows) {
        if (row.length === 0) continue;
        specs.push({
          id: `stem-${key}-${idx}-${row[0].id}`,
          from: catNodeId,
          to: `course-${row[0].id}`,
          kind: "stem",
          fromSide: "bottom",
          toSide: "top",
          padFrom: CATEGORY_RADIUS,
          padTo: COURSE_RADIUS,
        });

        for (let c = 0; c < row.length - 1; c++) {
          specs.push({
            id: `prereq-${row[c].id}-${row[c + 1].id}`,
            from: `course-${row[c].id}`,
            to: `course-${row[c + 1].id}`,
            kind: "prereq",
            fromSide: "right",
            toSide: "left",
          });
        }
      }
    });
  }

  return specs;
}
