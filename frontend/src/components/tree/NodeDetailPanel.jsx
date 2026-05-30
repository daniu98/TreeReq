import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchCourseDetails } from "../../services/treeApi.js";
import { LeafBurst } from "../ui/LeafBurst.jsx";

// ms after first click on a locked checkbox before the pending override expires
const OVERRIDE_WINDOW = 2000;

const STATUS_OPTIONS = ["unfulfilled", "planned", "in_progress", "completed"];

const STATUS_CONFIG = {
  unfulfilled: { label: "Unfulfilled", color: "#9a9a9a", bg: "#f0f0f0" },
  planned:     { label: "Planned",     color: "#5a9e6e", bg: "#e8f5ed" },
  in_progress: { label: "In Progress", color: "#84b110", bg: "#f2f8e0" },
  completed:   { label: "Completed",   color: "#348162", bg: "#e0f0ea" },
  locked:      { label: "Locked",      color: "#b0b0b0", bg: "#f5f5f5" },
};

const FONT = "Inter, system-ui, sans-serif";

// ── Small helpers ─────────────────────────────────────────────────────────────

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

function Divider() {
  return <div style={{ borderTop: "1px solid #f0f0f0", margin: "14px 0" }} />;
}

function SectionLabel({ children, bold }) {
  return (
    <div style={{
      fontFamily: FONT,
      fontSize: bold ? 13 : 11,
      fontWeight: bold ? 700 : 600,
      color: bold ? "#222" : "#aaa",
      textTransform: bold ? "none" : "uppercase",
      letterSpacing: bold ? 0 : "0.6px",
      marginBottom: 8,
    }}>
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

// ── Status dropdown ───────────────────────────────────────────────────────────

function StatusDropdown({ courseId, currentStatus, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selectStatus = currentStatus === "locked" ? "unfulfilled" : currentStatus;
  const cfg = STATUS_CONFIG[selectStatus] ?? STATUS_CONFIG.unfulfilled;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 600,
          color: cfg.color,
          background: cfg.bg,
          border: `1.5px solid ${cfg.color}`,
          borderRadius: 20,
          padding: "5px 26px 5px 11px",
          cursor: "pointer",
          outline: "none",
          whiteSpace: "nowrap",
        }}
      >
        {cfg.label}
      </button>
      <span style={{
        position: "absolute",
        right: 9,
        top: "50%",
        transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
        pointerEvents: "none",
        color: cfg.color,
        fontSize: 9,
        lineHeight: 1,
        transition: "transform 150ms ease",
      }}>▾</span>

      {/* Custom dropdown list */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          minWidth: "100%",
          background: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: 14,
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
          overflow: "hidden",
          zIndex: 600,
          padding: "4px",
        }}>
          {STATUS_OPTIONS.map((s) => {
            const c = STATUS_CONFIG[s];
            const isSelected = s === selectStatus;
            return (
              <button
                key={s}
                type="button"
                onClick={() => { onStatusChange(courseId, s); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 10,
                  border: "none",
                  background: isSelected ? c.bg : "transparent",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? c.color : "#555",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f5f5f5"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: c.color,
                  flexShrink: 0,
                }} />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Prereq row (clickable) ────────────────────────────────────────────────────

function PrereqRow({ pid, statusMap, nodeById, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  const pNode = nodeById?.get(pid);
  const pStatus = statusMap[pid] ?? (pNode?.status === "locked" ? "locked" : "unfulfilled");
  const pCfg = STATUS_CONFIG[pStatus] ?? STATUS_CONFIG.unfulfilled;
  const canNavigate = !!pNode;

  return (
    <div
      onClick={() => canNavigate && onNavigate(pid)}
      onMouseEnter={() => canNavigate && setHovered(true)}
      onMouseLeave={() => canNavigate && setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 8,
        border: "1px solid #ebebeb",
        background: hovered ? "#f0f7f4" : "#fafafa",
        cursor: canNavigate ? "pointer" : "default",
        transition: "background 100ms",
      }}
    >
      <StatusDot status={pStatus} size={8} />
      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: "#333", flex: 1 }}>
        {pid}
      </span>
      <span style={{ fontFamily: FONT, fontSize: 11, color: pCfg.color, fontWeight: 600, flexShrink: 0 }}>
        {pCfg.label}
      </span>
      {canNavigate && (
        <span style={{ color: "#ccc", fontSize: 12, flexShrink: 0 }}>→</span>
      )}
    </div>
  );
}

// ── Course notes ─────────────────────────────────────────────────────────────

function CourseNotes({ courseId, userProfile, onProfileUpdate }) {
  const [note, setNote] = useState(() => userProfile?.courseNotes?.[courseId] ?? "");
  const [focused, setFocused] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    setNote(userProfile?.courseNotes?.[courseId] ?? "");
  }, [courseId, userProfile]);

  const MAX_NOTE_LENGTH = 2000;

  function handleChange(e) {
    const val = e.target.value.slice(0, MAX_NOTE_LENGTH);
    setNote(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!onProfileUpdate || !userProfile) return;
      const updated = { ...userProfile, courseNotes: { ...(userProfile.courseNotes ?? {}), [courseId]: val } };
      if (!val.trim()) delete updated.courseNotes[courseId];
      onProfileUpdate(updated);
    }, 600);
  }

  if (!userProfile) return null;

  return (
    <div>
      <Divider />
      <SectionLabel>My Notes</SectionLabel>
      <textarea
        value={note}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Add a personal note…"
        rows={3}
        style={{
          width: "100%",
          boxSizing: "border-box",
          fontFamily: FONT,
          fontSize: 13,
          color: "#333",
          background: focused ? "#fff" : "#fafafa",
          border: `1px solid ${focused ? "#81B3E8" : "#e8e8e8"}`,
          borderRadius: 8,
          padding: "8px 10px",
          resize: "vertical",
          minHeight: 60,
          maxHeight: 200,
          outline: "none",
          lineHeight: 1.55,
          transition: "border-color 120ms, background 120ms",
        }}
      />
    </div>
  );
}

// ── Course panel ──────────────────────────────────────────────────────────────

function CoursePanel({ node, statusMap, nodeById, onStatusChange, onNavigate, userProfile, onProfileUpdate }) {
  const courseId = node.id;
  const d = node.data;
  const effectiveStatus = statusMap[courseId] ?? (node.status === "locked" ? "locked" : "unfulfilled");

  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    setDetailsLoading(true);
    fetchCourseDetails(courseId)
      .then((data) => { if (!cancelled) { setDetails(data); setDetailsLoading(false); } })
      .catch(() => { if (!cancelled) setDetailsLoading(false); });
    return () => { cancelled = true; };
  }, [courseId]);

  const prereqsParsed = details?.prereqs_parsed;
  // Only show courses that are part of this major's tree
  const inMajor = (pid) => !!nodeById?.get(pid);
  const requiredPrereqs = (prereqsParsed?.required ?? []).filter(inMajor);
  const oneOfGroups = (prereqsParsed?.one_of ?? [])
    .map((group) => group.filter(inMajor))
    .filter((group) => group.length > 0);
  const corequisites = (prereqsParsed?.corequisites ?? []).filter(inMajor);
  const hasPrereqs = requiredPrereqs.length > 0 || oneOfGroups.length > 0;
  const hasCoreqs = corequisites.length > 0;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: FONT, fontSize: 10, fontWeight: 600, color: "#aaa",
          textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6,
        }}>
          {d.dept}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
          <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1.15 }}>
            {d.dept} {d.number}
          </div>
          <div style={{ flexShrink: 0, paddingTop: 3 }}>
            <StatusDropdown courseId={courseId} currentStatus={effectiveStatus} onStatusChange={onStatusChange} />
          </div>
        </div>

        {d.title && (
          <div style={{ fontFamily: FONT, fontSize: 13, color: "#666", lineHeight: 1.4, marginBottom: 10 }}>
            {d.title}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
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
          {effectiveStatus === "locked" && (
            <span style={{ fontFamily: FONT, fontSize: 11, color: "#c47a00" }}>
              ⚠ Prerequisites unmet — can still mark manually
            </span>
          )}
        </div>
      </div>

      <Divider />

      {detailsLoading ? (
        <div style={{ fontFamily: FONT, fontSize: 12, color: "#ccc", marginBottom: 14 }}>Loading…</div>
      ) : details?.description ? (
        <>
          <SectionLabel>Description</SectionLabel>
          <div style={{ fontFamily: FONT, fontSize: 13, color: "#555", lineHeight: 1.65, marginBottom: 4 }}>
            {details.description}
          </div>
          <Divider />
        </>
      ) : (
        <Divider />
      )}

      {!detailsLoading && hasPrereqs && (
        <>
          <SectionLabel bold>Enforced prerequisites:</SectionLabel>

          {requiredPrereqs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: oneOfGroups.length > 0 ? 12 : 0 }}>
              {requiredPrereqs.map((pid) => (
                <PrereqRow key={pid} pid={pid} statusMap={statusMap} nodeById={nodeById} onNavigate={onNavigate} />
              ))}
            </div>
          )}

          {oneOfGroups.map((group, i) => (
            <div key={i} style={{ marginBottom: i < oneOfGroups.length - 1 ? 14 : 0 }}>
              <div style={{ fontFamily: FONT, fontSize: 11, color: "#aaa", marginBottom: 6 }}>
                One course from:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {group.map((pid) => (
                  <PrereqRow key={pid} pid={pid} statusMap={statusMap} nodeById={nodeById} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          ))}

          <Divider />
        </>
      )}

      {!detailsLoading && hasCoreqs && (
        <>
          <SectionLabel bold>Enforced corequisites:</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {corequisites.map((pid) => (
              <PrereqRow key={pid} pid={pid} statusMap={statusMap} nodeById={nodeById} onNavigate={onNavigate} />
            ))}
          </div>
          <Divider />
        </>
      )}

      {details?.prereqs_raw && (
        <>
          <SectionLabel>Additional Info</SectionLabel>
          <div style={{ fontFamily: FONT, fontSize: 12, color: "#888", lineHeight: 1.55 }}>
            {details.prereqs_raw}
          </div>
        </>
      )}

      <CourseNotes courseId={courseId} userProfile={userProfile} onProfileUpdate={onProfileUpdate} />
    </div>
  );
}

// ── Category panel ────────────────────────────────────────────────────────────

function CourseCheckbox({ completed, disabled }) {
  const green = "#348162";
  const gray = "#9A9A9A";
  const borderColor = disabled ? "#999999" : completed ? green : gray;
  const bg = disabled ? "#D8D8D8" : completed ? green : "#fff";
  return (
    <div style={{
      width: 14,
      height: 14,
      borderRadius: 2,
      flexShrink: 0,
      background: bg,
      border: `1px solid ${borderColor}`,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {completed && !disabled && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function CategoryPanel({ node, statusMap, nodeById, onStatusChange, stackSelections, onWarn }) {
  const d = node.data;
  const isStack = d.choose_n != null;

  if (isStack) {
    // ── Stack category: show N slot rows ──────────────────────────────────
    const catSelections = stackSelections[node.id] ?? [];
    const completedCount = catSelections.filter(
      (cid) => cid && statusMap[cid] === "completed"
    ).length;
    const required = d.choose_n;
    const pct = required > 0 ? Math.min(100, Math.round((completedCount / required) * 100)) : 0;
    const displayName = d.name.replace(/\s*\(choose\s+\d+\)\s*$/i, "");
    const subtitle = `Choose ${required} of the following ${(d.courses ?? []).length} courses.`;

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          {d.section && (
            <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
              {d.section}
            </div>
          )}
          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: "#111", lineHeight: 1.2, marginBottom: 4 }}>
            {displayName}{" "}
            <span style={{ fontWeight: 400, color: "#9A9A9A" }}>
              ({Math.min(completedCount, required)}/{required})
            </span>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: "#9A9A9A", marginBottom: 14 }}>
            {subtitle}
          </div>
          <ProgressBar pct={pct} />
        </div>

        <Divider />

        <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#FAFAFA", borderRadius: 8, padding: 15 }}>
          {Array.from({ length: required }, (_, i) => {
            const courseId = catSelections[i] ?? null;
            const slotNode = nodeById?.get(`slot:${node.id}:${i}`);
            const isLocked = !!courseId && slotNode?.status === "locked";
            return (
              <StackSlotRow
                key={i}
                slotIndex={i}
                chooseN={required}
                courseId={courseId}
                isLocked={isLocked}
                statusMap={statusMap}
                nodeById={nodeById}
                onStatusChange={onStatusChange}
                onWarn={onWarn}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ── Regular category ──────────────────────────────────────────────────────
  const courses = d.courses ?? [];
  const completedCount = courses.filter((cid) => statusMap[cid] === "completed").length;
  const required = d.choose_n ?? courses.length;
  const pct = required > 0 ? Math.min(100, Math.round((completedCount / required) * 100)) : 0;

  const subtitle = d.choose_n != null
    ? `Complete ${d.choose_n} of the following ${courses.length} courses.`
    : `Complete the following ${courses.length} course${courses.length !== 1 ? "s" : ""}.`;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        {d.section && (
          <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
            {d.section}
          </div>
        )}
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: "#111", lineHeight: 1.2, marginBottom: 4 }}>
          {d.name}{" "}
          <span style={{ fontWeight: 400, color: "#9A9A9A" }}>
            ({Math.min(completedCount, required)}/{required})
          </span>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 14, color: "#9A9A9A", marginBottom: 14 }}>
          {subtitle}
        </div>
        <ProgressBar pct={pct} />
      </div>

      <Divider />

      {courses.length === 0 ? (
        <div style={{ fontFamily: FONT, fontSize: 13, color: "#aaa" }}>No courses listed</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#FAFAFA", borderRadius: 8, padding: 15 }}>
          {courses.map((cid) => (
            <CourseRow key={cid} courseId={cid} statusMap={statusMap} nodeById={nodeById} onStatusChange={onStatusChange} onWarn={onWarn} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stack slot panels ─────────────────────────────────────────────────────────

/**
 * StackSlotPanel — shown when a slot is UNASSIGNED.
 * Lists all available courses; clicking one immediately assigns it.
 */
function StackSlotPanel({ node, statusMap, allCourses, stackSelections, onStackSelect }) {
  const d = node.data;
  const catSelections = stackSelections[d.catId] ?? [];
  // Courses already assigned to OTHER slots in this category (can't double-assign)
  const otherSelectedSet = new Set(
    catSelections.filter((cid, i) => i !== d.slotIndex && cid)
  );

  const courseInfoMap = useMemo(
    () => new Map(allCourses.map((c) => [c.id, c])),
    [allCourses]
  );

  const displayCatName = d.catName.replace(/\s*\(choose\s+\d+\)\s*$/i, "");

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        {d.section && (
          <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
            {d.section}
          </div>
        )}
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: "#111", lineHeight: 1.2, marginBottom: 4 }}>
          {displayCatName}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 14, color: "#9A9A9A", marginBottom: 4 }}>
          Slot {d.slotIndex + 1} of {d.chooseN} — select one course below.
        </div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: "#BDBDBD" }}>
          {(d.availableCourses ?? []).length} courses available
        </div>
      </div>

      <Divider />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(d.availableCourses ?? []).map((cid) => {
          const info = courseInfoMap.get(cid);
          const isDisabled = otherSelectedSet.has(cid);
          return (
            <CourseSelectionRow
              key={cid}
              courseId={cid}
              title={info?.title ?? ""}
              units={info?.units ?? 0}
              disabled={isDisabled}
              onSelect={() => !isDisabled && onStackSelect(d.catId, d.slotIndex, cid)}
            />
          );
        })}
      </div>
    </div>
  );
}

function CourseSelectionRow({ courseId, title, units, disabled, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${hovered ? "#85B110" : "#ebebeb"}`,
        background: disabled ? "#f9f9f9" : hovered ? "#f6fbea" : "#fafafa",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "border-color 100ms, background 100ms",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: "#111" }}>
          {courseId}
        </div>
        {title && (
          <div style={{ fontFamily: FONT, fontSize: 12, color: "#888", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {units > 0 && (
          <span style={{ fontFamily: FONT, fontSize: 11, color: "#999", background: "#f0f0f0", borderRadius: 20, padding: "2px 8px" }}>
            {units} units
          </span>
        )}
        {disabled ? (
          <span style={{ fontFamily: FONT, fontSize: 11, color: "#bbb" }}>assigned</span>
        ) : (
          <span style={{ color: hovered ? "#85B110" : "#ccc", fontSize: 14, transition: "color 100ms" }}>→</span>
        )}
      </div>
    </div>
  );
}

/**
 * AssignedStackSlotPanel — shown when a slot IS assigned.
 * Renders a full CoursePanel for the assigned course + Revert button.
 */
function AssignedStackSlotPanel({ node, statusMap, nodeById, onStatusChange, onNavigate, onStackRevert, userProfile, onProfileUpdate }) {
  const d = node.data;
  const assignedId = node.assignedCourseId;

  // Build a synthetic course node so CoursePanel can render without needing the
  // assigned course to be in the tree's nodeById map.
  const parts = assignedId.split(/\s+/);
  const syntheticCourseNode = {
    id: assignedId,
    kind: "course",
    data: {
      dept:        parts.slice(0, -1).join(" "),
      number:      parts[parts.length - 1] ?? "",
      title:       "",  // CoursePanel fetches this from the API
      units:       0,
      is_elective: false,
    },
    status: statusMap[assignedId] ?? "unfulfilled",
  };

  return (
    <div>
      <CoursePanel
        node={syntheticCourseNode}
        statusMap={statusMap}
        nodeById={nodeById}
        onStatusChange={onStatusChange}
        onNavigate={onNavigate}
        userProfile={userProfile}
        onProfileUpdate={onProfileUpdate}
      />

      <Divider />

      {/* Revert button */}
      <button
        onClick={() => onStackRevert(d.catId, d.slotIndex)}
        style={{
          width: "100%",
          padding: "10px 0",
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 600,
          color: "#888",
          background: "#f5f5f5",
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          cursor: "pointer",
          transition: "background 120ms, color 120ms",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#ffe8e8"; e.currentTarget.style.color = "#c0392b"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#888"; }}
      >
        ↩ Revert selection
      </button>
    </div>
  );
}

// ── Section / root panel ─────────────────────────────────────────────────────

/** Build [{sectionName, categories[]}] from tree edges for section/root nodes. */
function buildGroups(node, edges) {
  if (node.kind === "root") {
    const secEdges = edges.filter(
      (e) => e.sourceNode.id === node.id && e.targetNode.kind === "section"
    );
    return secEdges.map((se) => {
      const catEdges = edges.filter(
        (e) => e.sourceNode.id === se.targetNode.id && e.targetNode.kind === "category"
      );
      return { sectionName: se.targetNode.data.name, categories: catEdges.map((ce) => ce.targetNode) };
    });
  }
  // section node
  const catEdges = edges.filter(
    (e) => e.sourceNode.id === node.id && e.targetNode.kind === "category"
  );
  return [{ sectionName: null, categories: catEdges.map((ce) => ce.targetNode) }];
}

/** Single course row — shared between CategoryPanel and SectionPanel. */
function CourseRow({ courseId, statusMap, nodeById, onStatusChange, onWarn }) {
  const cn = nodeById?.get(courseId);
  const st = statusMap[courseId] ?? (cn?.status === "locked" ? "locked" : "unfulfilled");
  const isCompleted = st === "completed";
  const isLocked = st === "locked";
  const green = "#348162";
  const title = cn?.data?.title ?? "";

  const pendingRef = useRef(false);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = useCallback(() => {
    if (isLocked) {
      if (pendingRef.current) {
        clearTimeout(timerRef.current);
        pendingRef.current = false;
        onStatusChange(courseId, "completed");
      } else {
        pendingRef.current = true;
        onWarn?.();
        timerRef.current = setTimeout(() => { pendingRef.current = false; }, OVERRIDE_WINDOW);
      }
    } else {
      onStatusChange(courseId, isCompleted ? "unfulfilled" : "completed");
    }
  }, [courseId, isCompleted, isLocked, onStatusChange, onWarn]);

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}
      onClick={handleClick}
    >
      <CourseCheckbox completed={isCompleted} disabled={isLocked} />
      <span style={{ fontFamily: FONT, fontSize: 13, lineHeight: "22px", minWidth: 0, flex: 1 }}>
        <span style={{ fontWeight: 700, color: isCompleted ? green : "#111" }}>{courseId}</span>
        {title && (
          <span style={{ fontWeight: 400, color: isCompleted ? green : "#9A9A9A" }}> — {title}</span>
        )}
      </span>
    </div>
  );
}

/**
 * Single slot row with locked-override double-click support.
 * Used in both CategoryPanel (stack variant) and SlotRows.
 */
function StackSlotRow({ slotIndex, chooseN, courseId, isLocked, statusMap, nodeById, onStatusChange, onWarn }) {
  const isAssigned = !!courseId;
  const cn = isAssigned ? nodeById?.get(courseId) : null;
  const isCompleted = isAssigned && statusMap[courseId] === "completed";
  const title = cn?.data?.title ?? "";
  const green = "#348162";

  const pendingRef = useRef(false);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = useCallback(() => {
    if (!isAssigned) return;
    if (isLocked) {
      if (pendingRef.current) {
        clearTimeout(timerRef.current);
        pendingRef.current = false;
        onStatusChange(courseId, "completed");
      } else {
        pendingRef.current = true;
        onWarn?.();
        timerRef.current = setTimeout(() => { pendingRef.current = false; }, OVERRIDE_WINDOW);
      }
    } else {
      onStatusChange(courseId, isCompleted ? "unfulfilled" : "completed");
    }
  }, [courseId, isAssigned, isCompleted, isLocked, onStatusChange, onWarn]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: isAssigned ? "pointer" : "default",
        userSelect: "none",
        opacity: isAssigned ? 1 : 0.45,
      }}
      onClick={handleClick}
    >
      <CourseCheckbox completed={isCompleted} disabled={!isAssigned || isLocked} />
      <span style={{ fontFamily: FONT, fontSize: 13, lineHeight: "22px", minWidth: 0, flex: 1 }}>
        {isAssigned ? (
          <>
            <span style={{ fontWeight: 700, color: isCompleted ? green : "#111" }}>{courseId}</span>
            {title && <span style={{ fontWeight: 400, color: isCompleted ? green : "#9A9A9A" }}> — {title}</span>}
          </>
        ) : (
          <span style={{ fontWeight: 500, color: "#BDBDBD", fontStyle: "italic" }}>
            Slot {slotIndex + 1} — Select Course
          </span>
        )}
      </span>
    </div>
  );
}

/** Slot rows for a stack category — used inside SectionPanel category blocks. */
function SlotRows({ catNode, stackSelections, statusMap, nodeById, onStatusChange, onWarn }) {
  const catId = catNode.id;
  const chooseN = catNode.data.choose_n;
  const catSels = stackSelections[catId] ?? [];

  return Array.from({ length: chooseN }, (_, i) => {
    const courseId = catSels[i] ?? null;
    const isAssigned = !!courseId;
    const slotNode = nodeById?.get(`slot:${catId}:${i}`);
    const isLocked = isAssigned && slotNode?.status === "locked";
    return (
      <StackSlotRow
        key={i}
        slotIndex={i}
        chooseN={chooseN}
        courseId={courseId}
        isLocked={isLocked}
        statusMap={statusMap}
        nodeById={nodeById}
        onStatusChange={onStatusChange}
        onWarn={onWarn}
      />
    );
  });
}

function SectionPanel({ node, statusMap, nodeById, edges, onStatusChange, stackSelections, onWarn }) {
  const pct = node.completionPercentage ?? 0;
  const completed = node.completedCourses ?? 0;
  const total = node.totalCourses ?? 0;
  const groups = buildGroups(node, edges);

  return (
    <div>
      {/* Header */}
      <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
        {node.kind === "root" ? "Degree" : "Section"}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1.2, marginBottom: 6 }}>
        {node.data.name}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 12, color: pct === 100 ? "#348162" : "#888", marginBottom: 6 }}>
        {completed} / {total} courses completed
      </div>
      <ProgressBar pct={pct} />

      <Divider />

      {groups.map((group, gi) => (
        <div key={gi}>
          {/* Section sub-header (root node only — one per section) */}
          {group.sectionName && (
            <div style={{
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 700,
              color: "#555",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 10,
              marginTop: gi > 0 ? 20 : 0,
              paddingBottom: 6,
              borderBottom: "1px solid #f0f0f0",
            }}>
              {group.sectionName}
            </div>
          )}

          {group.categories.map((catNode) => {
            const isStack = catNode.data.choose_n != null;
            const displayName = catNode.data.name.replace(/\s*\(choose\s+\d+\)\s*$/i, "");
            const courses = catNode.data.courses ?? [];
            const chooseN = catNode.data.choose_n;
            const catSels = stackSelections[catNode.id] ?? [];
            const catCompleted = isStack
              ? catSels.filter((cid) => cid && statusMap[cid] === "completed").length
              : courses.filter((cid) => statusMap[cid] === "completed").length;
            const catRequired = isStack ? chooseN : courses.length;

            return (
              <div key={catNode.id} style={{ marginBottom: 14 }}>
                {/* Category subtitle */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                  }}>
                    {displayName}
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: 11, color: "#bbb" }}>
                    {Math.min(catCompleted, catRequired)}/{catRequired}
                  </span>
                </div>

                {/* Course rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#FAFAFA", borderRadius: 8, padding: "10px 12px" }}>
                  {isStack ? (
                    <SlotRows catNode={catNode} stackSelections={stackSelections} statusMap={statusMap} nodeById={nodeById} onStatusChange={onStatusChange} onWarn={onWarn} />
                  ) : (
                    courses.map((cid) => (
                      <CourseRow key={cid} courseId={cid} statusMap={statusMap} nodeById={nodeById} onStatusChange={onStatusChange} onWarn={onWarn} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function NodeDetailPanel({
  node,
  statusMap,
  nodeById,
  onStatusChange,
  onNavigate,
  onClose,
  stackSelections = {},
  onStackSelect,
  onStackRevert,
  allCourses = [],
  edges = [],
  userProfile,
  onProfileUpdate,
}) {
  const panelRef = useRef(null);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [bursts, setBursts] = useState([]);
  const [warnKey, setWarnKey] = useState(0);

  const showWarning = useCallback(() => setWarnKey((k) => k + 1), []);

  const handleStatusChange = useCallback((courseId, newStatus) => {
    if (newStatus === "completed") {
      setBursts((prev) => [...prev, { id: Date.now() + Math.random(), x: mousePos.current.x, y: mousePos.current.y }]);
    }
    onStatusChange(courseId, newStatus);
  }, [onStatusChange]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!node) return null;

  return (
    <div
      ref={panelRef}
      onMouseMove={(e) => { mousePos.current = { x: e.clientX, y: e.clientY }; }}
      onPointerDown={(e) => e.stopPropagation()}
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
      <style>{`
        @keyframes slideIn { from { transform: translateX(48px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes bannerFadeOut { 0% { opacity:0; transform:translateX(-50%) translateY(6px); } 12% { opacity:1; transform:translateX(-50%) translateY(0); } 70% { opacity:1; } 100% { opacity:0; } }
      `}</style>

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
          <CoursePanel node={node} statusMap={statusMap} nodeById={nodeById} onStatusChange={handleStatusChange} onNavigate={onNavigate} userProfile={userProfile} onProfileUpdate={onProfileUpdate} />
        )}
        {node.kind === "category" && (
          <CategoryPanel node={node} statusMap={statusMap} nodeById={nodeById} onStatusChange={handleStatusChange} stackSelections={stackSelections} onWarn={showWarning} />
        )}
        {node.kind === "stack_slot" && !node.assignedCourseId && (
          <StackSlotPanel node={node} statusMap={statusMap} allCourses={allCourses} stackSelections={stackSelections} onStackSelect={onStackSelect} />
        )}
        {node.kind === "stack_slot" && node.assignedCourseId && (
          <AssignedStackSlotPanel node={node} statusMap={statusMap} nodeById={nodeById} onStatusChange={handleStatusChange} onNavigate={onNavigate} onStackRevert={onStackRevert} userProfile={userProfile} onProfileUpdate={onProfileUpdate} />
        )}
        {(node.kind === "section" || node.kind === "root") && (
          <SectionPanel node={node} statusMap={statusMap} nodeById={nodeById} edges={edges} onStatusChange={handleStatusChange} stackSelections={stackSelections} onWarn={showWarning} />
        )}
      </div>

      {bursts.map((b) => (
        <LeafBurst
          key={b.id}
          x={b.x}
          y={b.y}
          onDone={() => setBursts((prev) => prev.filter((p) => p.id !== b.id))}
        />
      ))}

      {/* Locked-override warning banner */}
      {warnKey > 0 && (
        <div
          key={warnKey}
          onAnimationEnd={() => setWarnKey(0)}
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#FFFBEB",
            border: "1px solid #F0C040",
            color: "#856404",
            borderRadius: 10,
            padding: "10px 18px",
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 600,
            boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            animation: `bannerFadeOut ${OVERRIDE_WINDOW + 400}ms ease-out forwards`,
          }}
        >
          ⚠ Click again to override and mark as complete
        </div>
      )}
    </div>
  );
}
