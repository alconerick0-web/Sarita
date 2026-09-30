import { useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ModalVariant = 'success' | 'warning' | 'confirm' | 'error';

const ICONS: Record<ModalVariant, React.ReactNode> = {
  success: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  warning: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  confirm: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  error: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

const COLORS: Record<ModalVariant, { hex: string; rgb: string; defaultLabel: string }> = {
  success: { hex: '#22c55e', rgb: '34,197,94',   defaultLabel: 'Aceptar'    },
  warning: { hex: '#f59e0b', rgb: '245,158,11',  defaultLabel: 'Entendido'  },
  confirm: { hex: '#ec0927', rgb: '236,9,39',    defaultLabel: 'Confirmar'  },
  error:   { hex: '#ec0927', rgb: '236,9,39',    defaultLabel: 'Cerrar'     },
};

// ─── Base Modal ───────────────────────────────────────────────────────────────
export interface ModalProps {
  open: boolean;
  title: string;
  message?: string;
  variant?: ModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose?: () => void;
  loading?: boolean;
}

export function Modal({
  open, title, message,
  variant = 'confirm',
  confirmLabel, cancelLabel = 'Cancelar',
  onConfirm, onClose, loading = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    // Only close on Escape when there's no destructive confirm action
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && !onConfirm && onClose) onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  const c = COLORS[variant];
  const glow   = `rgba(${c.rgb},.4)`;
  const glowSm = `rgba(${c.rgb},.15)`;
  const border = `rgba(${c.rgb},.4)`;
  const hasBoth = !!onConfirm && !!onClose;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !onConfirm && onClose) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        background: 'rgba(5,0,2,.82)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <style>{`
        @keyframes _mIn { from { opacity:0; transform:scale(.92) translateY(12px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
      <div style={{
        width: '100%', maxWidth: 400,
        padding: '2.5rem 2rem 2rem', borderRadius: 24,
        background: 'rgba(15,2,6,.92)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: `1.5px solid ${border}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,.04), 0 0 30px ${glow}, 0 0 80px ${glowSm}, 0 20px 60px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08)`,
        textAlign: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        animation: '_mIn .25s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Shimmer */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: `linear-gradient(90deg, transparent, ${c.hex}88, transparent)` }} />

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1.5rem',
          background: `rgba(${c.rgb},.12)`, border: `2px solid ${border}`, color: c.hex,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 20px ${glow}, 0 0 40px ${glowSm}`,
        }}>
          {ICONS[variant]}
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: message ? '.6rem' : '1.75rem' }}>
          {title}
        </h2>

        {message && (
          <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.6)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
          {hasBoth && (
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '.7rem 1.25rem', borderRadius: 999, border: '1.5px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.75)', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm ?? onClose}
            disabled={loading}
            style={{
              flex: hasBoth ? 1 : undefined, padding: '.7rem', minWidth: 130, borderRadius: 999,
              border: `1.5px solid ${border}`,
              background: `linear-gradient(135deg, ${c.hex}cc, ${c.hex})`,
              color: '#fff', fontSize: '.9rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              letterSpacing: '.3px', opacity: loading ? .7 : 1,
              boxShadow: `0 0 16px ${glow}, 0 4px 12px rgba(0,0,0,.3)`,
              transition: 'transform .2s, box-shadow .2s',
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 0 24px ${glow}, 0 6px 16px rgba(0,0,0,.4)`; }}}
            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 0 16px ${glow}, 0 4px 12px rgba(0,0,0,.3)`; }}}
          >
            {loading ? 'Procesando...' : (confirmLabel ?? c.defaultLabel)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Typed shortcuts ──────────────────────────────────────────────────────────
export const SuccessModal = (p: Omit<ModalProps, 'variant'>) => <Modal {...p} variant="success" />;
export const WarningModal = (p: Omit<ModalProps, 'variant'>) => <Modal {...p} variant="warning" />;
export const ConfirmModal = (p: Omit<ModalProps, 'variant'>) => <Modal {...p} variant="confirm" />;
export const ErrorModal   = (p: Omit<ModalProps, 'variant'>) => <Modal {...p} variant="error"   />;

// ─── GlassDialog — form/content modal ────────────────────────────────────────
export interface GlassDialogProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: number;
}

export function GlassDialog({ open, title, children, onClose, maxWidth = 440 }: GlassDialogProps) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        background: 'rgba(5,0,2,.82)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth,
        padding: '2rem 2rem 1.75rem', borderRadius: 24,
        background: 'rgba(15,2,6,.92)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(236,9,39,.35)',
        boxShadow: '0 0 30px rgba(236,9,39,.25), 0 0 80px rgba(236,9,39,.08), 0 20px 60px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08)',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        animation: '_mIn .25s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Glass styles for inputs inside */}
        <style>{`
          @keyframes _mIn { from { opacity:0; transform:scale(.92) translateY(12px) } to { opacity:1; transform:scale(1) translateY(0) } }
          .g-inp { width:100%; background:transparent; border:none; border-bottom:1px solid rgba(255,150,150,.3); padding:.55rem .25rem; color:rgba(255,255,255,.9); font-size:.9rem; font-family:inherit; outline:none; transition:border-bottom-color .2s; }
          .g-inp:focus { border-bottom-color:rgba(236,9,39,.7); }
          .g-inp::placeholder { color:rgba(255,255,255,.3); }
          .g-sel { width:100%; background:rgba(255,255,255,.07); border:1px solid rgba(255,150,150,.25); border-radius:8px; padding:.55rem .75rem; color:rgba(255,255,255,.85); font-size:.9rem; font-family:inherit; outline:none; }
          .g-sel option { background:#1a0005; color:#fff; }
          .g-chk { accent-color:#ec0927; width:16px; height:16px; }
        `}</style>

        {/* Shimmer */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(236,9,39,.6), transparent)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', flexShrink: 0 }}
          >×</button>
        </div>

        {children}
      </div>
    </div>
  );
}

// ─── GlassField — labeled field row ──────────────────────────────────────────
export function GlassField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: '.4rem' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── GlassActions — cancel + confirm button row ───────────────────────────────
export function GlassActions({
  cancelLabel = 'Cancelar',
  confirmLabel = 'Guardar',
  onCancel,
  onConfirm,
  loading = false,
  confirmDisabled = false,
}: {
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  loading?: boolean;
  confirmDisabled?: boolean;
}) {
  const disabled = loading || confirmDisabled;
  return (
    <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem' }}>
      <button
        onClick={onCancel}
        style={{ flex: 1, padding: '.7rem', borderRadius: 999, border: '1.5px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.75)', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
      >
        {cancelLabel}
      </button>
      <button
        type={onConfirm ? 'button' : 'submit'}
        onClick={onConfirm}
        disabled={disabled}
        style={{ flex: 1, padding: '.7rem', borderRadius: 999, border: '1.5px solid rgba(236,9,39,.4)', background: disabled ? 'rgba(150,150,150,.2)' : 'linear-gradient(135deg, #ec0927cc, #ec0927)', color: '#fff', fontSize: '.9rem', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '.3px', boxShadow: disabled ? 'none' : '0 0 16px rgba(236,9,39,.4), 0 4px 12px rgba(0,0,0,.3)', transition: 'transform .2s, box-shadow .2s' }}
        onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; }}}
        onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.transform = 'translateY(0)'; }}}
      >
        {loading ? 'Guardando...' : confirmLabel}
      </button>
    </div>
  );
}
