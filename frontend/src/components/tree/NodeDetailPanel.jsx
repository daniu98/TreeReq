import { useEffect, useRef } from "react";

const STATUS_CONFIG = {
  unfulfilled: { label: "Unfulfilled", color: "#9a9a9a", bg: "#f0f0f0" },
  planned:     { label: "Planned",     color: "#5a9e6e", bg: "#e8f5ed" },
  in_progress: { label: "In Progress", color: "#84b110", bg: "#f2f8e0" },
  completed:   { label: "Completed",   color: "#348162", bg: "#e0f0ea" },
  locked:      { label: "Locked",      color: "#b0b0b0", bg: "#f5f5f5" },
};

const FONT = "Inter, system-ui, sans-serif";

function StatusDot({ status, size = 10 }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unfulfilled;
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: cfg.color,
        flexShrink: 0,
      }}
    />
  );
}

function StatusChip({ status, active, onClick }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unfulfilled;
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        color: active ? cfg.color : "#888",
        background: active ? cfg.bg : "transparent",
        border: `1.5px solid ${active ? cfg.color : "#ddd"}`,
        borderRadius: 20,
        padding: "4px 10px",
        cursor: "pointer",
        transition: "all 120ms",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </button>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #f0f0f0", margin: "14px 0" }} />;
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: pct === 100 ? "#348162" : pct > 0 ? "#84b110" : "#ccc",
          borderRadius: 3,
          transition: "width 300ms ease",
        }}
      />
    </div>
  );
}

// ── Course panel ──────────────────────────────────────────────────────────────

function CoursePanel({ node, statusMap, nodeById, onStatusChange, onNavigate }) {
  const courseId = node.id;
  const d = node.data;
  const effectiveStatus = statusMap[courseId] ?? (node.status === "locked" ? "locked" : "unfulfilled");
  const statusCfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.unfulfilled;

  const prereqIds = (node.unmetPrereqs ?? []).concat(
    // also show met prereqs: find all edges targeting this course
    // We can derive from nodeById: check which nodes list this node as a prerequisite
    // Simpler: use the node's data if available
  ).filter(Boolean);

  // Build prereq list from unmetPrereqs + any completed ones we can derive
  const allPrereqIds = node.allPrereqIds ?? node.unmetPrereqs ?? [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
          {d.dept}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1.15, marginBottom: 4 }}>
          {d.dept} {d.number}
        </div>
        {d.title && (
          <div style={{ fontFamily: FONT, fontSize: 13, color: "#666", lineHeight: 1.4, marginBottom: 12 }}>
            {d.title}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 11,
              color: statusCfg.color,
              background: statusCfg.bg,
              border: `1.5px solid ${statusCfg.color}`,
              borderRadius: 20,
              padding: "3px 10px",
              fontWeight: 600,
            }}
          >
            {statusCfg.label}
          </span>
          {d.units > 0 && (
            <span style={{ fontFamily: FONT, fontSize: 11, color: "#999", background: "#f5f5f5", border: "1px solid #e8e8e8", borderRadius: 20, padding: "3px 10px" }}>
              {d.units} units
            </span>
          )}
          {d.is_elective && (
            <span style={{ fontFamily: FONT, fontSize: 11, color: "#7b5ea7", background: "#f3eeff", border: "1px solid #c4b0ee", borderRadius: 20, padding: "3px 8px" }}>
              Elective
            </span>
          )}
        </div>
      </div>

      <Divider />

      {/* Status controls */}
      <SectionLabel>Mark as</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
        {["unfulfilled", "planned", "in_progress", "completed"].map((s) => (
          <StatusChip
            key={s}
            status={s}
            active={(statusMap[courseId] ?? "unfulfilled") === s}
            onClick={() => onStatusChange(courseId, s)}
          />
        ))}
      </div>
      {effectiveStatus === "locked" && (
        <div style={{ fontFamily: FONT, fontSize: 12, color: "#c47a00", marginTop: 6 }}>
          ⚠ Prerequisites not yet completed — you can still mark this manually.
        </div>
      )}

      {/* Enforced prereqs as clickable chips */}
      {node.unmetPrereqs?.length > 0 && (
        <>
          <Divider />
          <SectionLabel>Enforced Prerequisites</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {node.unmetPrereqs.map((pid) => {
              const pNode = nodeById?.get(pid);
              const pStatus = statusMap[pid] ?? "unfulfilled";
              return (
                <button
                  key={pid}
                  onClick={() => onNavigate(pid)}
                  style={{
                    fontFamily: FONT,
                    fontSize: 12,
                    color: "#444",
                    background: "#f5f5f5",
                    border: "1px solid #ddd",
                    borderRadius: 20,
                    padding: "4px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <StatusDot status={pStatus} size={7} />
                  {pid}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Description */}
      {d.description && (
        <>
          <Divider />
          <SectionLabel>Description</SectionLabel>
          <div style={{ fontFamily: FONT, fontSize: 13, color: "#555", lineHeight: 1.6 }}>
            {d.description.length > 400 ? d.description.slice(0, 400) + "…" : d.description}
          </div>
        </>
      )}

      {/* Advanced Preparation (raw prereq text) */}
      {d.prereqs_raw && (
        <>
          <Divider />
          <SectionLabel>Advanced Preparation</SectionLabel>
          <div style={{ fontFamily: FONT, fontSize: 13, color: "#555", lineHeight: 1.5 }}>
            {d.prereqs_raw}
          </div>
        </>
      )}
    </div>
  );
}

// ── Category panel ────────────────────────────────────────────────────────────

function CategoryPanel({ node, statusMap, nodeById, onStatusChange, onNavigate }) {
  const d = node.data;
  const pct = node.completionPercentage ?? 0;
  const courses = d.courses ?? [];
  const completed = courses.filter((cid) => statusMap[cid] === "completed").length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        {d.section && (
          <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
            {d.section}
          </div>
        )}
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: "#111", lineHeight: 1.2, marginBottom: 12 }}>
          {d.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {d.choose_n != null && (
            <span style={{ fontFamily: FONT, fontSize: 11, color: "#7b5ea7", background: "#f3eeff", border: "1px solid #c4b0ee", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>
              Choose {d.choose_n} of {courses.length}
            </span>
          )}
          <span style={{ fontFamily: FONT, fontSize: 12, color: pct === 100 ? "#348162" : "#888" }}>
            {completed} / {courses.length} completed
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          <ProgressBar pct={pct} />
        </div>
      </div>

      <Divider />

      {/* Course list */}
      <SectionLabel>Courses</SectionLabel>
      {courses.length === 0 ? (
        <div style={{ fontFamily: FONT, fontSize: 13, color: "#aaa" }}>No courses listed</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {courses.map((cid) => {
            const cn = nodeById?.get(cid);
            const st = statusMap[cid] ?? (cn?.status === "locked" ? "locked" : "unfulfilled");
            const title = cn?.data?.title ?? "";
            const stCfg = STATUS_CONFIG[st] ?? STATUS_CONFIG.unfulfilled;
            return (
              <div
                key={cid}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f7f7f7"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                onClick={() => onNavigate(cid)}
              >
                <StatusDot status={st} size={9} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#222" }}>{cid}</div>
                  {title && (
                    <div style={{ fontFamily: FONT, fontSize: 11, color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {title}
                    </div>
                  )}
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: "2px 4px",
                    cursor: "pointer",
                    fontFamily: FONT,
                    fontSize: 13,
                    color: stCfg.color,
                    flexShrink: 0,
                    borderRadius: 4,
                  }}
                  title={st === "completed" ? "Mark unfulfilled" : "Mark completed"}
                  onClick={(e) => { e.stopPropagation(); onStatusChange(cid, st === "completed" ? "unfulfilled" : "completed"); }}
                >
                  {st === "completed" ? "✓" : "○"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Section / root panel ──────────────────────────────────────────────────────

function SectionPanel({ node }) {
  const pct = node.completionPercentage ?? 0;
  const completed = node.completedCourses ?? 0;
  const total = node.totalCourses ?? 0;
  return (
    <div>
      <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
        {node.kind === "root" ? "Degree" : "Section"}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1.2, marginBottom: 12 }}>
        {node.data.name}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 12, color: pct === 100 ? "#348162" : "#888", marginBottom: 6 }}>
        {completed} / {total} courses completed
      </div>
      <ProgressBar pct={pct} />
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function NodeDetailPanel({ node, statusMap, nodeById, onStatusChange, onNavigate, onClose }) {
  const panelRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!node) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 340,
        height: "100vh",
        background: "#fff",
        boxShadow: "-2px 0 32px rgba(0,0,0,0.10)",
        borderLeft: "1px solid #f0f0f0",
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        animation: "slideIn 160ms ease-out",
      }}
    >
      <style>{`@keyframes slideIn { from { transform: translateX(48px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 14,
          right: 16,
          background: "#f5f5f5",
          border: "none",
          fontSize: 16,
          color: "#999",
          cursor: "pointer",
          lineHeight: 1,
          width: 28,
          height: 28,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
        aria-label="Close"
      >
        ×
      </button>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px 40px" }}>
        {node.kind === "course" && (
          <CoursePanel
            node={node}
            statusMap={statusMap}
            nodeById={nodeById}
            onStatusChange={onStatusChange}
            onNavigate={onNavigate}
          />
        )}
        {(node.kind === "category") && (
          <CategoryPanel
            node={node}
            statusMap={statusMap}
            nodeById={nodeById}
            onStatusChange={onStatusChange}
            onNavigate={onNavigate}
          />
        )}
        {(node.kind === "section" || node.kind === "root") && (
          <SectionPanel node={node} />
        )}
      </div>
    </div>
  );
}
