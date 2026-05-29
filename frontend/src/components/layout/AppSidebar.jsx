import { useEffect, useMemo, useState } from "react";
import { fetchMajors } from "../../services/majorsApi.js";

const FONT = "Inter, system-ui, var(--font-ui), sans-serif";

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon({ size = 16, color = "#9A9A9A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke={color} strokeWidth="1.5" />
      <path d="M11 11l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon({ size = 14, color = "#9A9A9A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1.5 7L7 2L12.5 7V12.5H9V9H5V12.5H1.5V7Z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ size = 14, color = "#9A9A9A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1v12M1 7h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TreeLeafIcon({ size = 14, color = "#9A9A9A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1C4 1 1 4 1 7c0 3 2.5 5 5 5a5 5 0 000-10z" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M7 12V7M7 7C7 5 8.5 3.5 11 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CollapseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="1" width="16" height="16" rx="3" stroke="#C0C0C0" strokeWidth="1.2" />
      <line x1="6" y1="1" x2="6" y2="17" stroke="#C0C0C0" strokeWidth="1.2" />
      <path d="M9 6l-2 3 2 3" stroke="#C0C0C0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="1" width="16" height="16" rx="3" stroke="#C0C0C0" strokeWidth="1.2" />
      <line x1="6" y1="1" x2="6" y2="17" stroke="#C0C0C0" strokeWidth="1.2" />
      <path d="M9 6l2 3-2 3" stroke="#C0C0C0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

function SectionHeader({ label }) {
  return (
    <div style={{
      padding: "0 4px",
      marginBottom: 4,
      fontFamily: FONT,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "#BBBBBB",
    }}>
      {label}
    </div>
  );
}

function SidebarRow({ icon, label, subtitle, active, onClick, title }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      aria-current={active ? "page" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "none",
        background: active
          ? "rgba(53, 129, 98, 0.10)"
          : hovered
          ? "rgba(0,0,0,0.035)"
          : "transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 100ms",
      }}
    >
      {icon && (
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {icon}
        </span>
      )}
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{
          display: "block",
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: active ? 600 : 400,
          color: active ? "#358162" : "#3A3A3A",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: 1.3,
        }}>
          {label}
        </span>
        {subtitle && (
          <span style={{
            display: "block",
            fontFamily: FONT,
            fontSize: 11,
            color: "#AAAAAA",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 1,
          }}>
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}

function Divider() {
  return <div style={{ width: "100%", height: 1, background: "#EBEBEB", margin: "8px 0" }} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AppSidebar({
  forests = [],
  allTrees = [],
  recents = [],
  activeTreeId,
  activeMajorId,
  onHome,
  onOpenTree,
  onOpenMajor,
  onNewTree,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [allMajors, setAllMajors] = useState([]);
  const [majorsLoading, setMajorsLoading] = useState(true);
  const [majorsError, setMajorsError] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    fetchMajors()
      .then((data) => {
        if (Array.isArray(data)) setAllMajors(data);
        setMajorsLoading(false);
      })
      .catch(() => {
        setMajorsError(true);
        setMajorsLoading(false);
      });
  }, []);

  const query = localSearch.trim().toLowerCase();
  const hasQuery = query.length > 0;

  const majorResults = useMemo(() => {
    if (!hasQuery) return [];
    return allMajors
      .filter(m => m.name.toLowerCase().includes(query) || m.major_id.toLowerCase().includes(query))
      .slice(0, 10);
  }, [allMajors, query, hasQuery]);

  const treeResults = useMemo(() => {
    if (!hasQuery) return [];
    const combined = allTrees.length > 0 ? allTrees : [...forests, ...recents];
    const seen = new Set();
    return combined.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return t.name.toLowerCase().includes(query) || (t.major && t.major.toLowerCase().includes(query));
    });
  }, [allTrees, forests, recents, query, hasQuery]);

  // Exclude from recents any tree already shown in My Trees
  const forestIds = useMemo(() => new Set(forests.map(t => t.id)), [forests]);
  const dedupedRecents = useMemo(() => recents.filter(t => !forestIds.has(t.id)), [recents, forestIds]);

  const isHome = !activeTreeId && !activeMajorId;

  if (collapsed) {
    return (
      <aside style={{
        width: 52,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#FAFAFA",
        borderRight: "1px solid #EAEAEA",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 16,
        gap: 12,
      }}>
        <img src="/images/LOGO.png" alt="TreeReq" style={{ width: 28, height: 28, objectFit: "contain" }} />
        <div style={{ width: "100%", height: 1, background: "#EAEAEA" }} />
        <button
          type="button"
          aria-label="Expand sidebar"
          onClick={() => setCollapsed(false)}
          style={{ border: "none", background: "transparent", cursor: "pointer", padding: 6, borderRadius: 6 }}
        >
          <ExpandIcon />
        </button>
      </aside>
    );
  }

  return (
    <aside style={{
      width: 280,
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "#FAFAFA",
      borderRight: "1px solid #EAEAEA",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        height: 58,
        padding: "0 16px",
        borderBottom: "1px solid #EAEAEA",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <img src="/images/LOGO.png" alt="TreeReq" style={{ height: 30, objectFit: "contain" }} />
        <button
          type="button"
          aria-label="Collapse sidebar"
          onClick={() => setCollapsed(true)}
          style={{ border: "none", background: "transparent", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}
        >
          <CollapseIcon />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "12px 12px 8px", flexShrink: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 8,
          background: "#F0F0F0",
          border: "1px solid transparent",
        }}>
          <SearchIcon />
          <input
            type="search"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Search majors & trees…"
            aria-label="Search majors and trees"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontFamily: FONT,
              fontSize: 13,
              color: "#333",
            }}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, color: "#AAA", fontSize: 14, lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 24px" }}>

        {hasQuery ? (
          /* ── Search results ── */
          <div>
            <div style={{ marginBottom: 16 }}>
              <SectionHeader label="Majors" />
              {majorsLoading ? (
                <p style={{ fontFamily: FONT, fontSize: 13, color: "#AAAAAA", padding: "4px 4px", margin: 0 }}>
                  Loading…
                </p>
              ) : majorsError ? (
                <p style={{ fontFamily: FONT, fontSize: 13, color: "#AAAAAA", padding: "4px 4px", margin: 0 }}>
                  Could not load majors
                </p>
              ) : majorResults.length > 0 ? (
                majorResults.map(m => (
                  <SidebarRow
                    key={m.major_id}
                    icon={<TreeLeafIcon color={activeMajorId === m.major_id ? "#358162" : "#9A9A9A"} />}
                    label={m.name}
                    active={activeMajorId === m.major_id}
                    onClick={() => onOpenMajor?.(m.major_id)}
                  />
                ))
              ) : (
                <p style={{ fontFamily: FONT, fontSize: 13, color: "#BBBBBB", padding: "4px 4px", margin: 0 }}>
                  No majors match "{localSearch}"
                </p>
              )}
            </div>

            {treeResults.length > 0 && (
              <div>
                <SectionHeader label="My Trees" />
                {treeResults.map(t => {
                  const isActive = t.majorId
                    ? activeMajorId === t.majorId
                    : activeTreeId === t.id;
                  return (
                    <SidebarRow
                      key={t.id}
                      icon={<TreeLeafIcon color={isActive ? "#358162" : "#9A9A9A"} />}
                      label={t.name}
                      subtitle={t.major}
                      active={isActive}
                      onClick={() => t.majorId ? onOpenMajor?.(t.majorId) : onOpenTree?.(t.id)}
                    />
                  );
                })}
              </div>
            )}

            {!majorsLoading && !majorsError && majorResults.length === 0 && treeResults.length === 0 && (
              <p style={{ fontFamily: FONT, fontSize: 13, color: "#AAAAAA", padding: "8px 4px", margin: 0 }}>
                No results for "{localSearch}"
              </p>
            )}
          </div>
        ) : (
          /* ── Normal navigation ── */
          <>
            <div style={{ marginBottom: 4 }}>
              <SidebarRow
                icon={<HomeIcon color={isHome ? "#358162" : "#9A9A9A"} />}
                label="Home"
                active={isHome}
                onClick={onHome}
              />
              <SidebarRow
                icon={<PlusIcon />}
                label="New Tree"
                onClick={onNewTree}
              />
            </div>

            <Divider />

            <div style={{ marginBottom: 20 }}>
              <SectionHeader label="My Trees" />
              {forests.length === 0 ? (
                <p style={{ fontFamily: FONT, fontSize: 13, color: "#BBBBBB", padding: "4px 4px", margin: 0 }}>
                  No saved trees yet.
                </p>
              ) : (
                forests.map(tree => {
                  const isActive = tree.majorId
                    ? activeMajorId === tree.majorId
                    : activeTreeId === tree.id;
                  return (
                    <SidebarRow
                      key={tree.id}
                      icon={<TreeLeafIcon color={isActive ? "#358162" : "#9A9A9A"} />}
                      label={tree.name}
                      subtitle={tree.major}
                      active={isActive}
                      onClick={() => tree.majorId ? onOpenMajor?.(tree.majorId) : onOpenTree?.(tree.id)}
                    />
                  );
                })
              )}
            </div>

            {dedupedRecents.length > 0 && (
              <>
                <Divider />
                <div>
                  <SectionHeader label="Recent" />
                  {dedupedRecents.map(tree => (
                    <SidebarRow
                      key={tree.id}
                      icon={<TreeLeafIcon color={activeTreeId === tree.id ? "#358162" : "#9A9A9A"} />}
                      label={tree.name}
                      subtitle={tree.major}
                      active={activeTreeId === tree.id}
                      onClick={() => onOpenTree?.(tree.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
