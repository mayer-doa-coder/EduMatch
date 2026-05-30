import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface QueryEntry {
  id: string;
  sql: string;
  params: Record<string, unknown>;
  duration_ms: number;
  ts: number;
  source: string;
  method: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const API      = "http://localhost/EduMatch/backend/query-log.php";
const POLL_MS  = 1500;
const MAX_ROWS = 200;

// App palette (mirrors index.css variables)
const C = {
  primary:  "#1a5f7a",
  secondary:"#57c5b6",
  accent:   "#ff9f29",
  muted:    "#4a6070",
  panelBg:  "#1b2735",
};

// ── SQL keyword highlighter ───────────────────────────────────────────────────
// Uses exec()-based tokenisation so keywords are never double-rendered.

const KW_RE =
  /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|CROSS|ON|AND|OR|NOT|IN|IS|NULL|INSERT|INTO|VALUES|UPDATE|SET|DELETE|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|AS|COUNT|AVG|MIN|MAX|SUM|CASE|WHEN|THEN|ELSE|END|EXISTS|BETWEEN|LIKE|ROUND|CAST)\b/gi;

function HighlightSQL({ sql }: { sql: string }) {
  const tokens: { text: string; kw: boolean }[] = [];
  const re = new RegExp(KW_RE.source, "gi"); // fresh stateful copy
  let cursor = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(sql)) !== null) {
    if (m.index > cursor) {
      tokens.push({ text: sql.slice(cursor, m.index), kw: false });
    }
    tokens.push({ text: m[0], kw: true });
    cursor = m.index + m[0].length;
  }
  if (cursor < sql.length) {
    tokens.push({ text: sql.slice(cursor), kw: false });
  }

  return (
    <span style={{ color: "#c9d8e4", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }}>
      {tokens.map((t, i) =>
        t.kw
          ? <span key={i} style={{ color: C.secondary, fontWeight: 600 }}>{t.text}</span>
          : <span key={i}>{t.text}</span>
      )}
    </span>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function QueryTerminal() {
  const [open, setOpen]       = useState(false);
  const [entries, setEntries] = useState<QueryEntry[]>([]);
  const [lastTs, setLastTs]   = useState(0);
  const [total, setTotal]     = useState(0);
  const [error, setError]     = useState(false);
  const bodyRef               = useRef<HTMLDivElement>(null);

  // ── Polling ──────────────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`${API}?since=${lastTs}`, { cache: "no-store" });
      if (!res.ok) { setError(true); return; }
      setError(false);
      const { queries = [] }: { queries: QueryEntry[] } = await res.json();
      if (!queries.length) return;
      setLastTs(queries[queries.length - 1].ts);
      setTotal(n => n + queries.length);
      setEntries(prev => [...prev, ...queries].slice(-MAX_ROWS));
    } catch {
      setError(true);
    }
  }, [lastTs]);

  useEffect(() => {
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [entries, open]);

  async function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(API, { method: "DELETE" });
    setEntries([]);
    setLastTs(0);
    setTotal(0);
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Expanded panel ─────────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            width: 540,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            border: `1px solid ${C.primary}55`,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, #1e7a8c 100%)`,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
                SQL Terminal
              </span>
              <Pill>{total} queries</Pill>
              {error && <Pill warn>⚠ backend unreachable</Pill>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <HeaderBtn onClick={handleClear}>Clear</HeaderBtn>
              <HeaderBtn onClick={() => setOpen(false)}>✕</HeaderBtn>
            </div>
          </div>

          {/* Body — stacked rows, each entry is its own block */}
          <div
            ref={bodyRef}
            style={{
              background: C.panelBg,
              height: 360,
              overflowY: "auto",
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              fontSize: 11.5,
            }}
          >
            {entries.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  color: C.muted,
                }}
              >
                <span style={{ fontSize: 26 }}>⬡</span>
                <span>Trigger a backend action to see queries here</span>
              </div>
            ) : (
              entries.map((entry, i) => {
                const hasParams = Object.keys(entry.params).length > 0;
                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: "7px 12px 8px",
                      borderBottom: "1px solid #ffffff0a",
                      background: i % 2 === 0 ? "transparent" : "#ffffff04",
                    }}
                  >
                    {/* ── Meta line: index · source · method · duration ── */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                        fontFamily: "'Segoe UI', system-ui, sans-serif",
                        fontSize: 10.5,
                      }}
                    >
                      <span style={{ color: C.muted, minWidth: 18, textAlign: "right" }}>
                        {i + 1}
                      </span>
                      <span style={{ color: C.secondary, fontWeight: 600 }}>
                        {entry.source}
                      </span>
                      <span
                        style={{
                          color: C.muted,
                          background: "#ffffff0a",
                          borderRadius: 3,
                          padding: "0 5px",
                        }}
                      >
                        {entry.method}
                      </span>
                      {/* Pushes duration to the right */}
                      <span style={{ flex: 1 }} />
                      <span style={{ color: C.accent, fontVariantNumeric: "tabular-nums" }}>
                        {entry.duration_ms.toFixed(2)} ms
                      </span>
                    </div>

                    {/* ── SQL block — full width, no competing columns ── */}
                    <div style={{ paddingLeft: 26 }}>
                      <HighlightSQL sql={entry.sql} />
                      {hasParams && (
                        <div style={{ color: C.muted, marginTop: 3, fontSize: 10.5 }}>
                          {JSON.stringify(entry.params)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              background: "#15202d",
              padding: "5px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #ffffff08",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              fontSize: 10.5,
              color: C.muted,
            }}
          >
            <span>polling every {POLL_MS / 1000}s · dev only</span>
            {entries.length > 0 && (
              <span>
                last&nbsp;
                <span style={{ color: C.accent }}>
                  {entries[entries.length - 1].duration_ms.toFixed(2)} ms
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Floating trigger button ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="SQL Terminal"
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.primary} 0%, #1e7a8c 100%)`,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(26,95,122,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          position: "relative",
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 26px rgba(26,95,122,0.6)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,95,122,0.45)";
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
        </svg>
        {total > 0 && (
          <span
            style={{
              position: "absolute",
              top: 1,
              right: 1,
              background: C.accent,
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 10,
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              fontFamily: "system-ui, sans-serif",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>
    </div>
  );
}

// ── Small shared sub-components ───────────────────────────────────────────────

function Pill({ children, warn }: { children: React.ReactNode; warn?: boolean }) {
  return (
    <span
      style={{
        background: warn ? "rgba(220,53,69,0.25)" : "rgba(255,255,255,0.15)",
        color: warn ? "#ffb3b3" : "#fff",
        fontSize: 11,
        borderRadius: 20,
        padding: "1px 9px",
        fontWeight: 500,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function HeaderBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.15)",
        border: "none",
        color: "#fff",
        borderRadius: 6,
        padding: "3px 10px",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        transition: "background 0.15s",
        minWidth: 28,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.27)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
    >
      {children}
    </button>
  );
}
