import { useState, useEffect, useRef } from "react";

export type ComboboxOption = {
  value: string | number;
  label: string;
  description?: string;
};

type Props = {
  value: string | number | "";
  onChange: (value: string | number | "") => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  accent?: string;
};

const ANIM = `@keyframes cbOpen{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`;

function MatchText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(236,9,39,.13)", color: "#c0001a", fontWeight: 700, borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Seleccionar…",
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados",
  disabled = false,
  accent = "#ec0927",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Click-outside close
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search + reset highlight on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 20);
      setHighlighted(filtered.findIndex((o) => o.value === value) || 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    const el = listRef.current?.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function select(opt: ComboboxOption) {
    onChange(opt.value);
    close();
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (["Enter", " ", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
    }
  }

  function handleDropdownKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "Escape":
        close();
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlighted]) select(filtered[highlighted]);
        break;
      case "Tab":
        close();
        break;
    }
  }

  const ringColor = `${accent}28`;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <style>{ANIM}</style>

      {/* ── Trigger ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".5rem",
          padding: ".58rem .85rem",
          background: disabled ? "#f8f9fa" : "#fff",
          border: `1.5px solid ${open ? accent : "#e2e8f0"}`,
          borderRadius: 10,
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          fontSize: ".87rem",
          color: selected ? "#111" : "#a0adb8",
          fontWeight: selected ? 500 : 400,
          transition: "border-color .15s, box-shadow .15s",
          boxShadow: open ? `0 0 0 3px ${ringColor}` : "none",
          textAlign: "left",
          userSelect: "none",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {selected ? selected.label : placeholder}
        </span>
        {selected && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(""); setQuery(""); }}
            title="Limpiar"
            style={{
              width: 16, height: 16, borderRadius: "50%", background: "#e5e7eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".65rem", color: "#6c757d", flexShrink: 0,
              cursor: "pointer", lineHeight: 1,
            }}
          >
            ×
          </span>
        )}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={open ? accent : "#a0adb8"} strokeWidth="2.5"
          style={{ flexShrink: 0, transition: "transform .2s, stroke .15s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          onKeyDown={handleDropdownKeyDown}
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 300,
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 13,
            boxShadow: "0 10px 40px rgba(0,0,0,.13), 0 2px 10px rgba(0,0,0,.07)",
            overflow: "hidden",
            animation: "cbOpen .14s cubic-bezier(.4,0,.2,1) both",
          }}
        >
          {/* Search bar */}
          <div style={{ padding: ".5rem .5rem .4rem", borderBottom: "1px solid #f1f3f5" }}>
            <div style={{ position: "relative" }}>
              <svg
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#9ca3af" strokeWidth="2.5"
                style={{ position: "absolute", left: ".65rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
                placeholder={searchPlaceholder}
                style={{
                  width: "100%", padding: ".42rem .65rem .42rem 2rem",
                  border: "1.5px solid #e2e8f0", borderRadius: 8,
                  fontSize: ".83rem", fontFamily: "inherit", outline: "none",
                  background: "#f8fafc", color: "#111",
                  transition: "border-color .15s, box-shadow .15s",
                  paddingRight: query ? "2rem" : ".65rem",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = accent;
                  e.target.style.boxShadow = `0 0 0 2px ${ringColor}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              {query && (
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => { e.preventDefault(); setQuery(""); setHighlighted(0); searchRef.current?.focus(); }}
                  style={{
                    position: "absolute", right: ".5rem", top: "50%", transform: "translateY(-50%)",
                    width: 16, height: 16, background: "#e5e7eb", border: "none",
                    borderRadius: "50%", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: ".65rem", color: "#6c757d", lineHeight: 1, padding: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {query && (
              <p style={{ fontSize: ".72rem", color: "#9ca3af", marginTop: ".3rem", paddingLeft: ".2rem" }}>
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Options */}
          <div
            ref={listRef}
            role="listbox"
            style={{ maxHeight: 216, overflowY: "auto", padding: ".3rem" }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: "1.25rem .5rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", marginBottom: ".35rem" }}>🔍</div>
                <p style={{ fontSize: ".83rem", color: "#9ca3af" }}>{emptyText}</p>
              </div>
            ) : (
              filtered.map((opt, i) => {
                const isSel = opt.value === value;
                const isHl = i === highlighted;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSel}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(opt)}
                    onMouseEnter={() => setHighlighted(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: ".65rem",
                      padding: ".48rem .65rem", borderRadius: 8, cursor: "pointer",
                      background: isHl ? (isSel ? `${accent}18` : "#f8f9fa") : isSel ? `${accent}0e` : "transparent",
                      transition: "background .1s",
                    }}
                  >
                    {/* Indicator */}
                    <div style={{
                      width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${isSel ? accent : "#d1d5db"}`,
                      background: isSel ? accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .14s",
                    }}>
                      {isSel && (
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 5 4 7.5 8.5 2.5" />
                        </svg>
                      )}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: ".87rem",
                        color: isSel ? accent : isHl ? "#111" : "#374151",
                        fontWeight: isSel ? 600 : 400,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        <MatchText text={opt.label} query={query} />
                      </div>
                      {opt.description && (
                        <div style={{ fontSize: ".74rem", color: "#9ca3af", marginTop: ".05rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
