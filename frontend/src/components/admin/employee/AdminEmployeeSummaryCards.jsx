import React from 'react';
import { Users, UserCheck, Building, Printer } from 'lucide-react';

export const AdminEmployeeSummaryCards = ({
  summary = {},
  loading = false
}) => {
  const totalEmployees = summary?.totalEmployees !== undefined && summary?.totalEmployees !== null ? Number(summary.totalEmployees) : null;
  const activeEmployees = summary?.activeEmployees !== undefined && summary?.activeEmployees !== null ? Number(summary.activeEmployees) : null;
  const totalDepartments = summary?.totalDepartments !== undefined && summary?.totalDepartments !== null ? Number(summary.totalDepartments) : null;
  const employeesWithPrinters = summary?.employeesWithPrinters !== undefined && summary?.employeesWithPrinters !== null ? Number(summary.employeesWithPrinters) : null;

  return (
    <div className="kpi-grid mb-6">
      {/* Card 1: Total Employees */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Total Employees</span>
          <div className="kpi-icon-container kpi-icon-navy">
            <Users size={20} />
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
              {totalEmployees !== null ? totalEmployees.toLocaleString('en-IN') : '--'}
            </span>
          )}
        </div>
        <div className="kpi-card-footer">
          <span>Enterprise Directory</span>
          <span style={{ fontWeight: '600', color: 'var(--iocl-red, #B71C1C)' }}>All Staff</span>
        </div>
      </div>

      {/* Card 2: Active Employees */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Active Employees</span>
          <div className="kpi-icon-container kpi-icon-green">
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
            <span className="kpi-card-value" style={{ color: '#059669' }}>
              {activeEmployees !== null ? activeEmployees.toLocaleString('en-IN') : '--'}
            </span>
          )}
        </div>
        <div className="kpi-card-footer">
          <span>Current Beneficiaries</span>
          <span style={{ fontWeight: '600', color: '#059669' }}>Eligible</span>
        </div>
      </div>

      {/* Card 3: Departments */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">Departments</span>
          <div className="kpi-icon-container kpi-icon-saffron">
            <Building size={20} />
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
              {totalDepartments !== null ? totalDepartments.toLocaleString('en-IN') : '--'}
            </span>
          )}
        </div>
        <div className="kpi-card-footer">
          <span>Functional Units</span>
          <span style={{ fontWeight: '600', color: '#D97706' }}>Across IOCL</span>
        </div>
      </div>

      {/* Card 4: Employees With Printers */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-card-title">With Printers</span>
          <div className="kpi-icon-container kpi-icon-purple">
            <Printer size={20} />
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
              {employeesWithPrinters !== null ? employeesWithPrinters.toLocaleString('en-IN') : '--'}
            </span>
          )}
        </div>
        <div className="kpi-card-footer">
          <span>Assigned Hardware</span>
          <span style={{ fontWeight: '600', color: '#7C3AED' }}>Assets Mapped</span>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeeSummaryCards;
