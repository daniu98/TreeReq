import { useEffect, useMemo, useRef } from "react";

const text = { color: "#7C7C7C", fontSize: 16, fontFamily: "var(--font-ui)", fontWeight: 400 };
const sectionLabel = { color: "#9A9A9A", fontSize: 16, fontFamily: "var(--font-section)", fontWeight: 400 };

function truncateLabel(name, maxLen = 28) {
  if (!name || name.length <= maxLen) return name;
  return `${name.slice(0, maxLen - 3)}...`;
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="#7C7C7C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="#7C7C7C" strokeWidth="2" />
      <path d="M16 16l5 5" stroke="#7C7C7C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2L16 10h-3v3h6l-4 9h-6l-4-9h6v-3H8L12 2z" fill="#7C7C7C" />
    </svg>
  );
}

function NavRow({ icon, label, active, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      aria-current={active ? "page" : undefined}
      style={{
        alignSelf: "stretch",
        padding: 8,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 15,
        border: "none",
        background: active ? "rgba(133, 177, 16, 0.12)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {icon ?? <span style={{ width: 24, flexShrink: 0 }} aria-hidden />}
        <span style={{ ...text, maxWidth: 203, flex: 1, color: active ? "#358162" : text.color }}>{label}</span>
      </div>
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: "100%",
        height: 0,
        borderTop: "1px solid #D9D9D9",
      }}
    />
  );
}

export default function AppSidebar({
  forests = [],
  recents = [],
  activeTreeId,
  searchQuery = "",
  searchOpen = false,
  onSearchQueryChange,
  onSearchOpenChange,
  onOpenTree,
  onNewTree,
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const showSearchResults = searchQuery.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!showSearchResults) return [];
    const q = searchQuery.trim().toLowerCase();
    const seen = new Set();
    const combined = [...forests, ...recents];
    return combined.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return t.name.toLowerCase().includes(q) || (t.major && t.major.toLowerCase().includes(q));
    });
  }, [forests, recents, searchQuery, showSearchResults]);

  const filteredForests = useMemo(() => {
    if (!searchQuery.trim()) return forests;
    const q = searchQuery.trim().toLowerCase();
    return forests.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.major && t.major.toLowerCase().includes(q))
    );
  }, [forests, searchQuery]);

  const filteredRecents = useMemo(() => {
    if (!searchQuery.trim()) return recents;
    const q = searchQuery.trim().toLowerCase();
    return recents.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.major && t.major.toLowerCase().includes(q))
    );
  }, [recents, searchQuery]);

  return (
    <aside
      style={{
        width: 325,
        flexShrink: 0,
        minHeight: "100vh",
        background: "#fff",
        borderRight: "1px solid #EAEAEA",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 65,
          padding: "15px 40px",
          borderBottom: "1px solid #D9D9D9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            background: "#85B110",
            borderRadius: 9999,
          }}
          aria-hidden
        />
        <button
          type="button"
          aria-label="Toggle layout"
          style={{
            width: 30,
            height: 30,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              border: "2px solid #9A9A9A",
              borderRadius: 2,
            }}
            aria-hidden
          />
        </button>
      </div>

      <div
        style={{
          padding: "36px 40px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 25,
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <NavRow icon={<PlusIcon />} label="New tree" onClick={onNewTree} />
          <NavRow
            icon={<SearchIcon />}
            label="Search"
            active={searchOpen}
            onClick={() => onSearchOpenChange?.(!searchOpen)}
          />
          {searchOpen ? (
            <div style={{ paddingLeft: 8, paddingRight: 8 }}>
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange?.(e.target.value)}
                placeholder="Search trees..."
                aria-label="Search trees"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #D9D9D9",
                  fontSize: 14,
                  fontFamily: "var(--font-ui)",
                  outline: "none",
                }}
              />
            </div>
          ) : null}
        </div>

        {showSearchResults ? (
          <>
            <Divider />
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div style={{ paddingLeft: 8, paddingRight: 8 }}>
                <span style={sectionLabel}>Results</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {searchResults.length === 0 ? (
                  <p style={{ ...text, padding: "0 8px", fontSize: 14, margin: 0 }}>No trees found.</p>
                ) : (
                  searchResults.map((tree) => (
                    <NavRow
                      key={tree.id}
                      icon={<TreeIcon />}
                      label={truncateLabel(tree.name)}
                      title={tree.name}
                      active={activeTreeId === tree.id}
                      onClick={() => onOpenTree?.(tree.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        ) : null}

        <Divider />

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ paddingLeft: 8, paddingRight: 8 }}>
            <span style={sectionLabel}>Forests</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {filteredForests.length === 0 ? (
              <p style={{ ...text, padding: "0 8px", fontSize: 14, margin: 0 }}>No forests match.</p>
            ) : (
              filteredForests.map((tree) => (
                <NavRow
                  key={tree.id}
                  icon={<TreeIcon />}
                  label={tree.name}
                  active={activeTreeId === tree.id}
                  onClick={() => onOpenTree?.(tree.id)}
                />
              ))
            )}
          </div>
        </div>

        <Divider />

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ paddingLeft: 8, paddingRight: 8 }}>
            <span style={sectionLabel}>Recents</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {filteredRecents.length === 0 ? (
              <p style={{ ...text, padding: "0 8px", fontSize: 14, margin: 0 }}>No recent trees.</p>
            ) : (
              filteredRecents.map((tree) => (
                <NavRow
                  key={tree.id}
                  icon={null}
                  label={truncateLabel(tree.name)}
                  title={tree.name}
                  active={activeTreeId === tree.id}
                  onClick={() => onOpenTree?.(tree.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
