import React from 'react';
import {
  X,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Boxes,
  FileSpreadsheet,
  Layers,
  Sliders
} from 'lucide-react';

export const CalculationBreakdownModal = ({ item, onClose }) => {
  if (!item) return null;

  const storeQty = Number(item.storeNetAvailableQuantity) || 0;
  const rcQty = Number(item.rateContractNetAvailableQuantity) || 0;
  const combinedQty = storeQty + rcQty;
  const threshold = Number(item.tenderingThreshold) || 0;
  const difference = combinedQty - threshold;
  const isUrgent = combinedQty < threshold;

  return (
    <div
      className="modal-backdrop-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '640px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: isUrgent ? '2px solid #FCA5A5' : '2px solid #86EFAC'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: isUrgent ? '#FEF2F2' : '#F0FDF4',
            borderBottom: '1px solid',
            borderColor: isUrgent ? '#FECACA' : '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: isUrgent ? '#DC2626' : '#16A34A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isUrgent ? <AlertTriangle size={22} /> : <Calculator size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--iocl-navy)', margin: 0 }}>
                  Alert 2 Calculation Breakdown
                </h2>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: isUrgent ? '#DC2626' : '#16A34A',
                    color: '#FFFFFF',
                    letterSpacing: '0.5px'
                  }}
                >
                  {isUrgent ? 'URGENT TENDER' : 'ADEQUATE'}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                Formula verification & threshold comparison for {item.cartridgeName} ({item.partNumber})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '0.375rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Target Consumable Info Bar */}
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.8125rem'
            }}
          >
            <div>
              <span style={{ color: '#64748B', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>Part Number</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--iocl-navy)', fontSize: '0.9375rem' }}>{item.partNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>Printer Model</span>
              <strong style={{ color: '#1E293B' }}>{item.printerModel}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>Storage Location</span>
              <span style={{ color: '#475569' }}>{item.location || 'Central Store'}</span>
            </div>
          </div>

          {/* Mathematical Step-by-Step Box */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#F1F5F9',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                Step-by-Step Mathematical Calculation
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                Alert 2 Formula
              </span>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Row 1: Store Net Available */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Boxes size={16} color="var(--iocl-saffron)" />
                  <span style={{ fontSize: '0.875rem', color: '#334155' }}>Store Net Available Quantity</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: '700', color: '#1E293B' }}>
                  {storeQty} units
                </span>
              </div>

              {/* Row 2: Rate Contract Net Available */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileSpreadsheet size={16} color="var(--iocl-navy)" />
                  <span style={{ fontSize: '0.875rem', color: '#334155' }}>Rate Contract Net Available Quantity</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '700' }}>+</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: '700', color: '#1E293B' }}>
                    {rcQty} units
                  </span>
                </div>
              </div>

              {/* Divider */}
              <hr style={{ border: 'none', borderTop: '2px dashed #CBD5E1', margin: '0.25rem 0' }} />

              {/* Row 3: Combined Net Available */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={16} color="#0284C7" />
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--iocl-navy)' }}>
                    Combined Net Available Quantity
                  </strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '700' }}>=</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: '800', color: 'var(--iocl-navy)' }}>
                    {combinedQty} units
                  </span>
                </div>
              </div>

              {/* Row 4: Tendering Threshold Comparison */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={16} color="#7C3AED" />
                  <span style={{ fontSize: '0.875rem', color: '#334155' }}>Configured Tendering Threshold</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: '700', color: '#7C3AED' }}>
                  {threshold} units
                </span>
              </div>

              {/* Row 5: Mathematical Comparison Statement */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: isUrgent ? '#FEF2F2' : '#F0FDF4',
                  border: `1px solid ${isUrgent ? '#FECACA' : '#BBF7D0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isUrgent ? <TrendingDown size={18} color="#DC2626" /> : <TrendingUp size={18} color="#16A34A" />}
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: isUrgent ? '#991B1B' : '#166534' }}>
                    Comparison: {combinedQty} {isUrgent ? '<' : '≥'} {threshold}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    color: isUrgent ? '#DC2626' : '#16A34A'
                  }}
                >
                  Difference: {difference >= 0 ? `+${difference}` : difference} units ({isUrgent ? 'Deficit' : 'Surplus'})
                </span>
              </div>
            </div>
          </div>

          {/* Final Result Card */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: isUrgent ? '#991B1B' : '#14532D',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isUrgent ? (
                <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>🚨</span>
              ) : (
                <CheckCircle2 size={32} color="#86EFAC" />
              )}
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                  Final Business Logic Evaluation
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: '800' }}>
                  {isUrgent ? 'URGENT — TENDERING REQUIRED' : 'STOCK ADEQUATE — NO TENDER NEEDED'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6875rem', opacity: 0.8 }}>Action Required</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: isUrgent ? '#FCA5A5' : '#86EFAC' }}>
                {isUrgent ? 'Initiate New Tender' : 'Normal Operation'}
              </div>
            </div>
          </div>

          {/* Logic Note / Explainer Box */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#64748B'
            }}
          >
            <HelpCircle size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--iocl-navy)' }} />
            <div>
              <strong>Alert 2 Business Rule:</strong> Alert 2 aggregates physical inventory from the Central Store ({storeQty}) and unexecuted quota in valid Rate Contracts ({rcQty}). When the combined sum ({combinedQty}) drops below the Tendering Threshold ({threshold}), a new public tender process must be initiated.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '0.875rem 1.5rem',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
