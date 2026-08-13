import React from 'react';
import { FileText, CheckCircle2, Hash, Layers } from 'lucide-react';

export const ProcurementSummaryCards = ({ records = [] }) => {
  const totalRecords = records.length;

  const activeContracts = records.filter(
    (r) => r.status === 'Active' || r.status === 'Partially Used'
  ).length;

  const totalContractQty = records.reduce(
    (sum, r) => sum + (Number(r.totalContractQuantity) || 0),
    0
  );

  const totalAvailableQty = records.reduce(
    (sum, r) => sum + (Number(r.netAvailableQuantity) || 0),
    0
  );

  return (
    <div className="kpi-grid mb-6">
      {/* Card 1: Total Records */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Total Register Records</span>
          <div className="kpi-icon-container kpi-icon-navy">
            <FileText size={20} />
          </div>
        </div>
        <div className="kpi-card-body">
          <span className="kpi-card-value">{totalRecords}</span>
        </div>
        <div className="kpi-card-footer">
          <span>Master Procurement Entries</span>
          <span style={{ fontWeight: '500' }}>Active System</span>
        </div>
      </div>

      {/* Card 2: Active Contracts */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Active Rate Contracts</span>
          <div className="kpi-icon-container kpi-icon-green">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="kpi-card-body">
          <span className="kpi-card-value">{activeContracts}</span>
        </div>
        <div className="kpi-card-footer">
          <span>Valid Executing RCs</span>
          <span style={{ fontWeight: '500', color: '#059669' }}>In Force</span>
        </div>
      </div>

      {/* Card 3: Total Contract Quantity */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Total Contract Quantity</span>
          <div className="kpi-icon-container kpi-icon-saffron">
            <Hash size={20} />
          </div>
        </div>
        <div className="kpi-card-body">
          <span className="kpi-card-value">{totalContractQty.toLocaleString('en-IN')}</span>
        </div>
        <div className="kpi-card-footer">
          <span>Cumulative Units Ordered</span>
          <span style={{ fontWeight: '500' }}>Rate Contracts</span>
        </div>
      </div>

      {/* Card 4: Total Available Quantity */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Total Available Quota</span>
          <div className="kpi-icon-container kpi-icon-purple">
            <Layers size={20} />
          </div>
        </div>
        <div className="kpi-card-body">
          <span className="kpi-card-value">{totalAvailableQty.toLocaleString('en-IN')}</span>
        </div>
        <div className="kpi-card-footer">
          <span>Net Remaining Units</span>
          <span style={{ fontWeight: '500', color: '#7C3AED' }}>Call-Up Quota</span>
        </div>
      </div>
    </div>
  );
};
