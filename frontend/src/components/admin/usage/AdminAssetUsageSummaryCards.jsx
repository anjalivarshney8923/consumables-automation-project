import React from 'react';
import { ClipboardList, Package, UserCheck, ShieldCheck } from 'lucide-react';

export const AdminAssetUsageSummaryCards = ({
  summary = {},
  loading = false
}) => {
  const totalRecords = summary?.totalRecords !== undefined ? Number(summary.totalRecords) : null;
  const totalQuantityUsed = summary?.totalQuantityUsed !== undefined ? Number(summary.totalQuantityUsed) : null;
  const totalEngineers = summary?.totalEngineers !== undefined ? Number(summary.totalEngineers) : null;
  const totalBeneficiaries = summary?.totalBeneficiaries !== undefined ? Number(summary.totalBeneficiaries) : null;

  return (
    <div className="kpi-grid mb-6">
      {/* Card 1: Total Usage Records */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Total Usage Records</span>
          <div className="kpi-icon-container kpi-icon-navy">
            <ClipboardList size={20} />
          </div>
        </div>
        <div className="kpi-card-body">
          {loading ? (
            <div
              className="kpi-skeleton-value"
              style={{
                width: '80px',
                height: '32px',
                background: '#E2E8F0',
                borderRadius: '4px',
                animation: 'pulse 1.5s infinite'
              }}
            />
          ) : (
            <span className="kpi-card-value">
              {totalRecords !== null ? totalRecords.toLocaleString('en-IN') : '--'}
            </span>
          )}
        </div>
        <div className="kpi-card-footer">
          <span>Logged Usage Events</span>
          <span style={{ fontWeight: '600', color: 'var(--iocl-navy)' }}>All Submissions</span>
        </div>
      </div>

      {/* Card 2: Total Quantity Used */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Total Quantity Used</span>
          <div className="kpi-icon-container kpi-icon-saffron">
            <Package size={20} />
          </div>
        </div>
        <div className="kpi-card-body">
          {loading ? (
            <div
              className="kpi-skeleton-value"
              style={{
                width: '80px',
                height: '32px',
                background: '#E2E8F0',
                borderRadius: '4px',
                animation: 'pulse 1.5s infinite'
              }}
            />
          ) : (
            <span className="kpi-card-value" style={{ color: '#D97706' }}>
              {totalQuantityUsed !== null ? totalQuantityUsed.toLocaleString('en-IN') : '--'}
            </span>
          )}
        </div>
        <div className="kpi-card-footer">
          <span>Physical Consumables</span>
          <span style={{ fontWeight: '600', color: '#D97706' }}>Units Distributed</span>
        </div>
      </div>

      {/* Card 3: Total Engineers */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Total Engineers</span>
          <div className="kpi-icon-container kpi-icon-purple">
            <UserCheck size={20} />
          </div>
        </div>
        <div className="kpi-card-body">
          {loading ? (
            <div
              className="kpi-skeleton-value"
              style={{
                width: '80px',
                height: '32px',
                background: '#E2E8F0',
                borderRadius: '4px',
                animation: 'pulse 1.5s infinite'
              }}
            />
          ) : (
            <span className="kpi-card-value" style={{ color: '#7C3AED' }}>
              {totalEngineers !== null ? totalEngineers.toLocaleString('en-IN') : '--'}
            </span>
          )}
        </div>
        <div className="kpi-card-footer">
          <span>Maintenance Staff</span>
          <span style={{ fontWeight: '600', color: '#7C3AED' }}>Submitting Users</span>
        </div>
      </div>

      {/* Card 4: Total Beneficiaries */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Total Beneficiaries</span>
          <div className="kpi-icon-container kpi-icon-green">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="kpi-card-body">
          {loading ? (
            <div
              className="kpi-skeleton-value"
              style={{
                width: '80px',
                height: '32px',
                background: '#E2E8F0',
                borderRadius: '4px',
                animation: 'pulse 1.5s infinite'
              }}
            />
          ) : (
            <span className="kpi-card-value" style={{ color: '#059669' }}>
              {totalBeneficiaries !== null ? totalBeneficiaries.toLocaleString('en-IN') : '--'}
            </span>
          )}
        </div>
        <div className="kpi-card-footer">
          <span>End Users & Cabins</span>
          <span style={{ fontWeight: '600', color: '#059669' }}>Asset Recipients</span>
        </div>
      </div>
    </div>
  );
};

export default AdminAssetUsageSummaryCards;
