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
    color: '#002D62', // Navy
    accentBg: 'rgba(0, 45, 98, 0.08)'
  },
  {
    id: 'STORE_INVENTORY',
    title: 'Store Inventory',
    shortTitle: 'Store Stock',
    description: 'Current warehouse stock position & availability',
    icon: Boxes,
    color: '#059669', // Green
    accentBg: 'rgba(5, 150, 105, 0.08)'
  },
  {
    id: 'PROCUREMENT',
    title: 'Rate Contracts',
    shortTitle: 'Procurement',
    description: 'Rate contracts, WO allocations & contract balances',
    icon: ShoppingBag,
    color: '#FF6600', // Saffron
    accentBg: 'rgba(255, 102, 0, 0.08)'
  },
  {
    id: 'CALL_UP_PO',
    title: 'Call-Up POs',
    shortTitle: 'Call-Up PO',
    description: 'PO execution tracking against active rate contracts',
    icon: FileSpreadsheet,
    color: '#2563EB', // Blue
    accentBg: 'rgba(37, 99, 235, 0.08)'
  },
  {
    id: 'EMPLOYEE',
    title: 'Employees',
    shortTitle: 'Directory',
    description: 'Employee master directory, cabins & assigned printers',
    icon: Users,
    color: '#7C3AED', // Purple
    accentBg: 'rgba(124, 58, 237, 0.08)'
  },
  {
    id: 'STOCK_HISTORY',
    title: 'Stock Movement',
    shortTitle: 'Stock Audit',
    description: 'Complete stock inflow, outflow & adjustment ledger',
    icon: History,
    color: '#D97706', // Amber
    accentBg: 'rgba(217, 119, 6, 0.08)'
  }
];

export const ReportTypeSelector = ({ selectedReportType, onSelectReportType }) => {
  return (
    <div className="report-type-selector-container mb-6">
      <div className="section-subtitle-bar mb-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                padding: '14px 16px',
                borderRadius: '8px',
                background: isSelected ? '#FFFFFF' : 'var(--bg-surface, #FFFFFF)',
                border: isSelected
                  ? `2px solid ${type.color}`
                  : '1px solid var(--border-color, #E2E8F0)',
                boxShadow: isSelected
                  ? '0 4px 14px rgba(0, 45, 98, 0.12)'
                  : '0 1px 3px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden'
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
                    background: type.color
                  }}
                />
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  marginBottom: '10px'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: type.accentBg,
                    color: type.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={18} />
                </div>

                {isSelected && (
                  <CheckCircle2 size={16} color={type.color} />
                )}
              </div>

              <div style={{ width: '100%' }}>
                <h4
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--iocl-navy, #002D62)' : 'var(--text-primary)',
                    margin: '0 0 4px 0'
                  }}
                >
                  {type.title}
                </h4>
                <p
                  style={{
                    fontSize: '0.75rem',
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
