import React from 'react';
import {
  ClipboardList,
  Layers,
  Users,
  UserCheck,
  Boxes,
  Package,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  TrendingDown,
  CheckCircle,
  FileSpreadsheet,
  Building,
  Printer,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Activity
} from 'lucide-react';

export const ReportSummaryCards = ({
  reportType = 'ASSET_USAGE',
  summary = {},
  loading = false
}) => {
  const renderCard = (title, value, subtitle, tagText, Icon, iconClass, valueColor) => (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-card-title">{title}</span>
        <div className={`kpi-icon-container ${iconClass}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="kpi-card-body">
        {loading ? (
          <div
            className="kpi-skeleton-value"
            style={{
              width: '80px',
              height: '30px',
              background: '#E2E8F0',
              borderRadius: '4px',
              animation: 'pulse 1.5s infinite'
            }}
          />
        ) : (
          <span className="kpi-card-value" style={valueColor ? { color: valueColor } : {}}>
            {value !== undefined && value !== null ? value.toLocaleString('en-IN') : '--'}
          </span>
        )}
      </div>
      <div className="kpi-card-footer">
        <span>{subtitle}</span>
        {tagText && <span style={{ fontWeight: 600, color: valueColor || 'var(--iocl-navy)' }}>{tagText}</span>}
      </div>
    </div>
  );

  return (
    <div className="kpi-grid mb-6">
      {/* 1. ASSET USAGE REPORT CARDS */}
      {reportType === 'ASSET_USAGE' && (
        <>
          {renderCard(
            'Total Usage Records',
            summary?.totalRecords,
            'Issued Transactions',
            'All Logs',
            ClipboardList,
            'kpi-icon-navy',
            'var(--iocl-navy)'
          )}
          {renderCard(
            'Total Quantity Used',
            summary?.totalQuantityUsed,
            'Cartridges Consumed',
            'Total Units',
            Layers,
            'kpi-icon-saffron',
            '#D97706'
          )}
          {renderCard(
            'Total Engineers',
            summary?.totalEngineers,
            'Maintenance Staff',
            'Active',
            Users,
            'kpi-icon-green',
            '#059669'
          )}
          {renderCard(
            'Total Beneficiaries',
            summary?.totalBeneficiaries,
            'End Recipients',
            'Enterprise',
            UserCheck,
            'kpi-icon-purple',
            '#7C3AED'
          )}
        </>
      )}

      {/* 2. STORE INVENTORY REPORT CARDS */}
      {reportType === 'STORE_INVENTORY' && (
        <>
          {renderCard(
            'Total Assets / Items',
            summary?.totalItems,
            'Master Catalogue',
            'SKUs',
            Boxes,
            'kpi-icon-navy',
            'var(--iocl-navy)'
          )}
          {renderCard(
            'Total Store Quantity',
            summary?.totalStoreQuantity,
            'Warehouse Available',
            'In-Stock',
            Package,
            'kpi-icon-green',
            '#059669'
          )}
          {renderCard(
            'Low Stock Items',
            summary?.lowStockItems,
            'Below Reorder Level',
            'Needs Refill',
            AlertTriangle,
            'kpi-icon-saffron',
            '#D97706'
          )}
          {renderCard(
            'Out of Stock Items',
            summary?.outOfStockItems,
            'Zero Available Quantity',
            'Critical',
            XCircle,
            'kpi-icon-red',
            '#DC2626'
          )}
        </>
      )}

      {/* 3. PROCUREMENT / RATE CONTRACT REPORT CARDS */}
      {reportType === 'PROCUREMENT' && (
        <>
          {renderCard(
            'Total Rate Contracts',
            summary?.totalRateContracts,
            'Active Agreements',
            'Allocated',
            ShoppingBag,
            'kpi-icon-navy',
            'var(--iocl-navy)'
          )}
          {renderCard(
            'Total Contract Quantity',
            summary?.totalContractQuantity,
            'Sanctioned Limit',
            'Total RC',
            Package,
            'kpi-icon-purple',
            '#7C3AED'
          )}
          {renderCard(
            'Qty Taken Vide WO',
            summary?.totalQtyTakenVideWO,
            'Executed via Call-Up',
            'Drawn',
            TrendingDown,
            'kpi-icon-saffron',
            '#D97706'
          )}
          {renderCard(
            'Net Available RC',
            summary?.totalNetAvailableRC,
            'Balance Contract Limit',
            'Remaining',
            CheckCircle,
            'kpi-icon-green',
            '#059669'
          )}
        </>
      )}

      {/* 4. CALL-UP PO REPORT CARDS */}
      {reportType === 'CALL_UP_PO' && (
        <>
          {renderCard(
            'Total Call-Up POs',
            summary?.totalPOs,
            'Purchase Orders Raised',
            'All POs',
            FileSpreadsheet,
            'kpi-icon-navy',
            'var(--iocl-navy)'
          )}
          {renderCard(
            'Total PO Quantity',
            summary?.totalPOQuantity,
            'Ordered Units',
            'Placed',
            Package,
            'kpi-icon-purple',
            '#7C3AED'
          )}
          {renderCard(
            'Total Executed',
            summary?.totalExecutedQuantity,
            'Delivered & Received',
            'Fulfilled',
            CheckCircle,
            'kpi-icon-green',
            '#059669'
          )}
          {renderCard(
            'Total Remaining',
            summary?.totalRemainingQuantity,
            'Pending Supply',
            'Outstanding',
            TrendingDown,
            'kpi-icon-saffron',
            '#D97706'
          )}
        </>
      )}

      {/* 5. EMPLOYEE REPORT CARDS */}
      {reportType === 'EMPLOYEE' && (
        <>
          {renderCard(
            'Total Employees',
            summary?.totalEmployees,
            'Enterprise Directory',
            'All Staff',
            Users,
            'kpi-icon-navy',
            'var(--iocl-navy)'
          )}
          {renderCard(
            'Active Employees',
            summary?.activeEmployees,
            'Eligible Beneficiaries',
            'Active',
            UserCheck,
            'kpi-icon-green',
            '#059669'
          )}
          {renderCard(
            'Total Departments',
            summary?.totalDepartments,
            'Functional Units',
            'Across IOCL',
            Building,
            'kpi-icon-saffron',
            '#D97706'
          )}
          {renderCard(
            'With Printers',
            summary?.employeesWithPrinters,
            'Assigned Hardware',
            'Mapped',
            Printer,
            'kpi-icon-purple',
            '#7C3AED'
          )}
        </>
      )}

      {/* 6. STORE STOCK HISTORY REPORT CARDS */}
      {reportType === 'STOCK_HISTORY' && (
        <>
          {renderCard(
            'Total Transactions',
            summary?.totalTransactions,
            'Movement Entries',
            'All Ledger',
            History,
            'kpi-icon-navy',
            'var(--iocl-navy)'
          )}
          {renderCard(
            'Total Stock In',
            summary?.totalStockIn,
            'Goods Received',
            'Inward',
            ArrowDownRight,
            'kpi-icon-green',
            '#059669'
          )}
          {renderCard(
            'Total Stock Out',
            summary?.totalStockOut,
            'Issued Consumables',
            'Outward',
            ArrowUpRight,
            'kpi-icon-red',
            '#DC2626'
          )}
          {renderCard(
            'Net Stock Movement',
            summary?.netMovement,
            'Inflow vs Outflow Delta',
            'Balance Delta',
            Activity,
            'kpi-icon-saffron',
            '#D97706'
          )}
        </>
      )}
    </div>
  );
};

export default ReportSummaryCards;
