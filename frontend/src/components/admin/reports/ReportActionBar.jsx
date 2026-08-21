import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  RefreshCw,
  Play,
  Calendar,
  Sparkles
} from 'lucide-react';
import { REPORT_TYPES } from './ReportTypeSelector';

export const ReportActionBar = ({
  reportType = 'ASSET_USAGE',
  filters = {},
  onGenerateReport,
  onExportExcel,
  onExportCsv,
  onPrint,
  onRefresh,
  loading = false,
  exporting = false
}) => {
  const currentReportMeta = REPORT_TYPES.find((r) => r.id === reportType) || REPORT_TYPES[0];

  // Format Report Period Display
  const formatPeriod = () => {
    if (filters.fromDate && filters.toDate) {
      return `${filters.fromDate} to ${filters.toDate}`;
    }
    if (filters.fromDate) {
      return `From ${filters.fromDate}`;
    }
    if (filters.toDate) {
      return `Until ${filters.toDate}`;
    }
    return 'All Available Dates';
  };

  return (
    <div
      className="report-action-bar-card mb-4"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-color, #E2E8F0)',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Left: Dynamic Report Header & Active Period */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--iocl-navy, #002D62)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{currentReportMeta.title} Report</span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(0, 45, 98, 0.08)',
                color: 'var(--iocl-navy)'
              }}
            >
              PREVIEW
            </span>
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            {currentReportMeta.description}
          </p>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#475569',
              background: '#F1F5F9',
              padding: '2px 10px',
              borderRadius: '4px'
            }}
          >
            <Calendar size={12} />
            Period: {formatPeriod()}
          </span>
        </div>
      </div>

      {/* Right: Operational Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Refresh Button */}
        <button
          type="button"
          className="btn-refresh"
          onClick={onRefresh}
          disabled={loading || exporting}
          title="Refresh preview data"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            background: '#FFFFFF',
            border: '1px solid var(--border-color, #CBD5E1)',
            color: 'var(--text-secondary)',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          <span>Refresh</span>
        </button>

        {/* Generate Report Button */}
        <button
          type="button"
          className="btn-generate-report"
          onClick={onGenerateReport}
          disabled={loading || exporting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            background: 'var(--iocl-red, #B71C1C)',
            border: 'none',
            color: '#FFFFFF',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(183, 28, 28, 0.25)'
          }}
        >
          <Play size={14} fill="#FFFFFF" />
          <span>{loading ? 'Generating...' : 'Generate Report'}</span>
        </button>

        {/* Export to Excel Button (Prominent) */}
        <button
          type="button"
          className="btn-export-excel"
          onClick={onExportExcel}
          disabled={loading || exporting}
          title="Export current filtered report to Microsoft Excel (.xlsx)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            background: '#107C41', // Microsoft Excel Official Green
            border: 'none',
            color: '#FFFFFF',
            cursor: exporting ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(16, 124, 65, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <FileSpreadsheet size={16} />
          <span>{exporting ? 'Preparing Excel...' : 'Export to Excel'}</span>
        </button>

        {/* Secondary Export Options */}
        <button
          type="button"
          className="btn-export-csv"
          onClick={onExportCsv}
          disabled={loading || exporting}
          title="Export as CSV"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            background: '#FFFFFF',
            border: '1px solid var(--border-color, #CBD5E1)',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <Download size={14} />
          <span>CSV</span>
        </button>

        <button
          type="button"
          className="btn-print"
          onClick={onPrint}
          disabled={loading || exporting}
          title="Print report preview"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            background: '#FFFFFF',
            border: '1px solid var(--border-color, #CBD5E1)',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <Printer size={14} />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
};

export default ReportActionBar;
