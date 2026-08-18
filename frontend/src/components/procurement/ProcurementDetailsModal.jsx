import React from 'react';
import { X, FileSpreadsheet, Calendar, Building2, Printer, Package, Hash, IndianRupee, Percent } from 'lucide-react';
import { ProcurementStatusBadge } from './ProcurementStatusBadge';

export const ProcurementDetailsModal = ({ record, onClose }) => {
  if (!record) return null;

  const rate = Number(record.ratePerUnit) || 0;
  const taxPct = Number(record.tax) || Number(record.taxPercentage) || 0;
  const qty = Number(record.contractQuantity) || Number(record.totalContractQuantity) || 0;
  const baseValue = rate * qty;
  const taxValue = baseValue * (taxPct / 100);
  const totalValue = baseValue + taxValue;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <FileSpreadsheet size={20} className="text-navy" />
            </div>
            <div>
              <h3 className="modal-title">Procurement Record Details</h3>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="details-status-row">
            <span className="details-label">Record Status:</span>
            <ProcurementStatusBadge status={record.status} />
          </div>

          <div className="details-grid">
            <div className="details-item">
              <span className="item-label">
                <Calendar size={14} /> Contract Date
              </span>
              <span className="item-value">{record.date || record.contractDate || 'N/A'}</span>
            </div>

            <div className="details-item">
              <span className="item-label">
                <Building2 size={14} /> Supplier Name
              </span>
              <span className="item-value font-semibold text-navy">{record.supplierName || 'N/A'}</span>
            </div>

            <div className="details-item">
              <span className="item-label">
                <Printer size={14} /> Printer Name / Model
              </span>
              <span className="item-value">{record.printerName || 'N/A'}</span>
            </div>

            <div className="details-item">
              <span className="item-label">
                <Package size={14} /> Cartridge Name
              </span>
              <span className="item-value">{record.cartridgeName || 'N/A'}</span>
            </div>

            <div className="details-item">
              <span className="item-label">Part Number</span>
              <span className="item-value part-number-chip">{record.cartridgePartNumber || record.partNumber || 'N/A'}</span>
            </div>

            <div className="details-item">
              <span className="item-label">
                <Hash size={14} /> Rate Contract Quantity
              </span>
              <span className="item-value font-bold">{qty}</span>
            </div>

            <div className="details-item">
              <span className="item-label">Quantity Executed</span>
              <span className="item-value text-muted">{record.executedQuantity ?? record.quantityAlreadyExecuted ?? 0}</span>
            </div>

            <div className="details-item">
              <span className="item-label">Qty Taken vide WO</span>
              <span className="item-value text-saffron font-semibold">{record.callUpPoQuantity ?? record.quantityTakenThroughWO ?? 0}</span>
            </div>

            <div className="details-item">
              <span className="item-label">Net Available Quota</span>
              <span className="item-value text-success font-bold">{record.netAvailableQuantity ?? 0}</span>
            </div>

            <div className="details-item">
              <span className="item-label">
                <IndianRupee size={14} /> Rate Per Unit
              </span>
              <span className="item-value">₹ {rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="details-item">
              <span className="item-label">
                <Percent size={14} /> Tax Rate
              </span>
              <span className="item-value">{taxPct}%</span>
            </div>
          </div>

          {/* Financial Breakdown Box */}
          <div className="contract-summary-preview mt-4">
            <div className="summary-col">
              <span className="summary-label">Base Value</span>
              <span className="summary-val">₹ {baseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Tax ({taxPct}%)</span>
              <span className="summary-val">₹ {taxValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-col highlight">
              <span className="summary-label">Total Contract Value</span>
              <span className="summary-val">₹ {totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-primary-action" onClick={onClose}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
