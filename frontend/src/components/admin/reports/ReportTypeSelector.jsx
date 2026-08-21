import React from 'react';
import {
  ClipboardList,
  Boxes,
  ShoppingBag,
  FileSpreadsheet,
  Users,
  History,
  CheckCircle2
} from 'lucide-react';

export const REPORT_TYPES = [
  {
    id: 'ASSET_USAGE',
    title: 'Asset Usage',
    shortTitle: 'Asset Usage',
    description: 'Track cartridge consumption by engineers & beneficiaries',
    icon: ClipboardList,
    color: 'var(--iocl-red, #B71C1C)',
    accentBg: 'rgba(183, 28, 28, 0.08)'
  },
  {
    id: 'STORE_INVENTORY',
    title: 'Store Inventory',
    shortTitle: 'Store Stock',
    description: 'Current warehouse stock position & availability',
    icon: Boxes,
    color: '#059669',
    accentBg: 'rgba(5, 150, 105, 0.08)'
  },
  {
    id: 'PROCUREMENT',
    title: 'Rate Contracts',
    shortTitle: 'Procurement',
    description: 'Rate contracts, WO allocations & contract balances',
    icon: ShoppingBag,
    color: 'var(--iocl-saffron, #F58220)',
    accentBg: 'rgba(245, 130, 32, 0.08)'
  },
  {
    id: 'CALL_UP_PO',
    title: 'Call-Up POs',
    shortTitle: 'Call-Up PO',
    description: 'PO execution tracking against active rate contracts',
    icon: FileSpreadsheet,
    color: '#2563EB',
    accentBg: 'rgba(37, 99, 235, 0.08)'
  },
  {
    id: 'EMPLOYEE',
    title: 'Employees',
    shortTitle: 'Directory',
    description: 'Employee master directory, cabins & assigned printers',
    icon: Users,
    color: '#7C3AED',
    accentBg: 'rgba(124, 58, 237, 0.08)'
  },
  {
    id: 'STOCK_HISTORY',
    title: 'Stock Movement',
    shortTitle: 'Stock Audit',
    description: 'Complete stock inflow, outflow & adjustment ledger',
    icon: History,
    color: '#D97706',
    accentBg: 'rgba(217, 119, 6, 0.08)'
  }
];

export const ReportTypeSelector = ({ selectedReportType, onSelectReportType }) => {
  return (
    <div className="report-type-selector-container mb-6">
      <div className="section-subtitle-bar mb-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
          SELECT REPORT MODULE
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {REPORT_TYPES.length} Operational Modules
        </span>
      </div>

      <div
        className="report-type-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px'
        }}
      >
        {REPORT_TYPES.map((type) => {
          const isSelected = selectedReportType === type.id;
          const Icon = type.icon;

          return (
            <button
              key={type.id}
              type="button"
              className={`report-type-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectReportType(type.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: '8px',
                background: isSelected ? '#FFFFFF' : 'var(--bg-surface, #FFFFFF)',
                border: isSelected
                  ? '2px solid var(--iocl-red, #B71C1C)'
                  : '1px solid var(--border-medium, #CBD5E1)',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(183, 28, 28, 0.12)'
                  : 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '108px'
              }}
            >
              {/* Top Accent Stripe when active */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--iocl-red, #B71C1C)'
                  }}
                />
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  marginBottom: '8px'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: type.accentBg,
                    color: type.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={16} />
                </div>

                {isSelected && (
                  <CheckCircle2 size={15} color="var(--iocl-red, #B71C1C)" />
                )}
              </div>

              <div style={{ width: '100%' }}>
                <h4
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--iocl-red, #B71C1C)' : 'var(--text-primary)',
                    margin: '0 0 2px 0',
                    lineHeight: '1.2'
                  }}
                >
                  {type.title}
                </h4>
                <p
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    margin: 0,
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {type.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReportTypeSelector;
