import { useState, useEffect, useRef, Fragment } from "react";
import {
  LayoutDashboard, IceCream2, Boxes, Users, ShieldCheck,
  LogOut, Search, Bell, ChevronRight, Menu, X, Tag, FlaskConical,
} from "lucide-react";
import { api } from "../../lib/api";
import { Combobox } from "../ui/Combobox";
import {
  GlassDialog,
  GlassField,
  GlassActions,
  SuccessModal,
  ErrorModal,
} from "../ui/Modal";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = {
  dashboard: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  catalog: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  system: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </svg>
  ),
  products: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  inventory: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  users: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  roles: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  chevron: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  userCircle: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  logout: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  profit: (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <text x="12" y="18" textAnchor="middle" fontSize="19" fontWeight="700" fill="currentColor" fontFamily="system-ui, sans-serif">Q</text>
    </svg>
  ),
  clock: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  chart: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  prev: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  next: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  bell: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  chevronRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

// ─── Nav structure ─────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    section: "GENERAL",
    items: [
      { id: "dashboard", label: "Inicio",     icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    section: "HELADERÍA",
    items: [
      { id: "products",     label: "Productos",    icon: <IceCream2 size={17} /> },
      { id: "categories",   label: "Categorías",  icon: <Tag size={17} /> },
      { id: "ingredients",  label: "Ingredientes", icon: <FlaskConical size={17} /> },
      { id: "inventory",    label: "Inventario",   icon: <Boxes size={17} /> },
    ],
  },
  {
    section: "PALETERÍA",
    items: [
      { id: "pal-products",   label: "Paletas",              icon: <IceCream2 size={17} /> },
      { id: "pal-categories", label: "Categorías Paletería", icon: <Tag size={17} /> },
    ],
  },
  {
    section: "SISTEMA",
    items: [
      { id: "users",     label: "Usuarios",   icon: <Users size={17} /> },
      { id: "roles",     label: "Roles",      icon: <ShieldCheck size={17} /> },
    ],
  },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes navDropIn  { from { opacity:0; transform:translateY(-6px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
  @keyframes pageEnter  { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  @keyframes slideIn    { from { width:0 } to { width:70% } }
  ::-webkit-scrollbar   { width:5px }
  ::-webkit-scrollbar-thumb { background:#3a0010; border-radius:99px }
`;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return mobile;
}

function GlassNavbar({
  active,
  onChange,
  userName,
  collapsed,
  mobile = false,
  open = false,
}: {
  active: string;
  onChange: (id: string) => void;
  userName: string;
  collapsed: boolean;
  mobile?: boolean;
  open?: boolean;
}) {
  const W = collapsed ? 64 : 252;

  return (
    <aside style={{
      width: W,
      minHeight: "100vh",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "radial-gradient(ellipse at 30% 10%, #8b0000 0%, #4a0008 50%, #1a0003 100%)",
      borderRight: "1px solid rgba(255,80,80,.08)",
      boxShadow: "4px 0 24px rgba(0,0,0,.4)",
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: "width .22s cubic-bezier(.4,0,.2,1)",
      overflow: "hidden",
      position: "sticky",
      top: 0,
      alignSelf: "flex-start",
      ...(mobile ? {
        position: "fixed", left: 0, top: 0, height: "100dvh", zIndex: 300,
        transform: open ? "translateX(0)" : "translateX(-105%)",
        transition: "transform .25s cubic-bezier(.4,0,.2,1)",
        boxShadow: open ? "4px 0 24px rgba(0,0,0,.4)" : "none",
      } : {}),
    }}>

      {/* ── Brand ── */}
      <div style={{
        height: 68, padding: "0 1rem", flexShrink: 0,
        display: "flex", alignItems: "center", gap: ".7rem",
        justifyContent: collapsed ? "center" : "flex-start",
        borderBottom: "1px solid rgba(255,255,255,.07)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: "rgba(255,255,255,.12)",
          border: "1.5px solid rgba(255,255,255,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 18px rgba(255,50,50,.25)",
        }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem", fontFamily: "Georgia, serif" }}>S</span>
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 700, fontSize: ".96rem", color: "#fff", letterSpacing: "-.2px", lineHeight: 1 }}>SARITA</div>
            <div style={{ fontSize: ".58rem", color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: "2.5px", marginTop: ".22rem" }}>
              Panel Admin
            </div>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: ".5rem .6rem", overflowY: "auto", overflowX: "hidden" }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.section} style={{ marginBottom: ".25rem" }}>
            {/* Section label */}
            {!collapsed ? (
              <p style={{
                fontSize: ".62rem", fontWeight: 700,
                color: "rgba(255,255,255,.28)",
                textTransform: "uppercase", letterSpacing: "1.4px",
                padding: gi === 0 ? ".4rem .5rem .2rem" : ".9rem .5rem .2rem",
              }}>
                {group.section}
              </p>
            ) : gi > 0 && (
              <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: ".7rem .3rem" }} />
            )}

            {group.items.map((item) => {
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  onClick={() => onChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: ".65rem",
                    padding: collapsed ? ".7rem 0" : ".62rem .65rem",
                    justifyContent: collapsed ? "center" : "flex-start",
                    border: "none", borderRadius: 9,
                    cursor: "pointer", fontFamily: "inherit",
                    background: isActive ? "rgba(255,255,255,.14)" : "transparent",
                    borderLeft: isActive ? "3px solid rgba(255,255,255,.6)" : "3px solid transparent",
                    transition: "all .15s", textAlign: "left",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,.07)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ display: "flex", color: isActive ? "#fff" : "rgba(255,255,255,.48)", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span style={{ fontSize: ".84rem", fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : "rgba(255,255,255,.6)", flex: 1 }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Cerrar sesión ── */}
      <div style={{ padding: ".6rem .6rem .9rem", borderTop: "1px solid rgba(255,255,255,.07)" }}>
        <button
          onClick={async () => { await api.logout(); window.location.href = "/"; }}
          title={collapsed ? "Cerrar sesión" : undefined}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            gap: ".65rem",
            padding: collapsed ? ".7rem 0" : ".62rem .65rem",
            justifyContent: collapsed ? "center" : "flex-start",
            border: "none", borderRadius: 9,
            cursor: "pointer", fontFamily: "inherit",
            background: "transparent",
            transition: "background .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,80,80,.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={17} color="rgba(255,180,180,.7)" />
          {!collapsed && (
            <span style={{ fontSize: ".84rem", fontWeight: 600, color: "rgba(255,200,200,.75)", letterSpacing: ".3px" }}>
              CERRAR SESIÓN
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({
  active,
  userName,
  onToggle,
}: {
  active: string;
  userName: string;
  onToggle: () => void;
}) {
  const [userOpen, setUserOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const sectionLabel = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? "Inicio";

  return (
    <header style={{
      height: 60, background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      boxShadow: "0 1px 4px rgba(0,0,0,.05)",
      display: "flex", alignItems: "center",
      padding: "0 1.25rem", gap: "1rem",
      fontFamily: "'Inter', system-ui, sans-serif",
      flexShrink: 0,
    }}>

      {/* ── Hamburger ── */}
      <button
        onClick={onToggle}
        style={{
          width: 36, height: 36, border: "1.5px solid #e5e7eb",
          borderRadius: 8, background: "#f9fafb",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#374151", flexShrink: 0,
          transition: "all .15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ec0927"; e.currentTarget.style.color = "#ec0927"; e.currentTarget.style.background = "#fff5f5"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#f9fafb"; }}
      >
        <Menu size={18} />
      </button>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
        <span className="hide-mobile" style={{ fontSize: ".82rem", color: "#9ca3af" }}>Inicio</span>
        <ChevronRight className="hide-mobile" size={13} color="#d1d5db" />
        <span style={{ fontSize: ".82rem", fontWeight: 600, color: "#111827" }}>{sectionLabel}</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 24, background: "#e5e7eb", flexShrink: 0 }} />

      {/* ── MI CUENTA ── */}
      <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setUserOpen(!userOpen)}
          style={{
            display: "flex", alignItems: "center", gap: ".55rem",
            padding: ".32rem .65rem .32rem .4rem",
            border: "1.5px solid #e5e7eb", borderRadius: 10,
            background: userOpen ? "#f3f4f6" : "#fff",
            cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; }}
          onMouseLeave={(e) => { if (!userOpen) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e7eb"; } }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #ec0927, #7a0000)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: ".78rem" }}>{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div style={{ textAlign: "left" }}>
            <div className="hide-mobile" style={{ fontSize: ".6rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".8px", lineHeight: 1 }}>Mi cuenta</div>
            <div style={{ fontSize: ".82rem", fontWeight: 600, color: "#111827", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.4 }}>{userName}</div>
          </div>
          <ChevronRight size={14} color="#9ca3af" style={{ transform: userOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
        </button>

        {userOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200 }}>
            <div style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
              boxShadow: "0 10px 40px rgba(0,0,0,.12)", padding: ".4rem", minWidth: 200,
              animation: "navDropIn .15s cubic-bezier(.4,0,.2,1)",
            }}>
              <div style={{ padding: ".55rem .75rem .65rem", borderBottom: "1px solid #f3f4f6", marginBottom: ".3rem" }}>
                <p style={{ fontSize: ".67rem", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px" }}>Sesión activa</p>
                <p style={{ fontSize: ".88rem", color: "#111827", fontWeight: 600, marginTop: ".2rem" }}>{userName}</p>
              </div>
              <button
                onClick={async () => { await api.logout(); window.location.href = "/"; }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: ".6rem",
                  padding: ".55rem .7rem", border: "none", borderRadius: 8,
                  background: "transparent", cursor: "pointer", fontFamily: "inherit",
                  color: "#dc2626", fontSize: ".84rem", fontWeight: 500, transition: "background .12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fff5f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <LogOut size={15} /> Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DOW_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function Calendar() {
  const today = new Date();
  const [viewM, setViewM] = useState(today.getMonth());
  const [viewY, setViewY] = useState(today.getFullYear());
  const [sel, setSel] = useState<number | null>(today.getDate());

  function prevMonth() {
    if (viewM === 0) {
      setViewM(11);
      setViewY((y) => y - 1);
    } else setViewM((m) => m - 1);
  }
  function nextMonth() {
    if (viewM === 11) {
      setViewM(0);
      setViewY((y) => y + 1);
    } else setViewM((m) => m + 1);
  }

  const startOffset = (new Date(viewY, viewM, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number) =>
    d === today.getDate() &&
    viewM === today.getMonth() &&
    viewY === today.getFullYear();

  const navBtn: React.CSSProperties = {
    width: 30, height: 30, borderRadius: "50%",
    border: "1.5px solid #e9ecef", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#6c757d", flexShrink: 0,
  };

  return (
    <div>
      {/* ── Mes / navegación ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
        <button onClick={prevMonth} style={navBtn}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#ffecee"; e.currentTarget.style.borderColor = "#ec0927"; e.currentTarget.style.color = "#ec0927"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e9ecef"; e.currentTarget.style.color = "#6c757d"; }}
        >{Ico.prev}</button>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1d23", margin: 0 }}>{MONTHS_ES[viewM]}</p>
          <p style={{ fontSize: ".72rem", color: "#b0b8c4", margin: ".05rem 0 0" }}>{viewY}</p>
        </div>

        <button onClick={nextMonth} style={navBtn}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#ffecee"; e.currentTarget.style.borderColor = "#ec0927"; e.currentTarget.style.color = "#ec0927"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e9ecef"; e.currentTarget.style.color = "#6c757d"; }}
        >{Ico.next}</button>
      </div>

      {/* ── Cabecera días ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: ".3rem" }}>
        {DOW_ES.map((d, i) => (
          <div key={d} style={{ textAlign: "center", fontSize: ".65rem", fontWeight: 700, padding: ".25rem 0", textTransform: "uppercase", letterSpacing: ".4px", color: i >= 5 ? "#ec0927" : "#b0b8c4" }}>
            {d}
          </div>
        ))}
      </div>

      {/* ── Días ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{ aspectRatio: "1" }} />;
          const isT = isToday(d);
          const isSel = sel === d && !isT;
          const isWknd = i % 7 >= 5;
          return (
            <button
              key={i}
              onClick={() => setSel(d)}
              style={{
                aspectRatio: "1",
                border: isSel ? "1.5px solid #ec0927" : "1.5px solid transparent",
                borderRadius: "50%",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: ".82rem",
                fontWeight: isT || isSel ? 700 : 400,
                color: isT ? "#fff" : isSel ? "#ec0927" : isWknd ? "#ec0927" : "#374151",
                background: isT ? "#ec0927" : isSel ? "#fff5f6" : "transparent",
                boxShadow: isT ? "0 3px 10px rgba(236,9,39,.3)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .12s",
                opacity: isWknd && !isT ? .7 : 1,
              }}
              onMouseEnter={(e) => { if (!isT) { e.currentTarget.style.background = "#ffecee"; e.currentTarget.style.borderColor = "#f9a8b4"; } }}
              onMouseLeave={(e) => { if (!isT) { e.currentTarget.style.background = isSel ? "#fff5f6" : "transparent"; e.currentTarget.style.borderColor = isSel ? "#ec0927" : "transparent"; } }}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({
  label,
  value,
  subtitle,
  color,
  rgb,
  icon,
}: {
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  rgb: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: ".85rem 1rem",
        borderRadius: 12,
        background: "#fff",
        border: "1px solid #e2e6eb",
        boxShadow: "0 1px 4px rgba(0,0,0,.05)",
        display: "flex",
        alignItems: "center",
        gap: ".75rem",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: `rgba(${rgb},.08)`,
          border: `1px solid rgba(${rgb},.16)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: ".67rem", fontWeight: 600, color: "#9aa3af", textTransform: "uppercase", letterSpacing: ".5px" }}>
          {label}
        </p>
        <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1a1d23", lineHeight: 1.15, marginTop: ".1rem" }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: ".67rem", color: "#b0b8c4", marginTop: ".15rem" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────
function PageHeader({
  title,
  subtitle,
  action,
  extra,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h1 style={{
            fontSize: "2.1rem",
            fontWeight: 800,
            color: "#0f1117",
            letterSpacing: "-.7px",
            lineHeight: 1.1,
            margin: 0,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: ".82rem", color: "#8a93a2", marginTop: ".3rem" }}>{subtitle}</p>
          )}
          <div style={{
            height: 3,
            width: 52,
            borderRadius: 99,
            background: "linear-gradient(90deg, #ec0927, #ff6b8a)",
            marginTop: ".65rem",
          }} />
        </div>
        {(extra || action) && (
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexShrink: 0, paddingTop: ".25rem" }}>
            {extra}
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function Pagination({
  total,
  page,
  onChange,
}: {
  total: number;
  page: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total === 0) return null;

  const range: (number | null)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) range.push(i);
  } else {
    range.push(1);
    if (page > 3) range.push(null);
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) range.push(i);
    if (page < totalPages - 2) range.push(null);
    range.push(totalPages);
  }

  const from = Math.min((page - 1) * PAGE_SIZE + 1, total);
  const to   = Math.min(page * PAGE_SIZE, total);

  const base: React.CSSProperties = {
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
    border: "1.5px solid #e9ecef", borderRadius: 8, background: "#fff",
    cursor: "pointer", color: "#374151", fontSize: ".85rem", fontFamily: "inherit",
    transition: "all .12s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".75rem 1.25rem", borderTop: "1px solid #f1f3f5", background: "#fff" }}>
      <span style={{ fontSize: ".8rem", color: "#6c757d" }}>
        Mostrando{" "}
        <strong style={{ color: "#111" }}>{from}</strong>–<strong style={{ color: "#111" }}>{to}</strong>
        {" "}de <strong style={{ color: "#111" }}>{total}</strong>
      </span>
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: ".25rem", alignItems: "center" }}>
          <button
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            style={{ ...base, ...(page === 1 ? { background: "#f8f9fa", color: "#adb5bd", cursor: "default" } : {}) }}
          >←</button>

          {range.map((p, i) =>
            p === null ? (
              <span key={`d${i}`} style={{ width: 32, textAlign: "center", color: "#adb5bd", fontSize: ".85rem" }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => { if (p !== page) onChange(p); }}
                style={{ ...base, ...(p === page ? { background: "#ec0927", borderColor: "#ec0927", color: "#fff", fontWeight: 700, cursor: "default" } : {}) }}
              >{p}</button>
            )
          )}

          <button
            onClick={() => onChange(page + 1)}
            disabled={page === totalPages}
            style={{ ...base, ...(page === totalPages ? { background: "#f8f9fa", color: "#adb5bd", cursor: "default" } : {}) }}
          >→</button>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats]       = useState<any>(null);
  const [monthRev, setMonthRev] = useState<any>(null);
  const [topProds, setTopProds] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [catalog, setCatalog]   = useState<{ products: number; categories: number; ingredients: number } | null>(null);

  useEffect(() => {
    api.dashboard().then(setStats).catch(() => {});
    api.revenue("month").then(setMonthRev).catch(() => {});
    api.topProducts().then(setTopProds).catch(() => {});
    api.orders(true).then((all: any[]) => setRecentOrders(all.slice(0, 6))).catch(() => {});
    api.lowStock().then(setLowStock).catch(() => {});
    Promise.all([
      api.products(false).catch(() => []),
      api.allCategories().catch(() => []),
      api.ingredients().catch(() => []),
    ]).then(([p, c, i]: any) => setCatalog({ products: p.length, categories: c.length, ingredients: i.length }));
  }, []);

  const fmt    = (n: any) => `Q${Number(n ?? 0).toFixed(2)}`;
  const fmtMin = (n: any) => `Q${Number(n ?? 0).toFixed(0)}`;
  const today  = new Date();
  const hour   = today.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const dateStr  = today.toLocaleDateString("es-GT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const maxTopRev = topProds.length ? Math.max(...topProds.map((p: any) => Number(p.totalRevenue ?? p.revenue ?? 0))) : 1;

  const card: React.CSSProperties = { background: "#fff", borderRadius: 14, border: "1px solid #e9ecef", boxShadow: "0 1px 3px rgba(0,0,0,.05)" };
  const sectionLabel = (label: string, dot = "#ec0927") => (
    <div style={{ display: "flex", alignItems: "center", gap: ".45rem", marginBottom: ".9rem", paddingBottom: ".65rem", borderBottom: "1px solid #f1f3f5" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      <span style={{ fontSize: ".67rem", fontWeight: 700, color: "#b0b8c4", textTransform: "uppercase", letterSpacing: "1.2px" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ padding: "0 0 2rem", animation: "pageEnter .3s cubic-bezier(.4,0,.2,1)" }}>

      {/* ── Hero header ── */}
      <div style={{ padding: "1.75rem 2rem 1rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: ".7rem", fontWeight: 600, color: "#9aa3af", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 .2rem" }}>{greeting}</p>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1a1d23", margin: "0 0 .25rem", letterSpacing: "-.5px" }}>Panel Administrativo</h1>
            <p style={{ fontSize: ".78rem", color: "#9aa3af", margin: 0 }}>{dateStr}</p>
          </div>
          <div style={{ display: "flex", gap: ".65rem", alignItems: "center", flexShrink: 0 }}>
            {lowStock.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".45rem .85rem", borderRadius: 99, background: "#fff8e6", border: "1px solid #fde68a", color: "#92400e" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span style={{ fontSize: ".72rem", fontWeight: 700 }}>{lowStock.length} stock bajo</span>
              </div>
            )}
            <div style={{ textAlign: "right", background: "#fff", borderRadius: 12, padding: ".65rem 1rem", border: "1px solid #e9ecef", borderLeft: "3px solid #ec0927" }}>
              <p style={{ fontSize: ".65rem", color: "#9aa3af", margin: "0 0 .1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Ventas hoy</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ec0927", margin: 0, lineHeight: 1 }}>{fmtMin(stats?.today?.revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 1.5rem" }}>

        {/* ── 4 KPI tiles ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: ".8rem", marginBottom: "1.1rem" }}>
          {[
            { label: "Ventas hoy",     value: fmt(stats?.today?.revenue),  sub: `${stats?.today?.orders ?? 0} órdenes`,              color: "#f59e0b", rgb: "245,158,11",  icon: Ico.clock  },
            { label: "Esta semana",    value: fmt(stats?.week?.revenue),   sub: `${stats?.week?.orders ?? 0} órdenes`,               color: "#ec0927", rgb: "236,9,39",   icon: Ico.chart  },
            { label: "Este mes",       value: fmt(monthRev?.total),        sub: `${monthRev?.byDay?.length ?? 0} días con ventas`,    color: "#22c55e", rgb: "34,197,94",  icon: Ico.profit },
            { label: "Stock bajo",     value: String(lowStock.length),     sub: lowStock.length ? lowStock[0]?.name ?? "" : "Todo OK", color: "#6366f1", rgb: "99,102,241", icon: Ico.inventory },
          ].map((k) => (
            <KPICard key={k.label} label={k.label} value={k.value} subtitle={k.sub} color={k.color} rgb={k.rgb} icon={k.icon} />
          ))}
        </div>

        {/* ── Fila principal ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: ".9rem", marginBottom: ".9rem" }}>

          {/* Top productos */}
          <div style={{ ...card, padding: "1.1rem 1.25rem" }}>
            {sectionLabel("Top productos del mes")}
            {topProds.length === 0 ? (
              <p style={{ color: "#b0b8c4", fontSize: ".82rem", textAlign: "center", padding: "1.5rem 0" }}>Sin datos de ventas aún</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
                {topProds.slice(0, 6).map((p: any, i: number) => {
                  const rev  = Number(p.totalRevenue ?? p.revenue ?? 0);
                  const qty  = Number(p.totalQuantity ?? p.quantity ?? 0);
                  const pct  = maxTopRev > 0 ? (rev / maxTopRev) * 100 : 0;
                  const colors = ["#ec0927","#f59e0b","#22c55e","#6366f1","#0ea5e9","#f97316"];
                  const col  = colors[i % colors.length];
                  return (
                    <div key={p.id ?? p.name} style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                      <span style={{ fontSize: ".72rem", fontWeight: 800, color: "#b0b8c4", width: 16, textAlign: "right", flexShrink: 0 }}>#{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".28rem" }}>
                          <span style={{ fontSize: ".82rem", fontWeight: 600, color: "#1a1d23", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                          <span style={{ fontSize: ".78rem", fontWeight: 700, color: col, flexShrink: 0, marginLeft: ".5rem" }}>{fmt(rev)}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 99, background: "#f1f3f5", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 99, transition: "width .6s ease" }} />
                        </div>
                        <span style={{ fontSize: ".67rem", color: "#b0b8c4", marginTop: ".15rem", display: "block" }}>{qty} vendido{qty !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel derecho — stock bajo + catálogo */}
          <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>

            {/* Stock bajo */}
            <div style={{ ...card, padding: "1.1rem 1.25rem", flex: lowStock.length ? "1 1 auto" : "0 0 auto" }}>
              {sectionLabel("Stock bajo", "#f59e0b")}
              {lowStock.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".6rem .75rem", borderRadius: 9, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <span style={{ fontSize: ".85rem" }}>✓</span>
                  <span style={{ fontSize: ".8rem", fontWeight: 600, color: "#15803d" }}>Todo el stock está OK</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
                  {lowStock.slice(0, 5).map((i: any) => (
                    <div key={i.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".5rem .65rem", borderRadius: 8, background: "#fff8f8", border: "1px solid #fecaca" }}>
                      <span style={{ fontSize: ".8rem", fontWeight: 600, color: "#1a1d23", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{i.name}</span>
                      <span style={{ fontSize: ".72rem", fontWeight: 700, color: "#dc2626", flexShrink: 0, marginLeft: ".5rem" }}>{Number(i.stockQuantity).toFixed(1)} {i.unit}</span>
                    </div>
                  ))}
                  {lowStock.length > 5 && (
                    <p style={{ fontSize: ".72rem", color: "#b0b8c4", textAlign: "center", margin: 0 }}>+{lowStock.length - 5} más</p>
                  )}
                </div>
              )}
            </div>

            {/* Resumen catálogo */}
            <div style={{ ...card, padding: "1.1rem 1.25rem" }}>
              {sectionLabel("Heladería", "#6366f1")}
              <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
                {[
                  { label: "Productos",    value: catalog?.products   ?? "—", color: "#ec0927" },
                  { label: "Categorías",   value: catalog?.categories ?? "—", color: "#f59e0b" },
                  { label: "Ingredientes", value: catalog?.ingredients ?? "—", color: "#22c55e" },
                ].map((r) => (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".45rem .65rem", borderRadius: 8, background: "#f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                      <div style={{ width: 3, height: 18, borderRadius: 2, background: r.color, flexShrink: 0 }} />
                      <span style={{ fontSize: ".8rem", color: "#4b5563" }}>{r.label}</span>
                    </div>
                    <span style={{ fontSize: ".95rem", fontWeight: 800, color: "#1a1d23" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Fila inferior: órdenes recientes + calendario ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: ".9rem" }}>

          {/* Órdenes recientes */}
          <div style={{ ...card, padding: "1.1rem 1.25rem" }}>
            {sectionLabel("Órdenes recientes")}
            {recentOrders.length === 0 ? (
              <p style={{ color: "#b0b8c4", fontSize: ".82rem", textAlign: "center", padding: "1rem 0" }}>No hay órdenes recientes</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                <thead>
                  <tr>
                    {["#", "Cliente", "Total", "Estado", "Fecha"].map((h) => (
                      <th key={h} style={{ padding: ".45rem .65rem", textAlign: "left", fontWeight: 600, color: "#9aa3af", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".4px", borderBottom: "1px solid #f1f3f5" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o: any) => {
                    const statusColor: Record<string, { bg: string; fg: string }> = {
                      completed: { bg: "#d4edda", fg: "#155724" },
                      pending:   { bg: "#fff3cd", fg: "#856404" },
                      cancelled: { bg: "#f8d7da", fg: "#721c24" },
                    };
                    const sc = statusColor[o.status] ?? { bg: "#e9ecef", fg: "#343a40" };
                    const date = new Date(o.createdAt ?? o.created_at);
                    const timeStr = date.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
                    const total = (o.items ?? o.orderItems ?? []).reduce((acc: number, item: any) => acc + Number(item.subtotal ?? 0), 0) || Number(o.total ?? 0);
                    return (
                      <tr key={o.id} style={{ borderBottom: "1px solid #f8f9fa" }}>
                        <td style={{ padding: ".55rem .65rem", color: "#b0b8c4", fontWeight: 700 }}>#{o.id}</td>
                        <td style={{ padding: ".55rem .65rem", color: "#1a1d23", fontWeight: 500 }}>{o.customerName || "—"}</td>
                        <td style={{ padding: ".55rem .65rem", color: "#ec0927", fontWeight: 700 }}>{fmt(total)}</td>
                        <td style={{ padding: ".55rem .65rem" }}>
                          <span style={{ padding: ".2rem .55rem", borderRadius: 99, fontSize: ".7rem", fontWeight: 700, background: sc.bg, color: sc.fg }}>
                            {o.status === "completed" ? "Completada" : o.status === "cancelled" ? "Cancelada" : "Pendiente"}
                          </span>
                        </td>
                        <td style={{ padding: ".55rem .65rem", color: "#9aa3af", fontSize: ".72rem" }}>{timeStr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Calendario */}
          <div style={{ ...card, padding: "1.1rem 1.25rem" }}>
            {sectionLabel("Calendario")}
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Category Icons palette ───────────────────────────────────────────────────
const CATEGORY_ICONS = [
  "🍦", "🍧", "🍨", "🍡", "🍢", "🧁", "🍰", "🎂",
  "🍫", "🍬", "🍭", "🍮", "🍯", "🍪", "🥐", "🥧",
  "🥤", "🧃", "🧋", "🥛", "☕", "🍵", "🫖", "🍹",
  "🍸", "🥂", "🍶", "🧊", "🫙", "🍱", "🛒", "⭐",
  "❤️", "🏷️", "🎁", "✨", "🔥", "💎", "🌟", "🎉",
];

// ─── Category Form ─────────────────────────────────────────────────────────────
function CategoryForm({
  initial,
  line = "heladeria",
  onBack,
  onSaved,
}: {
  initial?: any;
  line?: string;
  onBack: () => void;
  onSaved: (c: any) => void;
}) {
  const isEdit = !!initial?.id;

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? "0"));
  const [active, setActive] = useState(initial?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name,
        description: description || null,
        icon: icon || null,
        sortOrder: Number(sortOrder ?? 0),
        line,
        active,
      };
      const saved = isEdit
        ? await api.updateCategory(initial.id, payload)
        : await api.createCategory(payload);
      onSaved(saved as any);
    } catch (e: any) {
      setError(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: ".65rem .85rem",
    border: "1.5px solid #e9ecef", borderRadius: 10,
    fontSize: ".9rem", fontFamily: "inherit", color: "#111",
    outline: "none", background: "#fafafa", transition: "border-color .15s",
  };
  const focus = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = "#ec0927"; };
  const blur  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = "#e9ecef"; };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem", animation: "pageEnter .35s cubic-bezier(.4,0,.2,1)" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "0" }}>
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".5rem .9rem", border: "1.5px solid #e9ecef", borderRadius: 9, background: "#fff", cursor: "pointer", fontSize: ".82rem", fontWeight: 600, color: "#6c757d", fontFamily: "inherit", flexShrink: 0, marginTop: ".25rem" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ec0927"; e.currentTarget.style.color = "#ec0927"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e9ecef"; e.currentTarget.style.color = "#6c757d"; }}
        >
          ← Volver
        </button>
        <PageHeader
          title={isEdit ? "Editar Categoría" : "Nueva Categoría"}
          subtitle={isEdit ? `Modificando: ${initial.name}` : "Completa los campos para agregar una categoría al catálogo"}
        />
      </div>

      {/* ── Información básica ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#adb5bd", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#ec0927" }} />
          Información Básica
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Nombre *</label>
            <input style={inp} value={name} placeholder="Ej. Helados, Malteadas, Combos…" onChange={(e) => setName(e.target.value)} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Descripción</label>
          <input style={inp} value={description} placeholder="Descripción breve de la categoría (opcional)" onChange={(e) => setDescription(e.target.value)} onFocus={focus} onBlur={blur} />
        </div>

        {isEdit && (
          <label style={{ display: "flex", alignItems: "center", gap: ".6rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: "#ec0927", width: 16, height: 16 }} />
            <span style={{ fontSize: ".88rem", fontWeight: 500, color: "#343a40" }}>Categoría activa (visible en el punto de venta)</span>
          </label>
        )}
      </div>

      {/* ── Icono ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#adb5bd", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
          Icono de la Categoría
        </p>

        {/* Selected preview */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, border: "2px solid #e9ecef", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
            {icon || <span style={{ fontSize: ".7rem", color: "#b0b8c4", textAlign: "center", lineHeight: 1.2 }}>Sin<br/>icono</span>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Icono seleccionado (puedes escribir cualquier emoji)</label>
            <input
              style={{ ...inp, width: "100%" }}
              value={icon}
              placeholder="Pega o escribe un emoji…"
              onChange={(e) => setIcon(e.target.value)}
              onFocus={focus}
              onBlur={blur}
            />
          </div>
        </div>

        {/* Palette */}
        <p style={{ fontSize: ".72rem", color: "#b0b8c4", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: ".65rem" }}>
          Sugerencias — haz clic para seleccionar
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
          {CATEGORY_ICONS.map((em) => (
            <button
              key={em}
              onClick={() => setIcon(em)}
              title={em}
              style={{
                width: 40, height: 40, borderRadius: 9, border: `2px solid ${icon === em ? "#ec0927" : "#e9ecef"}`,
                background: icon === em ? "#fff0f2" : "#fafafa",
                cursor: "pointer", fontSize: "1.35rem", lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .12s", boxShadow: icon === em ? "0 0 0 3px rgba(236,9,39,.15)" : "none",
              }}
              onMouseEnter={(e) => { if (icon !== em) { e.currentTarget.style.borderColor = "#f9a8b4"; e.currentTarget.style.background = "#fff5f7"; } }}
              onMouseLeave={(e) => { if (icon !== em) { e.currentTarget.style.borderColor = "#e9ecef"; e.currentTarget.style.background = "#fafafa"; } }}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: ".85rem 1rem", borderRadius: 10, background: "#fff5f5", border: "1px solid #fecaca", color: "#dc2626", fontSize: ".85rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
        <button onClick={onBack} style={{ padding: ".65rem 1.5rem", border: "1.5px solid #e9ecef", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: ".9rem", fontWeight: 500, fontFamily: "inherit", color: "#6c757d" }}>
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !name}
          style={{ padding: ".65rem 2rem", background: saving || !name ? "#adb5bd" : "#ec0927", color: "#fff", border: "none", borderRadius: 10, cursor: saving || !name ? "not-allowed" : "pointer", fontWeight: 700, fontSize: ".9rem", fontFamily: "inherit" }}
        >
          {saving ? "Guardando…" : isEdit ? "✓ Guardar cambios" : "+ Crear categoría"}
        </button>
      </div>
    </div>
  );
}

// ─── Categories Panel ─────────────────────────────────────────────────────────
function CategoriesPanel({ line = "heladeria" }: { line?: string }) {
  const isPal = line === "paleteria";
  const [categories, setCategories] = useState<any[]>([]);
  const [view, setView]             = useState<"list" | "form">("list");
  const [editing, setEditing]       = useState<any | null>(null);
  const [page, setPage]             = useState(1);
  const [confirmDel, setConfirmDel] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    api.allCategories(line).then(setCategories).catch(() => {});
  }, [line]);

  const paged = categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete() {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await api.deleteCategory(confirmDel.id);
      setCategories((prev) => {
        const next = prev.filter((c) => c.id !== confirmDel.id);
        const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        if (page > maxPage) setPage(maxPage);
        return next;
      });
      setConfirmDel(null);
    } catch (e: any) {
      setError(e.message ?? "Error al desactivar");
      setConfirmDel(null);
    } finally {
      setDeleting(false);
    }
  }

  function handleSaved(saved: any) {
    if (editing) {
      setCategories((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    } else {
      setCategories((prev) => [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder));
    }
    setEditing(null);
    setView("list");
  }

  if (view === "form") {
    return <CategoryForm initial={editing ?? undefined} line={line} onBack={() => { setEditing(null); setView("list"); }} onSaved={handleSaved} />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem", animation: "pageEnter .35s cubic-bezier(.4,0,.2,1)" }}>
      <PageHeader title={isPal ? "Categorías de Paletería" : "Categorías"} subtitle={isPal ? "Organización de las paletas" : "Organización del catálogo de productos"} />

      {/* ── Crear card ── */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          role="button" tabIndex={0}
          onClick={() => { setEditing(null); setView("form"); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setEditing(null); setView("form"); } }}
          style={{ background: "linear-gradient(135deg, #fff0f2 0%, #fff8f5 55%, #f5f0ff 100%)", border: "2px dashed rgba(236,9,39,.35)", borderRadius: 16, padding: "1.35rem 2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #ffe0e5 0%, #fff0e8 55%, #ece8ff 100%)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(236,9,39,.12)"; e.currentTarget.style.borderColor = "rgba(236,9,39,.6)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #fff0f2 0%, #fff8f5 55%, #f5f0ff 100%)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(236,9,39,.35)"; }}
        >
          <div>
            <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#ec0927", textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: ".2rem" }}>Nueva categoría</p>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1a1d23", letterSpacing: "-.2px" }}>¿Querés organizar mejor el menú?</h3>
            <p style={{ fontSize: ".8rem", color: "#9ca3af", marginTop: ".2rem" }}>Crea categorías como Helados, Malteadas, Combos para agrupar tus productos</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
            <span style={{ fontSize: "2.5rem" }}>🏷️</span>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #ec0927, #7a0000)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.5rem", fontWeight: 700, boxShadow: "0 4px 14px rgba(236,9,39,.35)" }}>+</div>
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["#", "Icono", "Nombre", "Descripción", "Productos", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ padding: ".9rem 1.25rem", textAlign: "left", fontWeight: 600, color: "#6c757d", fontSize: ".8rem", textTransform: "uppercase", letterSpacing: ".4px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((c, idx) => {
              const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
              return (
                <tr key={c.id} style={{ borderTop: "1px solid #f1f3f5" }}>
                  <td style={{ padding: ".85rem 1.25rem", color: "#adb5bd", fontSize: ".8rem", fontWeight: 600 }}>{globalIdx}</td>
                  <td style={{ padding: ".85rem 1.25rem", fontSize: "1.4rem", lineHeight: 1 }}>{c.icon || <span style={{ color: "#dee2e6", fontSize: ".8rem" }}>—</span>}</td>
                  <td style={{ padding: ".85rem 1.25rem", fontWeight: 600, color: "#111" }}>{c.name}</td>
                  <td style={{ padding: ".85rem 1.25rem", color: "#6c757d", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description || <span style={{ color: "#dee2e6" }}>—</span>}</td>
                  <td style={{ padding: ".85rem 1.25rem" }}>
                    <span style={{ padding: ".22rem .6rem", borderRadius: 99, background: "#eff6ff", color: "#3b5bdb", fontSize: ".75rem", fontWeight: 700 }}>
                      {(c.products ?? []).length} producto{(c.products ?? []).length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td style={{ padding: ".85rem 1.25rem" }}>
                    <span style={{ padding: ".3rem .8rem", borderRadius: 99, fontSize: ".78rem", fontWeight: 700, background: c.active ? "#d4edda" : "#f8d7da", color: c.active ? "#155724" : "#721c24" }}>
                      {c.active ? "● Activo" : "○ Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: ".85rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: ".45rem" }}>
                      <button onClick={() => { setEditing(c); setView("form"); }} style={{ padding: ".3rem .75rem", border: "1.5px solid #dee2e6", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit", color: "#343a40" }}>
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDel({ id: c.id, name: c.name })}
                        style={{ padding: ".3rem .75rem", border: "1.5px solid #fecaca", borderRadius: 8, background: "#fff5f5", cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit", color: "#dc2626", fontWeight: 600 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#f87171"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "#fecaca"; }}
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!categories.length && (
          <p style={{ padding: "2rem", textAlign: "center", color: "#adb5bd" }}>No hay categorías</p>
        )}
        <Pagination total={categories.length} page={page} onChange={setPage} />
      </div>

      {/* ── Confirmar eliminación ── */}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}
        >
          <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fff5f5", border: "1.5px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1.1rem" }}>🗑️</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", margin: "0 0 .4rem" }}>Desactivar categoría</h2>
            <p style={{ fontSize: ".88rem", color: "#6c757d", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              ¿Estás seguro de desactivar <strong>"{confirmDel.name}"</strong>? Dejará de aparecer en la lista.
            </p>
            <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDel(null)} style={{ padding: ".6rem 1.5rem", border: "1.5px solid #e9ecef", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: ".9rem", fontFamily: "inherit", color: "#6c757d" }}>Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: ".6rem 1.5rem", background: deleting ? "#adb5bd" : "#dc2626", color: "#fff", border: "none", borderRadius: 10, cursor: deleting ? "not-allowed" : "pointer", fontWeight: 700, fontSize: ".9rem", fontFamily: "inherit" }}>
                {deleting ? "Desactivando…" : "Sí, desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorModal open={!!error} title="Error" message={error} onClose={() => setError("")} />
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────
// Para helado la cantidad se escribe como bolitas × onzas por bolita (el backend lo pasa a libras)
type IngRow = { ingredientId: number | ""; quantity: number | ""; scoops: number | ""; ounces: number | "" };
const OZ_PER_LB = 16;

function ProductForm({
  initial,
  line = "heladeria",
  onBack,
  onSaved,
}: {
  initial?: any;
  line?: string;
  onBack: () => void;
  onSaved: (p: any) => void;
}) {
  const isEdit = !!initial?.id;
  const isPal = line === "paleteria";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [price, setPrice] = useState("");
  const [containerSize, setContainerSize] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [active, setActive] = useState(true);
  const [ingRows, setIngRows] = useState<IngRow[]>([]);
  // Paletas usadas como parte de la receta (se descuentan de su stock al vender)
  const [compRows, setCompRows] = useState<{ componentId: number | ""; quantity: number | "" }[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allIngredients, setAllIngredients] = useState<any[]>([]);
  const [allPaletas, setAllPaletas] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    api.allCategories(line).then(setCategories).catch(() => {});
    if (!isPal) api.ingredients().then(setAllIngredients).catch(() => {});
    if (!isPal) api.products(true, "paleteria").then(setAllPaletas).catch(() => {});
    if (isEdit) {
      api.product(initial.id).then((p: any) => {
        setName(p.name ?? "");
        setDescription(p.description ?? "");
        setUnitCost(String(p.unitCost ?? ""));
        setPrice(String(p.price ?? ""));
        setContainerSize(p.containerSize ?? "");
        setStockQuantity(String(p.stockQuantity ?? ""));
        setCategoryId(p.category?.id ?? "");
        setActive(p.active ?? true);
        setIngRows(
          (p.productIngredients ?? []).map((pi: any) => ({
            ingredientId: pi.ingredient?.id ?? "",
            quantity: Number(pi.quantityPerUnit) || "",
            scoops: Number(pi.scoops) || "",
            ounces: Number(pi.ouncesPerScoop) || "",
          })),
        );
        setCompRows(
          (p.components ?? [])
            .filter((pc: any) => pc.component)
            .map((pc: any) => ({ componentId: pc.component.id, quantity: Number(pc.quantity) || "" })),
        );
        setLoaded(true);
      }).catch(() => setLoaded(true));
    }
  }, []);

  function addIngredient() {
    setIngRows((r) => [...r, { ingredientId: "", quantity: "", scoops: "", ounces: "" }]);
  }

  function removeIngredient(idx: number) {
    setIngRows((r) => r.filter((_, i) => i !== idx));
  }

  function updateIngredient(idx: number, patch: Partial<IngRow>) {
    setIngRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name,
        description,
        unitCost: Number(unitCost) || 0,
        price: Number(price),
        containerSize,
        categoryId: Number(categoryId),
        line,
        active,
        ...(isPal ? { stockQuantity: Math.max(0, Math.floor(Number(stockQuantity) || 0)) } : {}),
        ingredients: ingRows
          .filter(rowComplete)
          .map((r) =>
            isHeladoRow(r)
              ? { ingredientId: Number(r.ingredientId), scoops: Number(r.scoops), ouncesPerScoop: Number(r.ounces) }
              : { ingredientId: Number(r.ingredientId), quantityPerUnit: Number(r.quantity) },
          ),
        ...(isPal ? {} : {
          components: compRows
            .filter((c) => c.componentId !== "" && Number(c.quantity) > 0)
            .map((c) => ({ componentId: Number(c.componentId), quantity: Math.floor(Number(c.quantity)) })),
        }),
      };
      const saved = isEdit
        ? await api.updateProduct(initial.id, payload)
        : await api.createProduct(payload);
      onSaved(saved as any);
    } catch (e: any) {
      setError(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: ".65rem .85rem",
    border: "1.5px solid #e9ecef", borderRadius: 10,
    fontSize: ".9rem", fontFamily: "inherit", color: "#111",
    outline: "none", background: "#fafafa", transition: "border-color .15s",
  };
  const focus = (e: React.FocusEvent<any>, c = "#ec0927") => { e.currentTarget.style.borderColor = c; };
  const blur  = (e: React.FocusEvent<any>)                 => { e.currentTarget.style.borderColor = "#e9ecef"; };

  const ingMap = new Map(allIngredients.map((i) => [i.id, i]));

  function isHeladoRow(r: IngRow) {
    return ingMap.get(Number(r.ingredientId))?.category === "helado";
  }
  function rowComplete(r: IngRow) {
    if (r.ingredientId === "") return false;
    return isHeladoRow(r) ? Number(r.scoops) > 0 && Number(r.ounces) > 0 : r.quantity !== "";
  }
  function rowLabel(r: IngRow) {
    const name = ingMap.get(Number(r.ingredientId))?.name ?? "";
    if (!isHeladoRow(r)) return `${r.quantity} de ${name}`;
    const oz = Number(r.scoops) * Number(r.ounces);
    return `${r.scoops} bolita${Number(r.scoops) !== 1 ? "s" : ""} de ${r.ounces} oz de ${name} (${oz} oz = ${(oz / OZ_PER_LB).toFixed(3)} lb)`;
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1.5rem", animation: "pageEnter .35s cubic-bezier(.4,0,.2,1)" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "0" }}>
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".5rem .9rem", border: "1.5px solid #e9ecef", borderRadius: 9, background: "#fff", cursor: "pointer", fontSize: ".82rem", fontWeight: 600, color: "#6c757d", fontFamily: "inherit", flexShrink: 0, marginTop: ".25rem" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ec0927"; e.currentTarget.style.color = "#ec0927"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e9ecef"; e.currentTarget.style.color = "#6c757d"; }}
        >
          ← Volver
        </button>
        <PageHeader
          title={isEdit ? (isPal ? "Editar Paleta" : "Editar Producto") : (isPal ? "Nueva Paleta" : "Nuevo Producto")}
          subtitle={isEdit ? `Modificando: ${initial.name}` : "Completa los campos para agregar un producto al catálogo"}
        />
      </div>

      {!loaded ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#adb5bd" }}>Cargando producto…</div>
      ) : (
        <>
          {/* ── Información básica ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", padding: "1.5rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#adb5bd", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#ec0927" }} />
              Información Básica
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Nombre *</label>
                <input style={inp} value={name} placeholder="Ej. Malteada de Fresa" onChange={(e) => setName(e.target.value)} onFocus={(e) => focus(e)} onBlur={blur} />
              </div>
              <div>
                <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Precio Unitario (Q)</label>
                <input type="number" style={inp} value={unitCost} placeholder="0.00" min={0} step="0.01" onChange={(e) => setUnitCost(e.target.value)} onFocus={(e) => focus(e)} onBlur={blur} />
              </div>
              <div>
                <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Precio Venta (Q) *</label>
                <input type="number" style={inp} value={price} placeholder="0.00" min={0} step="0.01" onChange={(e) => setPrice(e.target.value)} onFocus={(e) => focus(e)} onBlur={blur} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isPal ? "1fr 1fr 1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Categoría *</label>
                <Combobox
                  value={categoryId}
                  onChange={(v) => setCategoryId(v === "" ? "" : Number(v))}
                  options={categories.map((c) => ({ value: c.id, label: `${c.icon ?? ""} ${c.name}`.trim() }))}
                  placeholder="— Seleccionar —"
                />
              </div>
              <div>
                <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Tamaño de Envase</label>
                <input style={inp} value={containerSize} placeholder="Ej. 16 oz, Grande, Mediano" onChange={(e) => setContainerSize(e.target.value)} onFocus={(e) => focus(e)} onBlur={blur} />
              </div>
              {isPal && (
                <div>
                  <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Stock (unidades)</label>
                  <input type="number" style={inp} value={stockQuantity} placeholder="0" min={0} step="1" onChange={(e) => setStockQuantity(e.target.value)} onFocus={(e) => focus(e)} onBlur={blur} />
                </div>
              )}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Descripción</label>
              <textarea style={{ ...inp, minHeight: 72, resize: "vertical" } as React.CSSProperties} value={description} placeholder="Descripción opcional del producto…" onChange={(e) => setDescription(e.target.value)} onFocus={(e) => focus(e)} onBlur={blur} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: ".6rem", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: "#ec0927", width: 16, height: 16 }} />
              <span style={{ fontSize: ".88rem", fontWeight: 500, color: "#343a40" }}>Producto activo (visible en el punto de venta)</span>
            </label>
          </div>

          {/* ── Receta ── */}
          {!isPal && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", padding: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#adb5bd", textTransform: "uppercase", letterSpacing: "1.2px", display: "flex", alignItems: "center", gap: ".5rem" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9" }} />
                  Receta — ¿Qué lleva este producto?
                </p>
                <p style={{ fontSize: ".78rem", color: "#b0b8c4", marginTop: ".25rem" }}>
                  Selecciona cada ingrediente del inventario y define la cantidad que se usa por unidad vendida
                </p>
              </div>
              <button
                onClick={addIngredient}
                style={{ padding: ".38rem .9rem", border: "1.5px solid #0ea5e9", borderRadius: 8, background: "#f0f9ff", color: "#0ea5e9", cursor: "pointer", fontSize: ".78rem", fontWeight: 700, fontFamily: "inherit", flexShrink: 0 }}
              >
                + Agregar ingrediente
              </button>
            </div>

            {/* Column headers */}
            {ingRows.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 230px 32px", gap: ".6rem", padding: "0 0 .4rem", marginBottom: ".25rem", borderBottom: "1px solid #f1f3f5" }}>
                {["Ingrediente", "Cantidad", ""].map((h) => (
                  <span key={h} style={{ fontSize: ".68rem", fontWeight: 700, color: "#b0b8c4", textTransform: "uppercase", letterSpacing: ".5px" }}>{h}</span>
                ))}
              </div>
            )}

            {ingRows.length === 0 && (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "#b0b8c4" }}>
                <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>🧪</div>
                <p style={{ fontSize: ".85rem" }}>Sin ingredientes — haz clic en "+ Agregar ingrediente" para definir la receta</p>
              </div>
            )}

            {ingRows.map((row, idx) => {
              const helado = isHeladoRow(row);
              const numInput = (value: number | "", onChange: (v: number | "") => void, placeholder: string, step: string) => (
                <input
                  type="number"
                  value={value ?? ""}
                  onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  style={{ ...inp, padding: ".55rem .65rem", textAlign: "right" }}
                  placeholder={placeholder}
                  min={0}
                  step={step}
                  onFocus={(e) => focus(e, "#0ea5e9")}
                  onBlur={blur}
                />
              );
              return (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 230px 32px", gap: ".6rem", alignItems: "center", marginBottom: ".45rem" }}>
                  {/* Ingredient selector */}
                  <Combobox
                    value={row.ingredientId ?? ""}
                    onChange={(v) => updateIngredient(idx, { ingredientId: v === "" ? "" : Number(v) })}
                    options={allIngredients.map((i) => ({ value: i.id, label: i.name }))}
                    placeholder="— Seleccionar —"
                    accent="#0ea5e9"
                  />

                  {/* Quantity: helado en bolitas × onzas, lo demás en cantidad simple */}
                  {helado ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: ".3rem", alignItems: "center" }}>
                      {numInput(row.scoops, (v) => updateIngredient(idx, { scoops: v }), "Bolitas", "1")}
                      <span style={{ fontSize: ".72rem", color: "#94a3b8", fontWeight: 600 }}>×</span>
                      {numInput(row.ounces, (v) => updateIngredient(idx, { ounces: v }), "Oz", "0.5")}
                      <span style={{ fontSize: ".72rem", color: "#94a3b8", fontWeight: 600 }}>oz</span>
                    </div>
                  ) : (
                    numInput(row.quantity, (v) => updateIngredient(idx, { quantity: v }), "0", "0.5")
                  )}

                  {/* Remove */}
                  <button
                    onClick={() => removeIngredient(idx)}
                    style={{ background: "none", border: "none", color: "#dee2e6", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ec0927"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#dee2e6"; }}
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {/* Recipe summary */}
            {ingRows.filter(rowComplete).length > 0 && (
              <div style={{ marginTop: "1rem", padding: ".65rem .85rem", borderRadius: 10, background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: ".8rem", color: "#0369a1" }}>
                <strong>{ingRows.filter(rowComplete).length}</strong> ingrediente{ingRows.filter(rowComplete).length !== 1 ? "s" : ""} en la receta —{" "}
                {ingRows.filter(rowComplete).map(rowLabel).join(", ")}
              </div>
            )}
          </div>
          )}

          {/* ── Paletas en la receta ── */}
          {!isPal && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", padding: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#adb5bd", textTransform: "uppercase", letterSpacing: "1.2px", display: "flex", alignItems: "center", gap: ".5rem" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#a855f7" }} />
                  Paletas en la receta
                </p>
                <p style={{ fontSize: ".78rem", color: "#b0b8c4", marginTop: ".25rem" }}>
                  Si este producto lleva paletas, agrégalas aquí — se descuentan de su stock en cada venta
                </p>
              </div>
              <button
                onClick={() => setCompRows((r) => [...r, { componentId: "", quantity: 1 }])}
                style={{ padding: ".38rem .9rem", border: "1.5px solid #a855f7", borderRadius: 8, background: "#faf5ff", color: "#a855f7", cursor: "pointer", fontSize: ".78rem", fontWeight: 700, fontFamily: "inherit", flexShrink: 0 }}
              >
                + Agregar paleta
              </button>
            </div>

            {compRows.length === 0 && (
              <p style={{ textAlign: "center", padding: "1rem 0", color: "#b0b8c4", fontSize: ".85rem" }}>Esta receta no lleva paletas</p>
            )}

            {compRows.map((row, idx) => {
              const pal = allPaletas.find((p) => p.id === Number(row.componentId));
              return (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 110px 32px", gap: ".6rem", alignItems: "center", marginBottom: ".45rem" }}>
                  <Combobox
                    value={row.componentId ?? ""}
                    onChange={(v) => setCompRows((r) => r.map((c, i) => (i === idx ? { ...c, componentId: v === "" ? "" : Number(v) } : c)))}
                    options={allPaletas.map((p) => ({ value: p.id, label: p.name, description: `Stock: ${Number(p.stockQuantity) || 0}` }))}
                    placeholder="— Seleccionar paleta —"
                    accent="#a855f7"
                  />
                  <input
                    type="number"
                    value={row.quantity ?? ""}
                    onChange={(e) => setCompRows((r) => r.map((c, i) => (i === idx ? { ...c, quantity: e.target.value === "" ? "" : Number(e.target.value) } : c)))}
                    style={{ ...inp, padding: ".55rem .65rem", textAlign: "right" }}
                    placeholder="1"
                    min={1}
                    step="1"
                    title={pal ? `Stock actual: ${Number(pal.stockQuantity) || 0}` : undefined}
                    onFocus={(e) => focus(e, "#a855f7")}
                    onBlur={blur}
                  />
                  <button
                    onClick={() => setCompRows((r) => r.filter((_, i) => i !== idx))}
                    style={{ background: "none", border: "none", color: "#dee2e6", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ec0927"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#dee2e6"; }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: ".85rem 1rem", borderRadius: 10, background: "#fff5f5", border: "1px solid #fecaca", color: "#dc2626", fontSize: ".85rem", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
            <button onClick={onBack} style={{ padding: ".65rem 1.5rem", border: "1.5px solid #e9ecef", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: ".9rem", fontWeight: 500, fontFamily: "inherit", color: "#6c757d" }}>
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name || !price || !categoryId}
              style={{ padding: ".65rem 2rem", background: saving || !name || !price || !categoryId ? "#adb5bd" : "#ec0927", color: "#fff", border: "none", borderRadius: 10, cursor: saving || !name || !price || !categoryId ? "not-allowed" : "pointer", fontWeight: 700, fontSize: ".9rem", fontFamily: "inherit" }}
            >
              {saving ? "Guardando…" : isEdit ? "✓ Guardar cambios" : "+ Crear producto"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Products Panel ────────────────────────────────────────────────────────────
function ProductsPanel({ line = "heladeria" }: { line?: string }) {
  const isPal = line === "paleteria";
  const [products, setProducts]     = useState<any[]>([]);
  const [view, setView]             = useState<"list" | "form">("list");
  const [editing, setEditing]       = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage]             = useState(1);
  const [confirmDel, setConfirmDel] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting]     = useState(false);

  // Export modal
  const [showExportModal, setShowExportModal]   = useState(false);
  const [exportFilter, setExportFilter]         = useState<"all" | "category">("all");
  const [exportCategoryId, setExportCategoryId] = useState<number | "">("");
  const [exporting, setExporting]               = useState(false);
  const [categories, setCategories]             = useState<any[]>([]);

  useEffect(() => {
    api.products(false, line).then(setProducts).catch(() => {});
    api.allCategories(line).then(setCategories).catch(() => {});
  }, []);

  function handleSaved(p: any) {
    if (editing) {
      setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    } else {
      setProducts((prev) => [...prev, p]);
    }
    setEditing(null);
    setView("list");
  }

  function handleExport() {
    setExporting(true);
    try {
      const url = api.recipePdfUrl(
        exportFilter === "category" && exportCategoryId
          ? { categoryId: Number(exportCategoryId) }
          : undefined,
      );
      window.open(url, "_blank");
      setShowExportModal(false);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await api.deleteProduct(confirmDel.id);
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== confirmDel.id);
        const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        if (page > maxPage) setPage(maxPage);
        return next;
      });
      setConfirmDel(null);
    } catch (e: any) {
      // Backend 400 means product has orders — show error in place
      alert(e.message ?? "Error al desactivar");
      setConfirmDel(null);
    } finally {
      setDeleting(false);
    }
  }

  const paged = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (view === "form") {
    return <ProductForm initial={editing ?? undefined} line={line} onBack={() => { setEditing(null); setView("list"); }} onSaved={handleSaved} />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem", animation: "pageEnter .35s cubic-bezier(.4,0,.2,1)" }}>
      <PageHeader title={isPal ? "Paletas" : "Productos"} subtitle={isPal ? "Gestión del catálogo de paletería" : "Gestión del catálogo de productos"} />

      {/* ── Crear + Exportar ── */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", alignItems: "stretch" }}>
        {/* Create card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => { setEditing(null); setView("form"); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setEditing(null); setView("form"); } }}
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #fff0f2 0%, #fff8f5 55%, #f5f0ff 100%)",
            border: "2px dashed rgba(236,9,39,.35)", borderRadius: 16,
            padding: "1.35rem 2rem", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #ffe0e5 0%, #fff0e8 55%, #ece8ff 100%)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(236,9,39,.12)";
            e.currentTarget.style.borderColor = "rgba(236,9,39,.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #fff0f2 0%, #fff8f5 55%, #f5f0ff 100%)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "rgba(236,9,39,.35)";
          }}
        >
          <div>
            <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#ec0927", textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: ".2rem" }}>
              Nuevo producto
            </p>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1a1d23", letterSpacing: "-.2px" }}>
              ¿Listo para agregar algo nuevo al menú?
            </h3>
            <p style={{ fontSize: ".8rem", color: "#9ca3af", marginTop: ".2rem" }}>
              {isPal ? "Crea paletas — sin receta de ingredientes" : "Crea helados, malteadas, combos y más — con receta de ingredientes incluida"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
            <span style={{ fontSize: "2.5rem" }}>🍦</span>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #ec0927, #7a0000)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.5rem", fontWeight: 700, boxShadow: "0 4px 14px rgba(236,9,39,.35)" }}>
              +
            </div>
          </div>
        </div>

        {/* Export card */}
        {!isPal && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowExportModal(true)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowExportModal(true); }}
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #f0fdf4 0%, #f0fff8 55%, #ecfdf5 100%)",
            border: "2px dashed rgba(16,185,129,.35)", borderRadius: 16,
            padding: "1.35rem 2rem", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #d1fae5 0%, #dcfce7 55%, #d1fae5 100%)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(16,185,129,.12)";
            e.currentTarget.style.borderColor = "rgba(16,185,129,.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #f0fdf4 0%, #f0fff8 55%, #ecfdf5 100%)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "rgba(16,185,129,.35)";
          }}
        >
          <div>
            <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: ".2rem" }}>
              Exportar recetas
            </p>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1a1d23", letterSpacing: "-.2px" }}>
              ¿Necesitás el recetario impreso?
            </h3>
            <p style={{ fontSize: ".8rem", color: "#9ca3af", marginTop: ".2rem" }}>
              Descargá el PDF con todos los ingredientes y cantidades
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
            <span style={{ fontSize: "2.5rem" }}>📋</span>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #10b981, #065f46)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.3rem", fontWeight: 700, boxShadow: "0 4px 14px rgba(16,185,129,.35)" }}>
              ↓
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ── Tabla ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["#", "Nombre", "Categoría", "P. Unitario", "P. Venta", isPal ? "Stock" : "Envase", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ padding: ".9rem 1.25rem", textAlign: "left", fontWeight: 600, color: "#6c757d", fontSize: ".8rem", textTransform: "uppercase", letterSpacing: ".4px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((p, idx) => {
              const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
              return (
                <Fragment key={p.id}>
                  <tr style={{ borderTop: "1px solid #f1f3f5" }}>
                    <td style={{ padding: ".85rem 1.25rem", color: "#adb5bd", fontSize: ".8rem", fontWeight: 600 }}>{globalIdx}</td>
                    <td style={{ padding: ".85rem 1.25rem", fontWeight: 600, color: "#111" }}>{p.name}</td>
                    <td style={{ padding: ".85rem 1.25rem", color: "#6c757d" }}>{p.category?.name}</td>
                    <td style={{ padding: ".85rem 1.25rem", color: "#6c757d", fontWeight: 600 }}>
                      {Number(p.unitCost) > 0 ? `Q${Number(p.unitCost).toFixed(2)}` : <span style={{ color: "#dee2e6" }}>—</span>}
                    </td>
                    <td style={{ padding: ".85rem 1.25rem", color: "#ec0927", fontWeight: 700 }}>Q{Number(p.price).toFixed(2)}</td>
                    {isPal ? (
                      <td style={{ padding: ".85rem 1.25rem" }}>
                        <span style={{ padding: ".3rem .8rem", borderRadius: 99, fontSize: ".78rem", fontWeight: 700, background: Number(p.stockQuantity) > 0 ? "#e0f2fe" : "#f8d7da", color: Number(p.stockQuantity) > 0 ? "#0369a1" : "#721c24" }}>
                          {Number(p.stockQuantity) || 0} u.
                        </span>
                      </td>
                    ) : (
                      <td style={{ padding: ".85rem 1.25rem", color: "#6c757d" }}>{p.containerSize}</td>
                    )}
                    <td style={{ padding: ".85rem 1.25rem" }}>
                      <span style={{ padding: ".3rem .8rem", borderRadius: 99, fontSize: ".78rem", fontWeight: 700, background: p.active ? "#d4edda" : "#f8d7da", color: p.active ? "#155724" : "#721c24" }}>
                        {p.active ? "● Activo" : "○ Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: ".85rem 1.25rem" }}>
                      <div style={{ display: "flex", gap: ".45rem" }}>
                        {!isPal && (
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          style={{ padding: ".3rem .7rem", border: `1.5px solid ${expandedId === p.id ? "#7dd3fc" : "#bae6fd"}`, borderRadius: 8, background: expandedId === p.id ? "#e0f2fe" : "#f0f9ff", cursor: "pointer", fontSize: ".75rem", fontFamily: "inherit", color: "#0369a1", fontWeight: 600, transition: "all .15s" }}
                        >
                          {expandedId === p.id ? "▲" : "▼"} Receta
                        </button>
                        )}
                        <button
                          onClick={() => { setEditing(p); setView("form"); }}
                          style={{ padding: ".3rem .75rem", border: "1.5px solid #dee2e6", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit", color: "#343a40" }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmDel({ id: p.id, name: p.name })}
                          style={{ padding: ".3rem .75rem", border: "1.5px solid #fecaca", borderRadius: 8, background: "#fff5f5", cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit", color: "#dc2626", fontWeight: 600 }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#f87171"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "#fecaca"; }}
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                  {!isPal && expandedId === p.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0, background: "#f8fcff" }}>
                        <div style={{ padding: "1rem 1.5rem 1.25rem 2.5rem", borderTop: "1px dashed #bae6fd" }}>
                          <p style={{ fontSize: ".72rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "1px", marginBottom: ".65rem" }}>
                            Receta · {(p.productIngredients ?? []).length} ingrediente{(p.productIngredients ?? []).length !== 1 ? "s" : ""}
                          </p>
                          {!(p.productIngredients ?? []).length ? (
                            <p style={{ color: "#94a3b8", fontSize: ".82rem", fontStyle: "italic" }}>Sin ingredientes configurados — edita el producto para agregar la receta</p>
                          ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: ".45rem" }}>
                              {[...(p.productIngredients as any[])]
                                .sort((a, b) => (a.ingredient?.name ?? "").localeCompare(b.ingredient?.name ?? ""))
                                .map((pi) => (
                                  <div key={pi.id} style={{ display: "inline-flex", alignItems: "center", gap: ".3rem", padding: ".3rem .75rem", borderRadius: 99, background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: ".8rem", lineHeight: 1.3 }}>
                                    <span style={{ fontWeight: 700, color: "#0369a1" }}>{pi.scoops ? `${pi.scoops} × ${Number(pi.ouncesPerScoop)}` : Number(pi.quantityPerUnit)}</span>
                                    <span style={{ color: "#64748b", fontSize: ".72rem" }}>{pi.scoops ? "oz" : pi.ingredient?.unit}</span>
                                    <span style={{ color: "#0f172a", fontWeight: 500 }}>{pi.ingredient?.name}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                          {(p.components ?? []).some((pc: any) => pc.component) && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: ".45rem", marginTop: ".55rem" }}>
                              {(p.components as any[]).filter((pc) => pc.component).map((pc) => (
                                <div key={pc.id} style={{ display: "inline-flex", alignItems: "center", gap: ".3rem", padding: ".3rem .75rem", borderRadius: 99, background: "#faf5ff", border: "1px solid #e9d5ff", fontSize: ".8rem", lineHeight: 1.3 }}>
                                  <span style={{ fontWeight: 700, color: "#7e22ce" }}>{pc.quantity}</span>
                                  <span style={{ color: "#64748b", fontSize: ".72rem" }}>🍡</span>
                                  <span style={{ color: "#0f172a", fontWeight: 500 }}>{pc.component.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {!products.length && (
          <p style={{ padding: "2rem", textAlign: "center", color: "#adb5bd" }}>No hay productos</p>
        )}
        <Pagination total={products.length} page={page} onChange={setPage} />
      </div>

      {/* ── Confirmar eliminación ── */}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}
        >
          <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fff5f5", border: "1.5px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1.1rem" }}>🗑️</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", margin: "0 0 .4rem" }}>Desactivar producto</h2>
            <p style={{ fontSize: ".88rem", color: "#6c757d", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              ¿Estás seguro de eliminar <strong>"{confirmDel.name}"</strong>? Dejará de aparecer en la lista.
            </p>
            <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDel(null)} style={{ padding: ".6rem 1.5rem", border: "1.5px solid #e9ecef", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: ".9rem", fontFamily: "inherit", color: "#6c757d" }}>Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: ".6rem 1.5rem", background: deleting ? "#adb5bd" : "#dc2626", color: "#fff", border: "none", borderRadius: 10, cursor: deleting ? "not-allowed" : "pointer", fontWeight: 700, fontSize: ".9rem", fontFamily: "inherit" }}>
                {deleting ? "Desactivando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Export Modal ── */}
      {showExportModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowExportModal(false); }}
        >
          <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #10b981, #065f46)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                📄
              </div>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", margin: 0 }}>Exportar Recetas</h2>
                <p style={{ fontSize: ".8rem", color: "#6c757d", marginTop: ".15rem" }}>Selecciona qué productos incluir en el PDF</p>
              </div>
            </div>

            {/* Filter options */}
            <div style={{ display: "flex", flexDirection: "column", gap: ".65rem", marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "flex", alignItems: "center", gap: ".85rem",
                  padding: "1rem 1.2rem", borderRadius: 12,
                  border: `2px solid ${exportFilter === "all" ? "#10b981" : "#e9ecef"}`,
                  background: exportFilter === "all" ? "#f0fdf4" : "#fff",
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                <input type="radio" name="exportFilter" value="all" checked={exportFilter === "all"} onChange={() => { setExportFilter("all"); setExportCategoryId(""); }} style={{ accentColor: "#10b981", width: 16, height: 16 }} />
                <div>
                  <p style={{ fontWeight: 700, color: "#111", fontSize: ".9rem", margin: 0 }}>Todos los productos</p>
                  <p style={{ fontSize: ".78rem", color: "#6c757d", marginTop: ".1rem" }}>Catálogo completo de recetas activas</p>
                </div>
              </label>

              <label
                style={{
                  display: "flex", alignItems: "flex-start", gap: ".85rem",
                  padding: "1rem 1.2rem", borderRadius: 12,
                  border: `2px solid ${exportFilter === "category" ? "#10b981" : "#e9ecef"}`,
                  background: exportFilter === "category" ? "#f0fdf4" : "#fff",
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                <input type="radio" name="exportFilter" value="category" checked={exportFilter === "category"} onChange={() => setExportFilter("category")} style={{ accentColor: "#10b981", width: 16, height: 16, marginTop: ".2rem" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: "#111", fontSize: ".9rem", margin: 0, marginBottom: ".4rem" }}>Por categoría</p>
                  {exportFilter === "category" && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Combobox
                        value={exportCategoryId}
                        onChange={(v) => setExportCategoryId(v === "" ? "" : Number(v))}
                        options={categories.map((c) => ({ value: c.id, label: c.name }))}
                        placeholder="— Elige una categoría —"
                        accent="#10b981"
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={{ padding: ".65rem 1.5rem", border: "1.5px solid #e9ecef", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: ".9rem", fontWeight: 500, fontFamily: "inherit", color: "#6c757d" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={exporting || (exportFilter === "category" && !exportCategoryId)}
                style={{
                  padding: ".65rem 1.75rem",
                  background: exporting || (exportFilter === "category" && !exportCategoryId)
                    ? "#adb5bd"
                    : "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff", border: "none", borderRadius: 10,
                  cursor: exporting || (exportFilter === "category" && !exportCategoryId) ? "not-allowed" : "pointer",
                  fontWeight: 700, fontSize: ".9rem", fontFamily: "inherit",
                  boxShadow: exporting || (exportFilter === "category" && !exportCategoryId) ? "none" : "0 4px 14px rgba(16,185,129,.3)",
                }}
              >
                {exporting ? "Generando…" : "📄 Exportar PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ingredient Form ──────────────────────────────────────────────────────────
function IngredientForm({
  initial,
  onBack,
  onSaved,
}: {
  initial?: any;
  onBack: () => void;
  onSaved: (i: any) => void;
}) {
  const isEdit = !!initial?.id;
  const [name, setName]                 = useState(initial?.name ?? "");
  const [category, setCategory]         = useState<"comestible" | "plastico" | "helado">(initial?.category ?? "comestible");
  const isHelado = category === "helado";
  const [minThreshold, setMinThreshold] = useState(String(initial?.minThreshold ?? "0"));
  const [stockQuantity, setStockQuantity] = useState(String(initial?.stockQuantity ?? "0"));
  const [active, setActive]             = useState(initial?.active ?? true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      // Sin unidad de medida: la cantidad de cada ingrediente se define en la receta del producto.
      // La columna sigue siendo obligatoria en la BD, así que al crear se guarda vacía
      // (el backend la pone en "lb" si es helado).
      const payload = { name, category, ...(isEdit ? {} : { unit: "" }), minThreshold: Number(minThreshold ?? 0), stockQuantity: Number(stockQuantity ?? 0), active };
      const saved = isEdit
        ? await api.updateIngredient(initial.id, payload)
        : await api.createIngredient(payload);
      onSaved(saved as any);
    } catch (e: any) {
      setError(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: ".65rem .85rem",
    border: "1.5px solid #e9ecef", borderRadius: 10,
    fontSize: ".9rem", fontFamily: "inherit", color: "#111",
    outline: "none", background: "#fafafa", transition: "border-color .15s",
  };
  const focus = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = "#ec0927"; };
  const blur  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = "#e9ecef"; };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem", animation: "pageEnter .35s cubic-bezier(.4,0,.2,1)" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "0" }}>
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".5rem .9rem", border: "1.5px solid #e9ecef", borderRadius: 9, background: "#fff", cursor: "pointer", fontSize: ".82rem", fontWeight: 600, color: "#6c757d", fontFamily: "inherit", flexShrink: 0, marginTop: ".25rem" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ec0927"; e.currentTarget.style.color = "#ec0927"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e9ecef"; e.currentTarget.style.color = "#6c757d"; }}
        >
          ← Volver
        </button>
        <PageHeader
          title={isEdit ? "Editar Ingrediente" : "Nuevo Ingrediente"}
          subtitle={isEdit ? `Modificando: ${initial.name}` : "Completa los campos para registrar un ingrediente en el inventario"}
        />
      </div>

      {/* ── Información básica ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#adb5bd", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#ec0927" }} />
          Información Básica
        </p>

        {/* Tipo de ingrediente */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".5rem" }}>Tipo *</label>
          <div style={{ display: "flex", gap: ".6rem" }}>
            {([
              { value: "comestible", label: "🍓 Comestible", desc: "Ingredientes comestibles" },
              { value: "helado",     label: "🍨 Helado",     desc: "Por libra — en recetas se usa en bolitas" },
              { value: "plastico",   label: "🛍️ Plástico",   desc: "Vasos, pitillos, tapas…" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategory(opt.value)}
                style={{
                  flex: 1, padding: ".7rem 1rem", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                  border: `2px solid ${category === opt.value ? "#ec0927" : "#e9ecef"}`,
                  background: category === opt.value ? "#fff0f2" : "#fafafa",
                  transition: "all .15s", textAlign: "left",
                }}
              >
                <div style={{ fontSize: ".9rem", fontWeight: 700, color: category === opt.value ? "#ec0927" : "#374151" }}>{opt.label}</div>
                <div style={{ fontSize: ".72rem", color: "#9ca3af", marginTop: ".1rem" }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Nombre *</label>
          <input style={inp} value={name} placeholder="Ej. Leche, Azúcar, Fresas…" onChange={(e) => setName(e.target.value)} onFocus={focus} onBlur={blur} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: isEdit ? "1rem" : "0" }}>
          <div>
            <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Stock mínimo{isHelado ? " (libras)" : ""}</label>
            <input type="number" style={inp} value={minThreshold} placeholder="0" min={0} step="any" onChange={(e) => setMinThreshold(e.target.value)} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: ".4rem" }}>Stock actual{isHelado ? " (libras)" : ""}</label>
            <input type="number" style={inp} value={stockQuantity} placeholder="0" min={0} step="any" onChange={(e) => setStockQuantity(e.target.value)} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        {isEdit && (
          <label style={{ display: "flex", alignItems: "center", gap: ".6rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: "#ec0927", width: 16, height: 16 }} />
            <span style={{ fontSize: ".88rem", fontWeight: 500, color: "#343a40" }}>Ingrediente activo (disponible para recetas)</span>
          </label>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: ".85rem 1rem", borderRadius: 10, background: "#fff5f5", border: "1px solid #fecaca", color: "#dc2626", fontSize: ".85rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
        <button onClick={onBack} style={{ padding: ".65rem 1.5rem", border: "1.5px solid #e9ecef", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: ".9rem", fontWeight: 500, fontFamily: "inherit", color: "#6c757d" }}>
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !name}
          style={{ padding: ".65rem 2rem", background: saving || !name ? "#adb5bd" : "#ec0927", color: "#fff", border: "none", borderRadius: 10, cursor: saving || !name ? "not-allowed" : "pointer", fontWeight: 700, fontSize: ".9rem", fontFamily: "inherit" }}
        >
          {saving ? "Guardando…" : isEdit ? "✓ Guardar cambios" : "+ Crear ingrediente"}
        </button>
      </div>
    </div>
  );
}

// ─── Ingredients Panel ────────────────────────────────────────────────────────
function IngredientsPanel() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [view, setView]               = useState<"list" | "form">("list");
  const [editing, setEditing]         = useState<any | null>(null);
  const [page, setPage]               = useState(1);
  const [filterTab, setFilterTab]     = useState<"all" | "comestible" | "plastico" | "helado">("all");
  const [confirmDel, setConfirmDel]   = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting]       = useState(false);

  // Restock state
  const [restocking, setRestocking] = useState<{ id: number; name: string; category?: string } | null>(null);
  const [qty, setQty]               = useState("");
  const [reason, setReason]         = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  useEffect(() => {
    api.ingredients().then(setIngredients).catch(() => {});
  }, []);

  const filtered = filterTab === "all" ? ingredients : ingredients.filter((i) => i.category === filterTab);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeTab(tab: "all" | "comestible" | "plastico" | "helado") {
    setFilterTab(tab);
    setPage(1);
  }

  async function handleDelete() {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await api.deleteIngredient(confirmDel.id);
      setIngredients((prev) => {
        const next = prev.filter((i) => i.id !== confirmDel.id);
        const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        if (page > maxPage) setPage(maxPage);
        return next;
      });
      setSuccess(`Ingrediente "${confirmDel.name}" eliminado.`);
      setConfirmDel(null);
    } catch (e: any) {
      setError(e.message ?? "Error al desactivar");
      setConfirmDel(null);
    } finally {
      setDeleting(false);
    }
  }

  function closeRestock() {
    setRestocking(null);
    setQty("");
    setReason("");
  }

  async function handleRestock() {
    if (!restocking || !qty) return;
    setSaving(true);
    try {
      await api.restock(restocking.id, Number(qty), reason || "Reabastecimiento");
      setIngredients((prev) =>
        prev.map((i) =>
          i.id === restocking.id
            ? { ...i, stockQuantity: Number(i.stockQuantity) + Number(qty) }
            : i,
        ),
      );
      closeRestock();
      setSuccess(`Se agregaron ${qty} ${restocking.category === "helado" ? "libras" : "unidades"} a "${restocking.name}" correctamente.`);
    } catch (e: any) {
      setError(e.message ?? "Error al reabastecer");
    } finally {
      setSaving(false);
    }
  }

  function handleSaved(saved: any) {
    if (editing) {
      setIngredients((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
    } else {
      setIngredients((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setEditing(null);
    setView("list");
  }

  if (view === "form") {
    return <IngredientForm initial={editing ?? undefined} onBack={() => { setEditing(null); setView("list"); }} onSaved={handleSaved} />;
  }

  const ghostBtn: React.CSSProperties = { padding: ".3rem .75rem", border: "1.5px solid #dee2e6", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: ".78rem", fontWeight: 700, fontFamily: "inherit", color: "#343a40" };
  const primaryBtn: React.CSSProperties = { padding: ".3rem .75rem", border: "none", borderRadius: 8, background: "#ec0927", cursor: "pointer", fontSize: ".78rem", fontWeight: 700, fontFamily: "inherit", color: "#fff" };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem", animation: "pageEnter .35s cubic-bezier(.4,0,.2,1)" }}>
      <PageHeader title="Ingredientes" subtitle="Gestión de ingredientes y niveles de stock" />

      {/* ── Tabs de tipo ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".45rem", marginBottom: "1rem" }}>
        {([
          { key: "all",        label: "Todos",       emoji: "🔍", count: ingredients.length },
          { key: "comestible", label: "Comestibles", emoji: "🍓", count: ingredients.filter((i) => i.category === "comestible" || !i.category).length },
          { key: "helado",     label: "Helados",     emoji: "🍨", count: ingredients.filter((i) => i.category === "helado").length },
          { key: "plastico",   label: "Plásticos",   emoji: "🛍️", count: ingredients.filter((i) => i.category === "plastico").length },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => changeTab(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: ".4rem",
              padding: ".45rem 1rem", borderRadius: 99, fontFamily: "inherit",
              border: `1.5px solid ${filterTab === tab.key ? "#ec0927" : "#e9ecef"}`,
              background: filterTab === tab.key ? "#fff0f2" : "#fff",
              color: filterTab === tab.key ? "#ec0927" : "#6c757d",
              fontWeight: filterTab === tab.key ? 700 : 500,
              fontSize: ".82rem", cursor: "pointer", transition: "all .15s",
            }}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            <span style={{ padding: ".1rem .45rem", borderRadius: 99, background: filterTab === tab.key ? "#ec0927" : "#f1f3f5", color: filterTab === tab.key ? "#fff" : "#9ca3af", fontSize: ".7rem", fontWeight: 700 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Crear card ── */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          role="button" tabIndex={0}
          onClick={() => { setEditing(null); setView("form"); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setEditing(null); setView("form"); } }}
          style={{ background: "linear-gradient(135deg, #fff0f2 0%, #fff8f5 55%, #f0f5ff 100%)", border: "2px dashed rgba(236,9,39,.35)", borderRadius: 16, padding: "1.35rem 2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #ffe0e5 0%, #fff0e8 55%, #e0ebff 100%)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(236,9,39,.12)"; e.currentTarget.style.borderColor = "rgba(236,9,39,.6)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #fff0f2 0%, #fff8f5 55%, #f0f5ff 100%)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(236,9,39,.35)"; }}
        >
          <div>
            <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#ec0927", textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: ".2rem" }}>Nuevo ingrediente</p>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1a1d23", letterSpacing: "-.2px" }}>¿Necesitás registrar un insumo?</h3>
            <p style={{ fontSize: ".8rem", color: "#9ca3af", marginTop: ".2rem" }}>Agrega ingredientes como leche, azúcar o frutas para controlar tu inventario</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
            <span style={{ fontSize: "2.5rem" }}>🧪</span>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #ec0927, #7a0000)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.5rem", fontWeight: 700, boxShadow: "0 4px 14px rgba(236,9,39,.35)" }}>+</div>
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["#", "Nombre", "Tipo", "Stock actual", "Mínimo", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ padding: ".9rem 1.25rem", textAlign: "left", fontWeight: 600, color: "#6c757d", fontSize: ".8rem", textTransform: "uppercase", letterSpacing: ".4px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((i, idx) => {
              const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
              const low = Number(i.stockQuantity) <= Number(i.minThreshold);
              return (
                <tr key={i.id} style={{ borderTop: "1px solid #f1f3f5", background: low && i.active ? "#fff8f8" : "transparent" }}>
                  <td style={{ padding: ".85rem 1.25rem", color: "#adb5bd", fontSize: ".8rem", fontWeight: 600 }}>{globalIdx}</td>
                  <td style={{ padding: ".85rem 1.25rem", fontWeight: 600, color: "#111" }}>{i.name}</td>
                  <td style={{ padding: ".85rem 1.25rem" }}>
                    {i.category === "plastico" ? (
                      <span style={{ padding: ".22rem .65rem", borderRadius: 99, fontSize: ".72rem", fontWeight: 700, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>🛍️ Plástico</span>
                    ) : i.category === "helado" ? (
                      <span style={{ padding: ".22rem .65rem", borderRadius: 99, fontSize: ".72rem", fontWeight: 700, background: "#fdf2f8", color: "#be185d", border: "1px solid #fbcfe8" }}>🍨 Helado</span>
                    ) : (
                      <span style={{ padding: ".22rem .65rem", borderRadius: 99, fontSize: ".72rem", fontWeight: 700, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>🍓 Comestible</span>
                    )}
                  </td>
                  <td style={{ padding: ".85rem 1.25rem", fontWeight: 700, color: low && i.active ? "#c0071e" : "#28a745" }}>
                    {Number(i.stockQuantity).toFixed(2)}{i.category === "helado" ? " lb" : ""}
                  </td>
                  <td style={{ padding: ".85rem 1.25rem", color: "#6c757d" }}>{Number(i.minThreshold).toFixed(2)}{i.category === "helado" ? " lb" : ""}</td>
                  <td style={{ padding: ".85rem 1.25rem" }}>
                    <span style={{ padding: ".3rem .8rem", borderRadius: 99, fontSize: ".78rem", fontWeight: 700, background: i.active ? "#d4edda" : "#f8d7da", color: i.active ? "#155724" : "#721c24" }}>
                      {i.active ? "● Activo" : "○ Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: ".85rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: ".45rem", flexWrap: "wrap" }}>
                      <button onClick={() => { setEditing(i); setView("form"); }} style={ghostBtn}>Editar</button>
                      <button onClick={() => setRestocking({ id: i.id, name: i.name, category: i.category })} style={primaryBtn}>+ Reabastecer</button>
                      <button
                        onClick={() => setConfirmDel({ id: i.id, name: i.name })}
                        style={{ padding: ".3rem .75rem", border: "1.5px solid #fecaca", borderRadius: 8, background: "#fff5f5", cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit", color: "#dc2626", fontWeight: 600 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#f87171"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "#fecaca"; }}
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!ingredients.length && (
          <p style={{ padding: "2rem", textAlign: "center", color: "#adb5bd" }}>No hay ingredientes</p>
        )}
        <Pagination total={filtered.length} page={page} onChange={setPage} />
      </div>

      {/* ── Confirmar eliminación definitiva ── */}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", margin: "0 0 .4rem" }}>Desactivar ingrediente</h2>
            <p style={{ color: "#6c757d", fontSize: ".88rem", margin: "0 0 1.5rem" }}>
              ¿Desactivar <strong>{confirmDel.name}</strong>? Dejará de aparecer en la lista.
            </p>
            <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDel(null)} disabled={deleting} style={{ padding: ".5rem 1rem", border: "1.5px solid #dee2e6", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: ".85rem", fontFamily: "inherit", color: "#343a40" }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: ".5rem 1rem", border: "none", borderRadius: 8, background: "#dc2626", cursor: deleting ? "not-allowed" : "pointer", fontSize: ".85rem", fontFamily: "inherit", color: "#fff", fontWeight: 700, opacity: deleting ? .7 : 1 }}>
                {deleting ? "Desactivando…" : "Sí, desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reabastecer ── */}
      <GlassDialog open={!!restocking} title={`Reabastecer: ${restocking?.name}`} onClose={closeRestock}>
        <GlassField label={restocking?.category === "helado" ? "Libras a agregar" : "Cantidad a agregar"}>
          <input type="number" className="g-inp" placeholder="Ej. 10" value={qty} min={0} step="any" onChange={(e) => setQty(e.target.value)} />
        </GlassField>
        <GlassField label="Razón (opcional)">
          <input className="g-inp" placeholder="Reabastecimiento periódico..." value={reason} onChange={(e) => setReason(e.target.value)} />
        </GlassField>
        <GlassActions onCancel={closeRestock} onConfirm={handleRestock} loading={saving} confirmDisabled={!qty} />
      </GlassDialog>

      <SuccessModal
        open={!!success}
        title={success.startsWith("Se agregaron") ? "¡Reabastecido!" : "¡Listo!"}
        message={success}
        onClose={() => setSuccess("")}
      />
      <ErrorModal
        open={!!error}
        title="Error"
        message={error}
        onClose={() => setError("")}
      />
    </div>
  );
}

// ─── Inventory Panel (stock overview) ─────────────────────────────────────────
function InventoryPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [paletas, setPaletas] = useState<any[]>([]);

  useEffect(() => {
    api.ingredients().then(setItems).catch(() => {});
    api.products(true, "paleteria").then(setPaletas).catch(() => {});
  }, []);

  const [view, setView] = useState<"all" | "ingredients" | "paletas">("all");
  const showIng = view !== "paletas";
  const showPal = view !== "ingredients";

  // Agotadas primero para que se vean las que hay que reponer
  const paletasSorted = [...paletas].sort((a, b) => Number(a.stockQuantity) - Number(b.stockQuantity) || a.name.localeCompare(b.name));
  const palAgotadas = paletas.filter((p) => !(Number(p.stockQuantity) > 0));

  const low = items.filter((i) => i.active && Number(i.stockQuantity) <= Number(i.minThreshold));
  const ok  = items.filter((i) => i.active && Number(i.stockQuantity) >  Number(i.minThreshold));
  const activeIng = items.filter((i) => i.active);

  // Resumen según la vista: ingredientes con stock ≤ mínimo y paletas en 0 cuentan como "stock bajo"
  const summary = {
    total: (showIng ? activeIng.length : 0) + (showPal ? paletas.length : 0),
    low:   (showIng ? low.length : 0) + (showPal ? palAgotadas.length : 0),
    ok:    (showIng ? ok.length : 0) + (showPal ? paletas.length - palAgotadas.length : 0),
  };

  function printInventory() {
    const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
    const now = new Date();
    const fecha = `${now.toLocaleDateString("es-GT", { dateStyle: "long" })} — ${now.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}`;
    const ingRows = [...activeIng]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((i) => {
        const isLow = Number(i.stockQuantity) <= Number(i.minThreshold);
        return `<tr class="${isLow ? "low" : ""}"><td>${esc(i.name)}</td><td class="num">${Number(i.stockQuantity).toFixed(2)} ${esc(i.unit)}</td><td class="num">${Number(i.minThreshold).toFixed(2)} ${esc(i.unit)}</td><td>${isLow ? "⚠ Bajo" : "OK"}</td></tr>`;
      })
      .join("");
    const palRows = [...paletas]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => {
        const qty = Number(p.stockQuantity) || 0;
        return `<tr class="${qty > 0 ? "" : "low"}"><td>${esc(p.name)}</td><td>${esc(p.category?.name)}</td><td class="num">${qty} u.</td><td>${qty > 0 ? "OK" : "⚠ Agotada"}</td></tr>`;
      })
      .join("");
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Inventario Sarita</title>
<style>
  @page { margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 11pt; margin: 0; }
  h1 { font-size: 18pt; margin: 0; color: #ec0927; }
  .meta { color: #555; font-size: 9.5pt; margin: 2px 0 14px; }
  h2 { font-size: 12pt; margin: 18px 0 6px; border-bottom: 2px solid #111; padding-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 9pt; text-transform: uppercase; color: #555; border-bottom: 1px solid #999; padding: 5px 6px; }
  td { padding: 5px 6px; border-bottom: 1px solid #ddd; }
  td.num { text-align: right; white-space: nowrap; }
  th.num { text-align: right; }
  tr.low td { font-weight: 700; }
  .empty { color: #888; font-style: italic; }
  .sign { margin-top: 36px; display: flex; gap: 40px; font-size: 9.5pt; color: #555; }
  .sign div { flex: 1; border-top: 1px solid #999; padding-top: 4px; }
</style></head><body>
  <h1>Sarita — Inventario</h1>
  <div class="meta">${esc(fecha)}</div>
  ${showIng ? `<h2>Ingredientes (${activeIng.length})</h2>
  <table><thead><tr><th>Ingrediente</th><th class="num">Stock actual</th><th class="num">Mínimo</th><th>Estado</th></tr></thead>
  <tbody>${ingRows || `<tr><td colspan="4" class="empty">No hay ingredientes activos</td></tr>`}</tbody></table>` : ""}
  ${showPal ? `<h2>Paletería (${paletas.length}) — ${paletas.reduce((n, p) => n + (Number(p.stockQuantity) || 0), 0)} unidades</h2>
  <table><thead><tr><th>Paleta</th><th>Categoría</th><th class="num">Existencia</th><th>Estado</th></tr></thead>
  <tbody>${palRows || `<tr><td colspan="4" class="empty">No hay paletas activas</td></tr>`}</tbody></table>` : ""}
  <div class="sign"><div>Revisado por</div><div>Firma</div></div>
</body></html>`;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open(); doc.write(html); doc.close();
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  }

  const row = (i: any) => {
    const diff = Number(i.stockQuantity) - Number(i.minThreshold);
    return (
      <tr key={i.id} style={{ borderTop: "1px solid #f1f3f5" }}>
        <td style={{ padding: ".85rem 1.25rem", fontWeight: 600, color: "#111" }}>{i.name}</td>
        <td style={{ padding: ".85rem 1.25rem", fontWeight: 700, color: diff < 0 ? "#c0071e" : "#28a745" }}>
          {Number(i.stockQuantity).toFixed(2)} {i.unit}
        </td>
        <td style={{ padding: ".85rem 1.25rem", color: "#6c757d" }}>
          {Number(i.minThreshold).toFixed(2)} {i.unit}
        </td>
        <td style={{ padding: ".85rem 1.25rem" }}>
          <span style={{ padding: ".25rem .6rem", borderRadius: 99, fontSize: ".75rem", fontWeight: 700, background: diff < 0 ? "#f8d7da" : "#d4edda", color: diff < 0 ? "#721c24" : "#155724" }}>
            {diff < 0 ? `⚠ Bajo ${Math.abs(diff).toFixed(2)}` : `✓ OK +${diff.toFixed(2)}`}
          </span>
        </td>
      </tr>
    );
  };

  const tableWrap: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #e9ecef", overflow: "hidden", marginBottom: "1.5rem" };
  const thead = (
    <tr style={{ background: "#f8f9fa" }}>
      {["Ingrediente", "Stock actual", "Mínimo", "Estado"].map((h) => (
        <th key={h} style={{ padding: ".9rem 1.25rem", textAlign: "left", fontWeight: 600, color: "#6c757d", fontSize: ".8rem", textTransform: "uppercase", letterSpacing: ".4px" }}>{h}</th>
      ))}
    </tr>
  );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem", animation: "pageEnter .35s cubic-bezier(.4,0,.2,1)" }}>
      <PageHeader title="Inventario" subtitle="Vista de niveles de stock por ingrediente y existencia de paletas" />

      {/* Vista + imprimir */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".45rem" }}>
          {([
            { key: "all",         label: "Todo",         emoji: "📦", count: activeIng.length + paletas.length },
            { key: "ingredients", label: "Ingredientes", emoji: "🧪", count: activeIng.length },
            { key: "paletas",     label: "Paletería",    emoji: "🍡", count: paletas.length },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              style={{
                display: "flex", alignItems: "center", gap: ".4rem",
                padding: ".45rem 1rem", borderRadius: 99, fontFamily: "inherit",
                border: `1.5px solid ${view === tab.key ? "#ec0927" : "#e9ecef"}`,
                background: view === tab.key ? "#fff0f2" : "#fff",
                color: view === tab.key ? "#ec0927" : "#6c757d",
                fontWeight: view === tab.key ? 700 : 500,
                fontSize: ".82rem", cursor: "pointer", transition: "all .15s",
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span style={{ padding: ".1rem .45rem", borderRadius: 99, background: view === tab.key ? "#ec0927" : "#f1f3f5", color: view === tab.key ? "#fff" : "#9ca3af", fontSize: ".7rem", fontWeight: 700 }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={printInventory}
          style={{ display: "flex", alignItems: "center", gap: ".45rem", padding: ".55rem 1.1rem", border: "none", borderRadius: 10, background: "#ec0927", color: "#fff", cursor: "pointer", fontSize: ".85rem", fontWeight: 700, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(236,9,39,.25)" }}
        >
          🖨 Imprimir inventario
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        {[
          { label: "Total activos", value: summary.total, color: "#3b5bdb", bg: "#eff6ff" },
          { label: "Stock bajo",    value: summary.low,   color: "#c0071e", bg: "#fff5f5" },
          { label: "Stock OK",      value: summary.ok,    color: "#155724", bg: "#f0fdf4" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: bg, borderRadius: 14, padding: "1.1rem 1.4rem", border: `1px solid ${color}22` }}>
            <p style={{ margin: 0, fontSize: ".78rem", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</p>
            <p style={{ margin: ".25rem 0 0", fontSize: "2rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Low stock section */}
      {showIng && low.length > 0 && (
        <>
          <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: "#c0071e", textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 .75rem" }}>⚠ Requieren reabastecimiento</h3>
          <div style={tableWrap}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
              <thead>{thead}</thead>
              <tbody>{low.map(row)}</tbody>
            </table>
          </div>
        </>
      )}

      {/* OK section */}
      {showIng && ok.length > 0 && (
        <>
          <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: "#155724", textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 .75rem" }}>✓ Stock suficiente</h3>
          <div style={tableWrap}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
              <thead>{thead}</thead>
              <tbody>{ok.map(row)}</tbody>
            </table>
          </div>
        </>
      )}

      {showIng && !items.length && (
        <p style={{ padding: "2rem", textAlign: "center", color: "#adb5bd" }}>No hay ingredientes registrados</p>
      )}

      {/* Paletería: se vende por unidad, la existencia vive en el producto */}
      {showPal && (<>
      <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: ".5px", margin: "1rem 0 .75rem" }}>
        🍡 Paletería — existencia · {paletas.reduce((n, p) => n + (Number(p.stockQuantity) || 0), 0)} unidades
      </h3>
      <div style={tableWrap}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["Paleta", "Categoría", "Existencia", "Estado"].map((h) => (
                <th key={h} style={{ padding: ".9rem 1.25rem", textAlign: "left", fontWeight: 600, color: "#6c757d", fontSize: ".8rem", textTransform: "uppercase", letterSpacing: ".4px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paletasSorted.map((p) => {
              const qty = Number(p.stockQuantity) || 0;
              return (
                <tr key={p.id} style={{ borderTop: "1px solid #f1f3f5" }}>
                  <td style={{ padding: ".85rem 1.25rem", fontWeight: 600, color: "#111" }}>{p.name}</td>
                  <td style={{ padding: ".85rem 1.25rem", color: "#6c757d" }}>{p.category?.name}</td>
                  <td style={{ padding: ".85rem 1.25rem", fontWeight: 700, color: qty > 0 ? "#28a745" : "#c0071e" }}>{qty} u.</td>
                  <td style={{ padding: ".85rem 1.25rem" }}>
                    <span style={{ padding: ".25rem .6rem", borderRadius: 99, fontSize: ".75rem", fontWeight: 700, background: qty > 0 ? "#d4edda" : "#f8d7da", color: qty > 0 ? "#155724" : "#721c24" }}>
                      {qty > 0 ? "✓ Disponible" : "⚠ Agotada"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!paletas.length && (
              <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#adb5bd" }}>No hay paletas activas</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </>)}
    </div>
  );
}

// ─── Users Panel ──────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.users(), api.roles()])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(r);
      })
      .catch(() => {});
  }, []);

  async function handleDelete(u: any) {
    if (!window.confirm(`¿Desactivar al usuario "${u.name}"? Dejará de aparecer en la lista.`)) return;
    try {
      await api.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setSuccess(`Usuario "${u.name}" eliminado.`);
    } catch (e: any) {
      setError(e.message ?? "Error al desactivar");
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (form.id) {
        const u = (await api.updateUser(form.id, form)) as any;
        setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
        setSuccess(`Usuario "${u.name}" actualizado.`);
      } else {
        const u = (await api.createUser(form)) as any;
        setUsers((prev) => [...prev, u]);
        setSuccess(`Usuario "${u.name}" creado.`);
      }
      setForm(null);
    } catch (e: any) {
      setError(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        animation: "pageEnter .35s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <PageHeader
        title="Usuarios"
        subtitle="Administración de cuentas y accesos del sistema"
        action={
          <button
            onClick={() =>
              setForm({
                name: "",
                email: "",
                password: "",
                roleId: roles[0]?.id,
                telegramChatId: "",
              })
            }
            style={{
              padding: ".55rem 1.1rem",
              background: "#ec0927",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: ".88rem",
              fontFamily: "inherit",
            }}
          >
            + Nuevo usuario
          </button>
        }
      />
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e9ecef",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: ".88rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["Nombre", "Email", "Rol", "Telegram", "Acciones"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: ".9rem 1.25rem",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#6c757d",
                    fontSize: ".8rem",
                    textTransform: "uppercase",
                    letterSpacing: ".4px",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid #f1f3f5" }}>
                <td style={{ padding: ".85rem 1.25rem", fontWeight: 600 }}>
                  {u.name}
                </td>
                <td style={{ padding: ".85rem 1.25rem", color: "#6c757d" }}>
                  {u.email}
                </td>
                <td style={{ padding: ".85rem 1.25rem" }}>
                  <span
                    style={{
                      background: "#fff0f2",
                      color: "#ec0927",
                      padding: ".25rem .6rem",
                      borderRadius: 99,
                      fontSize: ".75rem",
                      fontWeight: 700,
                    }}
                  >
                    {u.role?.name}
                  </span>
                </td>
                <td
                  style={{
                    padding: ".85rem 1.25rem",
                    color: "#adb5bd",
                    fontSize: ".8rem",
                  }}
                >
                  {u.telegramChatId ?? "—"}
                </td>
                <td style={{ padding: ".85rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: ".45rem" }}>
                    <button
                      onClick={() =>
                        setForm({ ...u, roleId: u.role?.id, password: "" })
                      }
                      style={{
                        padding: ".3rem .8rem",
                        border: "1.5px solid #dee2e6",
                        borderRadius: 8,
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: ".78rem",
                        fontFamily: "inherit",
                        color: "#343a40",
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => handleDelete(u)} style={{ padding: ".3rem .8rem", border: "1.5px solid #fecaca", borderRadius: 8, background: "#fff5f5", cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit", color: "#dc2626", fontWeight: 600 }}>
                      Desactivar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && (
          <p style={{ padding: "2rem", textAlign: "center", color: "#adb5bd" }}>
            No hay usuarios
          </p>
        )}
      </div>
      <GlassDialog
        open={!!form}
        title={form?.id ? "Editar usuario" : "Nuevo usuario"}
        onClose={() => setForm(null)}
      >
        {[
          { key: "name", label: "Nombre", type: "text" },
          { key: "email", label: "Email", type: "email" },
          {
            key: "password",
            label: form?.id
              ? "Nueva contraseña (vacío = sin cambio)"
              : "Contraseña",
            type: "password",
          },
          { key: "telegramChatId", label: "Telegram Chat ID", type: "text" },
        ].map(({ key, label, type }) => (
          <GlassField key={key} label={label}>
            <input
              type={type}
              className="g-inp"
              value={form?.[key] ?? ""}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, [key]: e.target.value }))
              }
            />
          </GlassField>
        ))}
        <GlassField label="Rol">
          <select
            className="g-sel"
            value={form?.roleId ?? ""}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, roleId: Number(e.target.value) }))
            }
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </GlassField>
        <GlassActions
          onCancel={() => setForm(null)}
          onConfirm={handleSave}
          loading={saving}
        />
      </GlassDialog>
      <SuccessModal
        open={!!success}
        title="¡Listo!"
        message={success}
        onClose={() => setSuccess("")}
      />
      <ErrorModal
        open={!!error}
        title="Error"
        message={error}
        onClose={() => setError("")}
      />
    </div>
  );
}

// ─── Roles Panel ──────────────────────────────────────────────────────────────
function RolesPanel() {
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .roles()
      .then(setRoles)
      .catch(() => {});
  }, []);

  async function handleDelete(r: any) {
    if (!window.confirm(`¿Desactivar el rol "${r.name}"? Dejará de aparecer en la lista.`)) return;
    try {
      await api.deleteRole(r.id);
      setRoles((prev) => prev.filter((x) => x.id !== r.id));
      setSuccess(`Rol "${r.name}" eliminado.`);
    } catch (e: any) {
      setError(e.message ?? "Error al desactivar");
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (form.id) {
        const r = (await api.updateRole(form.id, form)) as any;
        setRoles((prev) => prev.map((x) => (x.id === r.id ? r : x)));
        setSuccess(`Rol "${r.name}" actualizado.`);
      } else {
        const r = (await api.createRole(form)) as any;
        setRoles((prev) => [...prev, r]);
        setSuccess(`Rol "${r.name}" creado.`);
      }
      setForm(null);
    } catch (e: any) {
      setError(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        animation: "pageEnter .35s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <PageHeader
        title="Roles"
        subtitle="Configuración de roles y permisos del sistema"
        action={
          <button
            onClick={() =>
              setForm({ name: "", description: "", telegramNotify: false })
            }
            style={{
              padding: ".55rem 1.1rem",
              background: "#ec0927",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: ".88rem",
              fontFamily: "inherit",
            }}
          >
            + Nuevo rol
          </button>
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {roles.map((r) => (
          <div
            key={r.id}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e9ecef",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: ".5rem",
              }}
            >
              <h3
                style={{ fontWeight: 700, fontSize: ".95rem", color: "#111" }}
              >
                {r.name}
              </h3>
              {r.telegramNotify && (
                <span
                  style={{
                    background: "#d4edda",
                    color: "#155724",
                    fontSize: ".7rem",
                    fontWeight: 700,
                    padding: ".2rem .5rem",
                    borderRadius: 99,
                  }}
                >
                  📲 Telegram
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: ".82rem",
                color: "#6c757d",
                marginBottom: ".75rem",
              }}
            >
              {r.description}
            </p>
            <button
              onClick={() => setForm({ ...r })}
              style={{
                width: "100%",
                padding: ".5rem",
                border: "1.5px solid #dee2e6",
                borderRadius: 8,
                background: "transparent",
                cursor: "pointer",
                fontSize: ".8rem",
                fontFamily: "inherit",
                color: "#6c757d",
                fontWeight: 500,
              }}
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(r)}
              style={{ width: "100%", marginTop: ".5rem", padding: ".5rem", border: "1.5px solid #fecaca", borderRadius: 8, background: "#fff5f5", cursor: "pointer", fontSize: ".8rem", fontFamily: "inherit", color: "#dc2626", fontWeight: 600 }}
            >
              Desactivar
            </button>
          </div>
        ))}
      </div>
      <GlassDialog
        open={!!form}
        title={form?.id ? "Editar rol" : "Nuevo rol"}
        onClose={() => setForm(null)}
      >
        <GlassField label="Nombre del rol">
          <input
            className="g-inp"
            value={form?.name ?? ""}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, name: e.target.value }))
            }
          />
        </GlassField>
        <GlassField label="Descripción">
          <input
            className="g-inp"
            value={form?.description ?? ""}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, description: e.target.value }))
            }
          />
        </GlassField>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".6rem",
            marginBottom: "1.25rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            className="g-chk"
            checked={form?.telegramNotify ?? false}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, telegramNotify: e.target.checked }))
            }
          />
          <span
            style={{
              fontSize: ".85rem",
              fontWeight: 500,
              color: "rgba(255,255,255,.75)",
            }}
          >
            Recibir alertas de Telegram
          </span>
        </label>
        <GlassActions
          onCancel={() => setForm(null)}
          onConfirm={handleSave}
          loading={saving}
          confirmDisabled={!form?.name}
        />
      </GlassDialog>
      <SuccessModal
        open={!!success}
        title="¡Listo!"
        message={success}
        onClose={() => setSuccess("")}
      />
      <ErrorModal
        open={!!error}
        title="Error"
        message={error}
        onClose={() => setError("")}
      />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function AdminApp({ userName }: { userName: string }) {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobile = useIsMobile();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: "antialiased" } as any}>
      <style>{GLOBAL_STYLES}</style>
      {mobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 250 }} />
      )}
      <GlassNavbar
        active={active}
        onChange={(id) => { setActive(id); setMobileOpen(false); }}
        userName={userName}
        collapsed={mobile ? false : collapsed}
        mobile={mobile}
        open={mobileOpen}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar active={active} userName={userName} onToggle={() => (mobile ? setMobileOpen((o) => !o) : setCollapsed((c) => !c))} />
        <main style={{ flex: 1, background: "#e9edf2", overflow: "auto" }}>
          {active === "dashboard" && <Dashboard />}
          {active === "products"     && <ProductsPanel />}
          {active === "categories"   && <CategoriesPanel />}
          {active === "pal-products"   && <ProductsPanel line="paleteria" />}
          {active === "pal-categories" && <CategoriesPanel line="paleteria" />}
          {active === "ingredients"  && <IngredientsPanel />}
          {active === "inventory"    && <InventoryPanel />}
          {active === "users" && <UsersPanel />}
          {active === "roles" && <RolesPanel />}
        </main>
      </div>
    </div>
  );
}
