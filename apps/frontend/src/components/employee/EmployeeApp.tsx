import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { ErrorModal, ConfirmModal, GlassDialog } from '../ui/Modal';

type ProductStep = { id: number; stepNumber: number; description: string; requiresFlavor: boolean; flavorCount: number };
type Product  = { id: number; name: string; price: number; containerSize: string; active: boolean; steps: ProductStep[] };
type Category = { id: number; name: string; icon: string; products: Product[] };
type Flavor   = { id: number; name: string; color: string };
type FlavorSel = { flavorId?: number; flavorName?: string };
type CartItem = { product: Product; flavors: FlavorSel[]; quantity: number };

// ─── Selector de Sabores (wizard paso a paso) ────────────────────────────────
function FlavorPicker({ product, flavors, onAdd, onClose }:
  { product: Product; flavors: Flavor[]; onAdd: (items: CartItem[]) => void; onClose: () => void }) {

  // bolasBase = scoops per unit (sum of flavorCount across requiresFlavor steps)
  const bolasBase = (product.steps ?? [])
    .filter((s) => s.requiresFlavor)
    .reduce((sum, s) => sum + (s.flavorCount || 1), 0);

  const [quantity, setQuantity] = useState(1);
  const totalSlots = bolasBase * quantity;

  // step=-1 → quantity selection screen; step 0..totalSlots-1 → one scoop at a time
  const [step, setStep] = useState(bolasBase === 0 ? -1 : -1);
  const [sels, setSels] = useState<FlavorSel[]>(() => Array.from({ length: Math.max(totalSlots, 0) }, () => ({})));
  const total = Number(product.price) * quantity;

  // Resize sels when quantity changes and reset to quantity screen
  useEffect(() => {
    setSels((prev) => Array.from({ length: Math.max(bolasBase * quantity, 0) }, (_, i) => prev[i] ?? {}));
    setStep(-1);
  }, [quantity, bolasBase]);

  function pickFlavor(sel: FlavorSel) {
    setSels((prev) => { const next = [...prev]; next[step] = sel; return next; });
    // Auto-advance after picking
    if (step < totalSlots - 1) {
      setStep((s) => s + 1);
    }
  }

  function handleAdd() {
    if (bolasBase === 0) {
      onAdd([{ product, flavors: [], quantity }]);
      return;
    }
    const items: CartItem[] = Array.from({ length: quantity }, (_, u) => ({
      product,
      flavors: sels.slice(u * bolasBase, (u + 1) * bolasBase),
      quantity: 1,
    }));
    onAdd(items);
  }

  const unitNum  = step === -1 ? 0 : Math.floor(step / bolasBase) + 1;  // 1-based
  const bolaNum  = step === -1 ? 0 : (step % bolasBase) + 1;            // 1-based
  const curSel   = step >= 0 ? sels[step] : null;
  const isLast   = step === totalSlots - 1;
  const allDone  = totalSlots === 0 || step >= totalSlots;

  // Step label shown in the body
  const stepLabel = bolasBase === 0
    ? ''
    : quantity > 1
      ? `Unidad ${unitNum} · Bola ${bolaNum}`
      : bolasBase > 1
        ? `Bola ${bolaNum}`
        : 'Sabor';

  // Progress dots (max 12 shown)
  const showDots = totalSlots > 0 && totalSlots <= 12;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '92vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.28)', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #ec0927 0%, #b91c1c 100%)', padding: '1.1rem 1.4rem', color: '#fff', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-.3px', lineHeight: 1.2 }}>{product.name}</h2>
              {bolasBase > 0 && (
                <p style={{ fontSize: '.72rem', opacity: .8, marginTop: '.18rem' }}>
                  {bolasBase} bola{bolasBase !== 1 ? 's' : ''} por unidad
                  {quantity > 1 ? ` · ${quantity} unidades` : ''}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
              <span style={{ background: 'rgba(255,255,255,.22)', padding: '.28rem .85rem', borderRadius: 99, fontSize: '1rem', fontWeight: 800 }}>
                Q{total.toFixed(2)}
              </span>
              <button onClick={onClose}
                style={{ background: 'rgba(255,255,255,.18)', color: '#fff', border: 'none', width: 28, height: 28, borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>
          </div>

          {/* Progress dots */}
          {showDots && step >= 0 && (
            <div style={{ display: 'flex', gap: 5, marginTop: '.7rem', flexWrap: 'wrap' }}>
              {Array.from({ length: totalSlots }, (_, i) => (
                <button key={i} onClick={() => setStep(i)}
                  style={{
                    width: i === step ? 22 : 8, height: 8, borderRadius: 99,
                    background: i < step ? 'rgba(255,255,255,.9)' : i === step ? '#fff' : 'rgba(255,255,255,.3)',
                    border: 'none', padding: 0, cursor: 'pointer', transition: 'all .2s',
                  }}
                />
              ))}
            </div>
          )}
          {totalSlots > 12 && step >= 0 && (
            <p style={{ fontSize: '.7rem', opacity: .8, marginTop: '.6rem' }}>
              Paso {step + 1} de {totalSlots}
            </p>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.4rem' }}>

          {/* ── Pantalla inicial: cantidad ── */}
          {step === -1 && (
            <div>
              <p style={{ fontSize: '.68rem', fontWeight: 700, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '1.3px', marginBottom: '1rem' }}>
                ¿Cuántas unidades?
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: 46, height: 46, borderRadius: '50%', border: '2px solid #dee2e6', background: '#fff', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', color: '#374151', fontWeight: 700 }}
                >−</button>
                <span style={{ fontWeight: 900, fontSize: '2.2rem', color: '#111', minWidth: 44, textAlign: 'center', lineHeight: 1 }}>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}
                  style={{ width: 46, height: 46, borderRadius: '50%', border: '2px solid #dee2e6', background: '#fff', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', color: '#374151', fontWeight: 700 }}
                >+</button>
              </div>

              {/* Summary of what will be asked */}
              {bolasBase > 0 && (
                <div style={{ background: '#fff8f8', border: '1.5px solid #fecaca', borderRadius: 12, padding: '.85rem 1rem', marginBottom: '.5rem' }}>
                  <p style={{ fontSize: '.83rem', color: '#7f1d1d', fontWeight: 600, lineHeight: 1.5 }}>
                    Se pedirá el sabor para <strong>{totalSlots} bola{totalSlots !== 1 ? 's' : ''}</strong>
                    {quantity > 1 ? ` (${bolasBase} por unidad × ${quantity} unidades)` : ''}.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Paso de sabor ── */}
          {step >= 0 && step < totalSlots && (
            <div>
              {/* Step context label */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '.68rem', fontWeight: 700, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '1.3px', marginBottom: '.2rem' }}>
                  {stepLabel}
                </p>
                <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111' }}>¿Qué sabor?</p>
              </div>

              {/* "Sin sabor" option */}
              <button
                onClick={() => pickFlavor({})}
                style={{
                  width: '100%', padding: '.65rem 1rem', borderRadius: 10, marginBottom: '.75rem',
                  border: `2px solid ${!curSel?.flavorId ? '#ec0927' : '#e9ecef'}`,
                  background: !curSel?.flavorId ? '#fff0f2' : '#fafafa',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '.55rem', transition: 'all .15s',
                }}
              >
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#e9ecef', flexShrink: 0, display: 'inline-block', border: '1.5px solid #dee2e6' }} />
                <span style={{ fontSize: '.88rem', fontWeight: !curSel?.flavorId ? 700 : 500, color: !curSel?.flavorId ? '#ec0927' : '#6c757d' }}>
                  Sin sabor específico
                </span>
              </button>

              {/* Flavor grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem' }}>
                {flavors.map((f) => {
                  const sel = curSel?.flavorId === f.id;
                  return (
                    <button key={f.id}
                      onClick={() => pickFlavor({ flavorId: f.id, flavorName: f.name })}
                      style={{
                        padding: '.8rem .5rem', borderRadius: 12,
                        border: `2px solid ${sel ? '#ec0927' : '#e9ecef'}`,
                        background: sel ? '#fff0f2' : '#fafafa',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem',
                      }}
                      onMouseEnter={(e) => { if (!sel) e.currentTarget.style.borderColor = '#f9a8b4'; }}
                      onMouseLeave={(e) => { if (!sel) e.currentTarget.style.borderColor = '#e9ecef'; }}
                    >
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: f.color ?? '#ccc',
                        boxShadow: sel ? `0 0 0 3px rgba(236,9,39,.25)` : '0 1px 3px rgba(0,0,0,.15)',
                        transition: 'box-shadow .15s',
                      }} />
                      <span style={{ fontSize: '.78rem', fontWeight: sel ? 700 : 500, color: sel ? '#ec0927' : '#343a40', textAlign: 'center', lineHeight: 1.2 }}>
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Resumen de bolas ya elegidas (miniaturas) */}
              {step > 0 && (
                <div style={{ marginTop: '1.1rem', display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                  {sels.slice(0, step).map((s, i) => {
                    const fl = flavors.find((f) => f.id === s.flavorId);
                    return (
                      <button key={i} onClick={() => setStep(i)} title={fl?.name ?? 'Sin sabor'}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', border: '2px solid #dee2e6',
                          background: fl?.color ?? '#e9ecef', cursor: 'pointer', padding: 0,
                          boxShadow: '0 1px 3px rgba(0,0,0,.12)', transition: 'transform .1s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '1rem 1.4rem', borderTop: '1px solid #e9ecef', flexShrink: 0, display: 'flex', gap: '.65rem' }}>

          {/* Back button (show when in a flavor step) */}
          {step >= 0 && (
            <button onClick={() => setStep((s) => s - 1)}
              style={{
                flex: '0 0 auto', padding: '.82rem 1.1rem', borderRadius: 12,
                border: '1.5px solid #dee2e6', background: '#fff',
                color: '#374151', fontWeight: 700, fontSize: '.88rem',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '.4rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fecaca'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dee2e6'; }}
            >
              ← {step === 0 ? 'Cantidad' : 'Atrás'}
            </button>
          )}

          {/* Main action button */}
          {step === -1 ? (
            bolasBase === 0 ? (
              /* No flavor needed — add directly */
              <button onClick={handleAdd}
                style={{
                  flex: 1, padding: '.82rem', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #ec0927, #b91c1c)',
                  color: '#fff', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer',
                  fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(236,9,39,.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                }}
              >
                <span>🛒</span> Agregar · Q{total.toFixed(2)}
              </button>
            ) : (
              /* Has scoops — start the wizard */
              <button onClick={() => setStep(0)}
                style={{
                  flex: 1, padding: '.82rem', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #ec0927, #b91c1c)',
                  color: '#fff', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer',
                  fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(236,9,39,.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                }}
              >
                Seleccionar sabores →
              </button>
            )
          ) : isLast ? (
            /* Last scoop — show add button */
            <button onClick={handleAdd}
              style={{
                flex: 1, padding: '.82rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #ec0927, #b91c1c)',
                color: '#fff', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(236,9,39,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              }}
            >
              <span>🛒</span> Agregar · Q{total.toFixed(2)}
            </button>
          ) : (
            /* Middle steps — next */
            <button
              onClick={() => setStep((s) => s + 1)}
              style={{
                flex: 1, padding: '.82rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #ec0927, #b91c1c)',
                color: '#fff', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(236,9,39,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              }}
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Carretilla (sidebar) ─────────────────────────────────────────────────────
function Carretilla({ items, onRemove, onComplete, onCancel, completing }:
  { items: CartItem[]; onRemove: (i: number) => void; onComplete: () => void; onCancel: () => void; completing: boolean }) {

  const total = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <aside style={{ width: 300, background: '#fff', borderLeft: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>

      {/* Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #ec0927, #b91c1c)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🛒</span>
          <h2 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-.2px' }}>Carretilla</h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.75rem', marginTop: '.2rem' }}>
          {count === 0 ? 'Sin productos' : `${count} producto${count !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '.85rem' }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', color: '#b0b8c4', paddingTop: '2.5rem' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '.6rem' }}>🍦</div>
            <p style={{ fontSize: '.85rem', lineHeight: 1.5 }}>La carretilla está vacía.<br />Agrega un producto para comenzar.</p>
          </div>
        )}
        {items.map((item, idx) => (
          <div key={idx} style={{ background: '#f8f9fa', borderRadius: 10, padding: '.8rem .9rem', marginBottom: '.5rem', position: 'relative', border: '1px solid #f1f3f5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '.88rem', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                {(() => {
                  const names = (item.flavors ?? []).map((f) => f.flavorName).filter(Boolean);
                  return names.length > 0
                    ? <div style={{ fontSize: '.75rem', color: '#6c757d', marginTop: '.1rem' }}>🍓 {names.join(' · ')}</div>
                    : <div style={{ fontSize: '.75rem', color: '#adb5bd', marginTop: '.1rem' }}>Sin sabor</div>;
                })()}
                {item.quantity > 1 && (
                  <div style={{ fontSize: '.72rem', color: '#adb5bd', marginTop: '.1rem' }}>× {item.quantity}</div>
                )}
              </div>
              <button
                onClick={() => onRemove(idx)}
                style={{ background: 'none', color: '#dee2e6', fontSize: '1.15rem', cursor: 'pointer', border: 'none', padding: '0 2px', lineHeight: 1, flexShrink: 0, marginTop: '-2px' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ec0927'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#dee2e6'; }}
              >×</button>
            </div>
            <div style={{ marginTop: '.55rem', paddingTop: '.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontWeight: 800, color: '#ec0927', fontSize: '.9rem' }}>Q{(Number(item.product.price) * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid #e9ecef', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.9rem' }}>
          <span style={{ fontWeight: 600, color: '#6c757d', fontSize: '.85rem' }}>Total</span>
          <span style={{ fontWeight: 900, fontSize: '1.35rem', color: '#ec0927', letterSpacing: '-.5px' }}>Q{total.toFixed(2)}</span>
        </div>
        <button
          onClick={onComplete}
          disabled={items.length === 0 || completing}
          style={{
            width: '100%', padding: '.82rem', borderRadius: 12, border: 'none',
            background: items.length === 0 ? '#dee2e6' : 'linear-gradient(135deg, #ec0927, #b91c1c)',
            color: '#fff', fontWeight: 800, fontSize: '.95rem', cursor: items.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', marginBottom: '.5rem', transition: 'opacity .15s',
            boxShadow: items.length === 0 ? 'none' : '0 4px 14px rgba(236,9,39,.3)',
          }}
        >
          {completing ? 'Procesando…' : '✓ Cobrar orden'}
        </button>
        <button
          onClick={onCancel}
          style={{ width: '100%', padding: '.6rem', background: 'transparent', color: '#adb5bd', border: '1.5px solid #e9ecef', borderRadius: 10, fontSize: '.82rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.color = '#adb5bd'; }}
        >
          Cancelar orden
        </button>
      </div>
    </aside>
  );
}

// ─── Modal de Orden Completada ────────────────────────────────────────────────
function InvoiceModal({ order, onClose }: { order: any; onClose: () => void }) {
  const invoiceId = order.invoice?.id;
  const pdfUrl = invoiceId
    ? `${(import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000')}/api/invoices/${invoiceId}/pdf`
    : null;

  return (
    <GlassDialog open title={`¡Orden completada! · ${order.invoiceNumber}`} onClose={onClose} maxWidth={460}>
      {/* Check */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,.12)', border: '2px solid rgba(34,197,94,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', boxShadow: '0 0 20px rgba(34,197,94,.35)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>

      {/* Items */}
      <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,.08)' }}>
        {order.items?.map((item: any) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem', fontSize: '.88rem', color: 'rgba(255,255,255,.8)' }}>
            <span>{item.product?.name}{item.flavor ? ` · ${item.flavor.name}` : ''}</span>
            <span style={{ fontWeight: 600 }}>Q{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.12)', marginTop: '.6rem', paddingTop: '.6rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span style={{ color: 'rgba(255,255,255,.6)' }}>Total</span>
          <span style={{ color: '#22c55e', fontSize: '1.05rem' }}>Q{Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '.75rem' }}>
        {pdfUrl ? (
          <a href={pdfUrl} target="_blank" rel="noopener"
            style={{ flex: 1, textAlign: 'center', padding: '.7rem', background: 'linear-gradient(135deg, #ec0927cc, #ec0927)', color: '#fff', borderRadius: 999, fontWeight: 700, fontSize: '.9rem', textDecoration: 'none', border: '1.5px solid rgba(236,9,39,.4)', boxShadow: '0 0 16px rgba(236,9,39,.4)', letterSpacing: '.3px' }}>
            Descargar PDF
          </a>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', padding: '.7rem', background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.35)', borderRadius: 999, fontSize: '.85rem', border: '1px solid rgba(255,255,255,.1)' }}>
            PDF no disponible
          </div>
        )}
        <button onClick={onClose}
          style={{ flex: 1, padding: '.7rem', background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 999, fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit', color: 'rgba(255,255,255,.75)', transition: 'background .2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
        >
          Nueva orden
        </button>
      </div>
    </GlassDialog>
  );
}

type SaleOrder = { id: number; invoiceNumber: string; total: number; completedAt: string; items: any[] };

// ─── Panel de Ventas del Día ──────────────────────────────────────────────────
function VentasHoy({ sales, loading, userName }: { sales: SaleOrder[]; loading: boolean; userName: string }) {
  const totalDia = sales.reduce((s, o) => s + Number(o.total), 0);

  function handlePrint() {
    const fecha     = new Date().toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const diaNombre = new Date().toLocaleDateString('es-GT', { weekday: 'long' });
    const hora      = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

    const SEP  = '--------------------------------';
    const filas = sales.length === 0
      ? '<p style="text-align:center;color:#555;margin:8px 0">Sin ventas registradas.</p>'
      : sales.map((order) => {
          const horaVenta = new Date(order.completedAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
          const nombres   = (order.items ?? [])
            .map((it: any) => `${it.quantity > 1 ? `${it.quantity}x ` : ''}${it.product?.name ?? ''}`)
            .filter(Boolean).join(', ');
          const facCorta  = order.invoiceNumber?.replace('FAC-', '') ?? order.id;
          const totalStr  = `Q${Number(order.total).toFixed(2)}`;
          // right-align total: pad left so line is ~32 chars
          const leftPart  = `${horaVenta}  #${facCorta}`;
          const pad       = Math.max(1, 32 - leftPart.length - totalStr.length);
          return `
            <div class="row">
              <span class="row-left">${horaVenta} &nbsp;<span class="fac">#${facCorta}</span></span>
              <span class="row-right">${totalStr}</span>
            </div>
            ${nombres ? `<div class="productos">${nombres}</div>` : ''}`;
        }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Ventas del Día</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      color: #000;
      width: 80mm;
      display: flex;
      justify-content: center;
    }
    .ticket {
      width: 70mm;
      padding: 6mm 0 10mm;
    }
    .center  { text-align: center; }
    .bold    { font-weight: bold; }
    .logo    { font-size: 20px; font-weight: 900; letter-spacing: -1px; }
    .sep     { border: none; border-top: 1px dashed #000; margin: 5px 0; }
    .sep-solid { border: none; border-top: 1px solid #000; margin: 5px 0; }
    .meta    { font-size: 10px; line-height: 1.7; }
    .title   { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0; }
    .row     { display: flex; justify-content: space-between; align-items: baseline; margin: 3px 0 0; }
    .row-left  { font-size: 10.5px; }
    .row-right { font-weight: bold; font-size: 10.5px; white-space: nowrap; }
    .fac     { font-size: 9.5px; color: #333; }
    .productos { font-size: 9.5px; color: #444; margin: 1px 0 5px 0; padding-left: 4px; }
    .total-bloque { margin-top: 4px; }
    .total-line { display: flex; justify-content: space-between; align-items: baseline; }
    .total-label { font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .total-val   { font-size: 15px; font-weight: 900; }
    .ventas-cnt  { font-size: 9.5px; color: #555; text-align: right; margin-top: 1px; }
    .footer { margin-top: 8px; font-size: 9px; color: #555; text-align: center; line-height: 1.6; }
    @media print { body { width: 80mm; } }
  </style>
</head>
<body>
<div class="ticket">
  <div class="center">
    <div class="logo">Sarita</div>
    <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#333;margin-top:1px">Franquicia Chuscaj</div>
  </div>

  <hr class="sep" style="margin-top:6px"/>

  <div class="meta center">
    <div class="bold" style="text-transform:capitalize">${diaNombre}, ${fecha}</div>
    <div>Vendedor: ${userName}</div>
  </div>

  <hr class="sep-solid" style="margin-top:6px"/>
  <div class="title center">Resumen de Ventas del Día</div>
  <hr class="sep" style="margin-bottom:4px"/>

  ${filas}

  <hr class="sep-solid" style="margin-top:6px"/>

  <div class="total-bloque">
    <div class="total-line">
      <span class="total-label">Total del día</span>
      <span class="total-val">Q${totalDia.toFixed(2)}</span>
    </div>
    <div class="ventas-cnt">${sales.length} venta${sales.length !== 1 ? 's' : ''} realizadas</div>
  </div>

  <hr class="sep" style="margin-top:8px"/>
  <div class="footer">
    Impreso: ${fecha} ${hora}<br/>
    Sarita · Sistema de Punto de Venta
  </div>
</div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=340,height=600');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <aside style={{ width: 280, background: '#fff', borderRight: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>

      {/* Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #ec0927, #b91c1c)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📋</span>
          <h2 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-.2px' }}>Ventas de Hoy</h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.75rem', marginTop: '.2rem' }}>
          {sales.length === 0 ? 'Sin ventas aún' : `${sales.length} venta${sales.length !== 1 ? 's' : ''} realizadas`}
        </p>
      </div>

      {/* Lista de ventas */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '.85rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', color: '#b0b8c4', paddingTop: '2.5rem', fontSize: '.85rem' }}>Cargando…</div>
        )}
        {!loading && sales.length === 0 && (
          <div style={{ textAlign: 'center', color: '#b0b8c4', paddingTop: '2.5rem' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '.6rem' }}>🧾</div>
            <p style={{ fontSize: '.85rem', lineHeight: 1.5 }}>Aún no hay ventas<br />registradas hoy.</p>
          </div>
        )}
        {sales.map((order) => {
          const hora = new Date(order.completedAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
          const nombres = (order.items ?? [])
            .map((it: any) => `${it.quantity > 1 ? `${it.quantity}× ` : ''}${it.product?.name ?? ''}`)
            .filter(Boolean);
          return (
            <div key={order.id} style={{ background: '#f8f9fa', borderRadius: 10, padding: '.75rem .9rem', marginBottom: '.5rem', border: '1px solid #f1f3f5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.4rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '.8rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '.72rem', color: '#9ca3af', marginTop: '.1rem' }}>{hora}</div>
                  {nombres.length > 0 && (
                    <div style={{ fontSize: '.73rem', color: '#6b7280', marginTop: '.25rem', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nombres.join(', ')}
                    </div>
                  )}
                </div>
                <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '.9rem', flexShrink: 0 }}>
                  Q{Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — total del día + botón imprimir */}
      <div style={{ padding: '1rem', borderTop: '1px solid #e9ecef', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.75rem' }}>
          <span style={{ fontWeight: 600, color: '#6c757d', fontSize: '.85rem' }}>Total del día</span>
          <span style={{ fontWeight: 900, fontSize: '1.35rem', color: '#ec0927', letterSpacing: '-.5px' }}>
            Q{totalDia.toFixed(2)}
          </span>
        </div>
        <button
          onClick={handlePrint}
          style={{
            width: '100%', padding: '.72rem', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #ec0927, #b91c1c)',
            color: '#fff', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
            boxShadow: '0 3px 10px rgba(236,9,39,.3)', transition: 'opacity .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          🖨️ Imprimir informe
        </button>
      </div>
    </aside>
  );
}

// ─── App Principal ────────────────────────────────────────────────────────────
export default function EmployeeApp({ userName }: { userName: string }) {
  const [categories, setCategories]       = useState<Category[]>([]);
  const [flavors, setFlavors]             = useState<Flavor[]>([]);
  const [activeCat, setActiveCat]         = useState<number | null>(null);
  const [picker, setPicker]               = useState<Product | null>(null);
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [orderId, setOrderId]             = useState<number | null>(null);
  const [completing, setCompleting]       = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [appError, setAppError]           = useState('');
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [sales, setSales]                 = useState<SaleOrder[]>([]);
  const [salesLoading, setSalesLoading]   = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  function isToday(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }

  async function loadSales() {
    try {
      const orders = await api.orders() as any[];
      const todayCompleted = orders
        .filter((o) => o.status === 'completed' && o.completedAt && isToday(o.completedAt))
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      setSales(todayCompleted);
    } catch {
      // silent
    } finally {
      setSalesLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([api.categories(), api.flavors()]).then(([cats, flvs]) => {
      setCategories(cats as Category[]);
      setFlavors(flvs as Flavor[]);
      if ((cats as Category[]).length) setActiveCat((cats as Category[])[0].id);
    });
    loadSales();
  }, []);

  async function handleAddToCart(items: CartItem[]) {
    let oid = orderId;
    if (!oid) {
      const order = await api.createOrder() as any;
      oid = order.id;
      setOrderId(oid);
    }
    for (const item of items) {
      const [primary, ...extra] = item.flavors ?? [];
      await api.addItem(oid!, {
        productId: item.product.id,
        flavorId: primary?.flavorId,
        quantity: item.quantity,
        customizations: extra.length > 0 ? { extraFlavors: extra.map((f) => f.flavorId).filter(Boolean) } : undefined,
      });
      setCart((c) => [...c, item]);
    }
    setPicker(null);
  }

  async function handleRemoveItem(idx: number) {
    setCart((c) => c.filter((_, i) => i !== idx));
  }

  async function handleComplete() {
    if (!orderId) return;
    setCompleting(true);
    try {
      const order = await api.completeOrder(orderId) as any;
      setCompletedOrder(order);
      loadSales();
    } catch (e: any) {
      setAppError(e.message ?? 'Error al completar la orden');
    } finally {
      setCompleting(false);
    }
  }

  async function confirmCancel() {
    if (orderId) await api.cancelOrder(orderId).catch(() => {});
    setCart([]);
    setOrderId(null);
    setCancelConfirm(false);
  }

  function handleCancel() {
    if (cart.length > 0) {
      setCancelConfirm(true);
    } else {
      setCart([]);
      setOrderId(null);
    }
  }

  function handleNewOrder() {
    setCompletedOrder(null);
    setCart([]);
    setOrderId(null);
  }

  const activeProducts = categories.find((c) => c.id === activeCat)?.products.filter((p) => p.active) ?? [];

  async function handleLogout() {
    await api.logout();
    window.location.href = '/';
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: '#f8f9fa' }}>

      {/* ── Panel Ventas del Día ── */}
      <VentasHoy sales={sales} loading={salesLoading} userName={userName} />

      {/* ── Contenido principal ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e9ecef', padding: '.9rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #ec0927, #7a0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(236,9,39,.35)', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', fontFamily: 'Georgia, serif' }}>S</span>
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ec0927', letterSpacing: '-1.2px', lineHeight: 1, display: 'block' }}>Sarita</span>
              <span style={{ fontSize: '.58rem', fontWeight: 700, color: '#adb5bd', letterSpacing: '2.5px', textTransform: 'uppercase', lineHeight: 1, display: 'block' }}>Punto de Venta</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
            <span style={{ fontSize: '.85rem', color: '#6c757d' }}>Hola, <strong style={{ color: '#343a40' }}>{userName}</strong></span>
            <button
              onClick={handleLogout}
              style={{ padding: '.38rem .85rem', border: '1.5px solid #dee2e6', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: '.8rem', color: '#6c757d', fontFamily: 'inherit', transition: 'all .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#dc2626'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dee2e6'; e.currentTarget.style.color = '#6c757d'; }}
            >
              Salir
            </button>
          </div>
        </header>

        {/* Carrusel de categorías */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e9ecef', padding: '.7rem 1.5rem', flexShrink: 0 }}>
          <div ref={carouselRef} style={{ display: 'flex', gap: '.5rem', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingBottom: '2px' }}>
            {categories.map((cat) => {
              const active = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    flexShrink: 0, padding: '.5rem 1rem', borderRadius: 99,
                    border: `2px solid ${active ? '#ec0927' : '#dee2e6'}`,
                    background: active ? '#fff0f2' : '#f8f9fa',
                    color: active ? '#ec0927' : '#6c757d',
                    fontWeight: active ? 700 : 500, fontSize: '.85rem',
                    cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '.4rem', scrollSnapAlign: 'start',
                  }}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grilla de productos */}
        <div style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto' }}>
          {/* Título de sección */}
          <div style={{ marginBottom: '1.1rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f1117', letterSpacing: '-.5px', lineHeight: 1.1, margin: 0 }}>
              {categories.find((c) => c.id === activeCat)?.name ?? 'Productos'}
            </h2>
            <div style={{ height: 3, width: 44, borderRadius: 99, background: 'linear-gradient(90deg, #ec0927, #ff6b8a)', marginTop: '.5rem' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '.85rem' }}>
            {activeProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setPicker(product)}
                style={{
                  background: '#fff', border: '1.5px solid #e9ecef', borderRadius: 14,
                  padding: '1.1rem', cursor: 'pointer', textAlign: 'left',
                  transition: 'transform .15s, box-shadow .15s, border-color .15s',
                  fontFamily: 'inherit', display: 'flex', flexDirection: 'column',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(236,9,39,.14)'; e.currentTarget.style.borderColor = '#ec0927'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e9ecef'; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '.6rem' }}>🍦</div>
                <h3 style={{ fontSize: '.92rem', fontWeight: 700, color: '#111', marginBottom: '.2rem', lineHeight: 1.3 }}>{product.name}</h3>
                {product.containerSize && (
                  <p style={{ fontSize: '.75rem', color: '#adb5bd', marginBottom: '.65rem' }}>{product.containerSize}</p>
                )}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ec0927', letterSpacing: '-.3px' }}>Q{Number(product.price).toFixed(2)}</span>
                  <span style={{ background: '#fff0f2', color: '#ec0927', fontSize: '.72rem', fontWeight: 700, padding: '.2rem .6rem', borderRadius: 99 }}>+ Agregar</span>
                </div>
              </button>
            ))}
            {activeProducts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', paddingTop: '3rem', color: '#b0b8c4' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                <p style={{ fontSize: '.9rem' }}>No hay productos disponibles en esta categoría</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Carretilla ── */}
      <Carretilla
        items={cart}
        onRemove={handleRemoveItem}
        onComplete={handleComplete}
        onCancel={handleCancel}
        completing={completing}
      />

      {/* Selector de sabores */}
      {picker && (
        <FlavorPicker
          product={picker}
          flavors={flavors}
          onAdd={handleAddToCart}
          onClose={() => setPicker(null)}
        />
      )}

      {/* Modal orden completada */}
      {completedOrder && <InvoiceModal order={completedOrder} onClose={handleNewOrder} />}

      {/* Confirmar cancelación */}
      <ConfirmModal
        open={cancelConfirm}
        title="¿Cancelar la carretilla?"
        message="Se perderán todos los productos agregados. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        onConfirm={confirmCancel}
        onClose={() => setCancelConfirm(false)}
      />

      {/* Error */}
      <ErrorModal open={!!appError} title="Error" message={appError} onClose={() => setAppError('')} />
    </div>
  );
}
