import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';

export const Alert2SimulationBox = () => {
  const [storeQty, setStoreQty] = useState(20);
  const [rcQty, setRcQty] = useState(10);
  const [threshold, setThreshold] = useState(50);
  const [selectedTest, setSelectedTest] = useState('TEST1');

  const parsedStore = Math.max(0, parseInt(storeQty, 10) || 0);
  const parsedRc = Math.max(0, parseInt(rcQty, 10) || 0);
  const parsedThreshold = Math.max(0, parseInt(threshold, 10) || 0);

  const combinedQty = parsedStore + parsedRc;
  const difference = combinedQty - parsedThreshold;
  const isUrgent = combinedQty < parsedThreshold;

  const handleApplyPreset = (testKey, s, r, t) => {
    setSelectedTest(testKey);
    setStoreQty(s);
    setRcQty(r);
    setThreshold(t);
  };

  const handleInputChange = (setter, val) => {
    setSelectedTest(null);
    setter(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
  };

  return (
    <div
      className="section-card"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: '1px solid #CBD5E1',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* Section Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#0F2042',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              backgroundColor: 'var(--iocl-saffron)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Cpu size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, letterSpacing: '0.3px', color: '#FFFFFF' }}>
                ALERT 2 TEST & SIMULATION WORKBENCH
              </h2>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: '700',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  textTransform: 'uppercase'
                }}
              >
                Frontend Live Sandbox
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: '0.125rem 0 0 0' }}>
              Interact with custom store quantities, RC balances, and thresholds to verify real-time tendering evaluation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleApplyPreset('TEST1', 20, 10, 50)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          title="Reset to default simulation"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Preset Scenarios Strip */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: '#F1F5F9',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--iocl-navy)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Sparkles size={14} color="var(--iocl-saffron)" /> Acceptance Test Presets:
        </span>

        <button
          type="button"
          onClick={() => handleApplyPreset('TEST1', 20, 10, 50)}
          style={{
            padding: '0.3125rem 0.625rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            border: selectedTest === 'TEST1' ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
            backgroundColor: selectedTest === 'TEST1' ? '#FEF2F2' : '#FFFFFF',
            color: selectedTest === 'TEST1' ? '#DC2626' : '#334155'
          }}
        >
          <strong>TEST 1:</strong> Store 20 + RC 10 &lt; 50 (🚨 Urgent)
        </button>

        <button
          type="button"
          onClick={() => handleApplyPreset('TEST2', 30, 30, 50)}
          style={{
            padding: '0.3125rem 0.625rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            border: selectedTest === 'TEST2' ? '1.5px solid #16A34A' : '1px solid #CBD5E1',
            backgroundColor: selectedTest === 'TEST2' ? '#F0FDF4' : '#FFFFFF',
            color: selectedTest === 'TEST2' ? '#16A34A' : '#334155'
          }}
        >
          <strong>TEST 2:</strong> Store 30 + RC 30 &ge; 50 (✓ Adequate)
        </button>

        <button
          type="button"
          onClick={() => handleApplyPreset('TEST3', 0, 0, 10)}
          style={{
            padding: '0.3125rem 0.625rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            border: selectedTest === 'TEST3' ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
            backgroundColor: selectedTest === 'TEST3' ? '#FEF2F2' : '#FFFFFF',
            color: selectedTest === 'TEST3' ? '#DC2626' : '#334155'
          }}
        >
          <strong>TEST 3:</strong> Store 0 + RC 0 &lt; 10 (🚨 Urgent)
        </button>

        <button
          type="button"
          onClick={() => handleApplyPreset('TEST4', 100, 50, 100)}
          style={{
            padding: '0.3125rem 0.625rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            border: selectedTest === 'TEST4' ? '1.5px solid #16A34A' : '1px solid #CBD5E1',
            backgroundColor: selectedTest === 'TEST4' ? '#F0FDF4' : '#FFFFFF',
            color: selectedTest === 'TEST4' ? '#16A34A' : '#334155'
          }}
        >
          <strong>TEST 4:</strong> Store 100 + RC 50 &ge; 100 (✓ Adequate)
        </button>
      </div>

      {/* Main Simulation Form & Live Output Grid */}
      <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
        {/* Left: Input Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Input Parameters (Modify Values to Test Logic)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            {/* Input 1: Store Net Qty */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>
                Store Net Available
              </label>
              <input
                type="number"
                min="0"
                value={storeQty}
                onChange={(e) => handleInputChange(setStoreQty, e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--iocl-navy)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Input 2: Rate Contract Net Qty */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>
                Rate Contract Net Qty
              </label>
              <input
                type="number"
                min="0"
                value={rcQty}
                onChange={(e) => handleInputChange(setRcQty, e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--iocl-navy)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Input 3: Tendering Threshold */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#7C3AED' }}>
                Tendering Threshold
              </label>
              <input
                type="number"
                min="0"
                value={threshold}
                onChange={(e) => handleInputChange(setThreshold, e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  border: '1.5px solid #A78BFA',
                  backgroundColor: '#F5F3FF',
                  color: '#6D28D9',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Quick arithmetic summary formula banner */}
          <div
            style={{
              padding: '0.625rem 0.875rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '0.75rem',
              color: '#475569',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Formula: Store ({parsedStore}) + RC ({parsedRc}) = Combined ({combinedQty})</span>
            <span style={{ fontWeight: '700', color: isUrgent ? '#DC2626' : '#16A34A' }}>
              {combinedQty} {isUrgent ? '<' : '≥'} {parsedThreshold}
            </span>
          </div>
        </div>

        {/* Right: Real-time Evaluation Card */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            backgroundColor: isUrgent ? '#FEF2F2' : '#F0FDF4',
            border: isUrgent ? '2px solid #FCA5A5' : '2px solid #86EFAC',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            boxShadow: isUrgent ? '0 10px 15px -3px rgba(220, 38, 38, 0.1)' : '0 10px 15px -3px rgba(22, 163, 74, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: isUrgent ? '#991B1B' : '#166534' }}>
              Live Computed Result
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                backgroundColor: isUrgent ? '#DC2626' : '#16A34A',
                color: '#FFFFFF'
              }}
            >
              {isUrgent ? 'URGENT REQUIREMENT' : 'ADEQUATE INVENTORY'}
            </span>
          </div>

          {/* Metric Figures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.6875rem', color: '#64748B', display: 'block', fontWeight: '600' }}>Combined Net Available</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--iocl-navy)' }}>{combinedQty} units</strong>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.6875rem', color: '#64748B', display: 'block', fontWeight: '600' }}>Threshold Difference</span>
              <strong style={{ fontSize: '1.25rem', color: isUrgent ? '#DC2626' : '#16A34A' }}>
                {difference >= 0 ? `+${difference}` : difference} units
              </strong>
            </div>
          </div>

          {/* Big Status Badge */}
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '8px',
              backgroundColor: isUrgent ? '#DC2626' : '#16A34A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isUrgent ? (
                <span style={{ fontSize: '1.25rem' }}>🚨</span>
              ) : (
                <CheckCircle2 size={20} />
              )}
              <strong style={{ fontSize: '0.9375rem', letterSpacing: '0.3px' }}>
                {isUrgent ? 'URGENT — TENDERING REQUIRED' : 'ADEQUATE STOCK'}
              </strong>
            </div>
            <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '500' }}>
              {isUrgent ? 'Action: Tender' : 'Action: None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
