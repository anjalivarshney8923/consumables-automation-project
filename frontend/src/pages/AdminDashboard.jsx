import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Boxes,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Calendar,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
  Bell,
  Sliders,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUnreadAlerts, getTenderingAlerts, markAlertAsRead, getAlertCounts } from '../services/alertService';
import { getProcurementRecords, getRateContracts, getCallUpPOs } from '../services/procurementService';
import { getThresholds } from '../services/thresholdService';

export const AdminDashboard = () => {
  const { adminUser } = useAuth();
  const adminName = adminUser?.name || 'IOCL Administrator';

  // Section Loading States
  const [globalRefreshing, setGlobalRefreshing] = useState(false);
  const [procurementLoading, setProcurementLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [tenderingLoading, setTenderingLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // Section Error States
  const [procurementError, setProcurementError] = useState(null);
  const [inventoryError, setInventoryError] = useState(null);
  const [tenderingError, setTenderingError] = useState(null);
  const [alertsError, setAlertsError] = useState(null);

  // Real Database-Backed Datasets
  const [procurementSummary, setProcurementSummary] = useState({
    totalRateContracts: 0,
    totalCallUpPOs: 0,
    activeContracts: 0,
    totalContractUnits: 0
  });
  const [recentProcurementRecords, setRecentProcurementRecords] = useState([]);

  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryMetrics, setInventoryMetrics] = useState({
    totalSKUs: 0,
    adequateCount: 0,
    lowAvailabilityCount: 0,
    totalPrinters: 0
  });

  const [tenderingList, setTenderingList] = useState([]);
  const [tenderingUrgentCount, setTenderingUrgentCount] = useState(0);

  const [activeAlerts, setActiveAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  // Real Activity Events from Database Entity Timestamps
  const [recentActivities, setRecentActivities] = useState([]);

  // =========================================================================
  // 1. Fetch Real Procurement Data (Rate Contracts, Call-Up POs, Full View)
  // =========================================================================
  const fetchProcurementData = useCallback(async () => {
    setProcurementLoading(true);
    setProcurementError(null);
    try {
      const [rcRes, poRes, fullViewRes] = await Promise.all([
        getRateContracts(),
        getCallUpPOs(),
        getProcurementRecords({ page: 0, size: 5, sort: 'contractDate,desc' })
      ]);

      let rateContracts = [];
      let callUpPOs = [];

      if (rcRes.success && Array.isArray(rcRes.data)) {
        rateContracts = rcRes.data;
      }
      if (poRes.success && Array.isArray(poRes.data)) {
        callUpPOs = poRes.data;
      }

      if (fullViewRes.success && fullViewRes.data) {
        setRecentProcurementRecords(fullViewRes.data.content || []);
      }

      const activeCount = rateContracts.filter(
        (rc) => rc.netAvailableQuantity > 0 || rc.status === 'Active'
      ).length;

      const totalUnits = rateContracts.reduce(
        (sum, rc) => sum + (Number(rc.totalContractQuantity) || 0),
        0
      );

      setProcurementSummary({
        totalRateContracts: rateContracts.length,
        totalCallUpPOs: callUpPOs.length,
        activeContracts: activeCount,
        totalContractUnits: totalUnits
      });
    } catch (err) {
      setProcurementError('Unable to connect to procurement service.');
    } finally {
      setProcurementLoading(false);
    }
  }, []);

  // =========================================================================
  // 2. Fetch Real Store Inventory & Threshold Metrics (/api/thresholds)
  // =========================================================================
  const fetchInventoryData = useCallback(async () => {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const res = await getThresholds();
      if (res.success && Array.isArray(res.data)) {
        setInventoryList(res.data);
        const total = res.data.length;
        const adequate = res.data.filter((item) => item.status === 'Adequate').length;
        const low = res.data.filter((item) => item.status === 'Low Availability').length;
        const printers = res.data.reduce(
          (sum, item) => sum + (Number(item.numberOfPrinters) || 0),
          0
        );

        setInventoryMetrics({
          totalSKUs: total,
          adequateCount: adequate,
          lowAvailabilityCount: low,
          totalPrinters: printers
        });
      } else {
        setInventoryError(res.message || 'Failed to load store inventory.');
      }
    } catch (err) {
      setInventoryError('Unable to connect to inventory service.');
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  // =========================================================================
  // 3. Fetch Real Alert 2 Tendering Records (/api/alerts/tendering)
  // =========================================================================
  const fetchTenderingData = useCallback(async () => {
    setTenderingLoading(true);
    setTenderingError(null);
    try {
      const res = await getTenderingAlerts();
      if (res.success && Array.isArray(res.data)) {
        setTenderingList(res.data);
        const urgentItems = res.data.filter((item) => {
          const storeQty = Number(item.storeNetAvailableQuantity) || 0;
          const rcQty = Number(item.rateContractNetAvailableQuantity) || 0;
          const combinedQty = item.combinedNetAvailableQuantity !== undefined
            ? Number(item.combinedNetAvailableQuantity)
            : storeQty + rcQty;
          const threshold = Number(item.tenderingThreshold) || 0;
          return item.isUrgent !== undefined ? Boolean(item.isUrgent) : combinedQty < threshold;
        });
        setTenderingUrgentCount(urgentItems.length);
      } else {
        setTenderingError(res.message || 'Failed to load tendering alerts.');
      }
    } catch (err) {
      setTenderingError('Unable to connect to tendering alert service.');
    } finally {
      setTenderingLoading(false);
    }
  }, []);

  // =========================================================================
  // 4. Fetch Real Active System Alerts (/api/alerts/unread & /count)
  // =========================================================================
  const fetchAlertsData = useCallback(async () => {
    setAlertsLoading(true);
    setAlertsError(null);
    try {
      const [alertsRes, countRes] = await Promise.all([
        getUnreadAlerts(),
        getAlertCounts()
      ]);

      if (alertsRes.success && Array.isArray(alertsRes.data)) {
        setActiveAlerts(alertsRes.data);
      }
      if (countRes.success && countRes.data) {
        setUnreadAlertsCount(countRes.data.unreadCount || 0);
      }
    } catch (err) {
      setAlertsError('Unable to connect to alert service.');
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  // =========================================================================
  // 5. Global Dashboard Refresh
  // =========================================================================
  const refreshAllDashboardData = useCallback(async () => {
    setGlobalRefreshing(true);
    await Promise.allSettled([
      fetchProcurementData(),
      fetchInventoryData(),
      fetchTenderingData(),
      fetchAlertsData()
    ]);
    setGlobalRefreshing(false);
  }, [fetchProcurementData, fetchInventoryData, fetchTenderingData, fetchAlertsData]);

  useEffect(() => {
    refreshAllDashboardData();
    const interval = setInterval(refreshAllDashboardData, 30000);
    return () => clearInterval(interval);
  }, [refreshAllDashboardData]);

  // Handle Dismiss Alert
  const handleDismissAlert = async (alertId) => {
    const res = await markAlertAsRead(alertId);
    if (res.success) {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setUnreadAlertsCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Compile real activity timeline from loaded database entities
  useEffect(() => {
    const events = [];

    // Real alert events
    activeAlerts.forEach((alert) => {
      if (alert.createdAt) {
        events.push({
          id: `alert-${alert.id}`,
          title: `Alert Generated: ${alert.cartridgeName} (${alert.partNumber})`,
          description: alert.message,
          timestamp: new Date(alert.createdAt),
          type: alert.severity === 'URGENT' ? 'red' : 'saffron'
        });
      }
    });

    // Real procurement events
    recentProcurementRecords.forEach((rec) => {
      if (rec.contractDate) {
        events.push({
          id: `rc-${rec.id}`,
          title: `Rate Contract: ${rec.supplierName} - ${rec.cartridgeName || rec.partNumber}`,
          description: `Contract Qty: ${rec.totalContractQuantity} units (Net Available: ${rec.netAvailableQuantity})`,
          timestamp: new Date(rec.contractDate),
          type: 'green'
        });
      }
    });

    // Real inventory updates
    inventoryList.forEach((inv) => {
      if (inv.updatedAt) {
        events.push({
          id: `inv-${inv.id}`,
          title: `Threshold Updated: ${inv.cartridgeName} (${inv.partNumber})`,
          description: `PO Threshold: ${inv.poThreshold}, Tendering Threshold: ${inv.tenderingThreshold}`,
          timestamp: new Date(inv.updatedAt),
          type: 'navy'
        });
      }
    });

    // Sort by most recent
    events.sort((a, b) => b.timestamp - a.timestamp);
    setRecentActivities(events.slice(0, 6));
  }, [activeAlerts, recentProcurementRecords, inventoryList]);

  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="dashboard-content-layout">
      {/* ================================================================= */}
      {/* 1. WELCOME HERO BANNER & REFRESH ACTION                           */}
      {/* ================================================================= */}
      <section className="dashboard-welcome-hero" aria-label="Dashboard Overview">
        <div className="welcome-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="welcome-heading">Welcome, {adminName}</h1>
            <span className="welcome-role-badge">
              IOCL Admin
            </span>
          </div>
          <p className="welcome-subtext">
            Consumables & Procurement Management System
          </p>
        </div>

        <div className="welcome-badges">
          <span className="status-pill status-pill-online" title="System Operational">
            <span className="status-dot" />
            System Active
          </span>
          <span className="welcome-date-badge">
            <Calendar size={14} />
            <span>{todayDate}</span>
          </span>
          <button
            type="button"
            onClick={refreshAllDashboardData}
            className="btn-refresh-icon"
            title="Refresh all real metrics"
            aria-label="Refresh dashboard data"
            disabled={globalRefreshing}
          >
            <RefreshCw size={14} className={globalRefreshing ? 'spin-icon' : ''} />
          </button>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. TOP SUMMARY KPI CARDS GRID (REAL DATA)                         */}
      {/* ================================================================= */}
      <section aria-label="Key Performance Indicators">
        <div className="kpi-grid">
          {/* Card 1: Procurement Register */}
          <Link
            to="/admin/full-view"
            className="kpi-card kpi-card-clickable"
            title="View Full Procurement Records"
          >
            <div className="kpi-card-header">
              <span className="kpi-card-title">Procurement Register</span>
              <div className="kpi-icon-container kpi-icon-navy">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="kpi-card-body">
              <span className="kpi-card-value">
                {procurementLoading ? '...' : procurementSummary.totalRateContracts}
              </span>
              <span className="kpi-card-placeholder-badge">
                {procurementSummary.activeContracts} Active Contracts
              </span>
            </div>
            <div className="kpi-card-footer">
              <span>Total Call-Up POs: {procurementSummary.totalCallUpPOs}</span>
              <span className="kpi-card-link-text">
                Full View <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>

          {/* Card 2: Store Inventory */}
          <Link
            to="/admin/thresholds"
            className="kpi-card kpi-card-clickable"
            title="View Threshold Limits & Store Inventory"
          >
            <div className="kpi-card-header">
              <span className="kpi-card-title">Store Inventory</span>
              <div className="kpi-icon-container kpi-icon-saffron">
                <Boxes size={20} />
              </div>
            </div>
            <div className="kpi-card-body">
              <span className="kpi-card-value">
                {inventoryLoading ? '...' : inventoryMetrics.totalSKUs}
              </span>
              <span className="kpi-card-placeholder-badge" style={{ color: '#16A34A' }}>
                {inventoryMetrics.adequateCount} Adequate SKUs
              </span>
            </div>
            <div className="kpi-card-footer">
              <span>Printers Managed: {inventoryMetrics.totalPrinters}</span>
              <span className="kpi-card-link-text" style={{ color: 'var(--iocl-navy)' }}>
                Configure <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>

          {/* Card 3: Alert 2 Tendering Alerts */}
          <Link
            to="/admin/tendering-alerts"
            className="kpi-card kpi-card-clickable"
            title="View Urgent Tendering Alerts"
          >
            <div className="kpi-card-header">
              <span className="kpi-card-title">Tendering Alerts</span>
              <div className="kpi-icon-container kpi-icon-red">
                <AlertOctagon size={20} />
              </div>
            </div>
            <div className="kpi-card-body">
              <span className="kpi-card-value" style={{ color: 'var(--iocl-red)' }}>
                {tenderingLoading ? '...' : tenderingUrgentCount}
              </span>
              <span className="kpi-card-urgent-badge">
                Urgent Action
              </span>
            </div>
            <div className="kpi-card-footer">
              <span>Combined &lt; Threshold</span>
              <span className="kpi-card-link-text">
                View Alerts <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>

          {/* Card 4: Active System Alerts */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">Active System Alerts</span>
              <div className="kpi-icon-container" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                <Bell size={20} />
              </div>
            </div>
            <div className="kpi-card-body">
              <span className="kpi-card-value" style={{ color: '#D97706' }}>
                {alertsLoading ? '...' : unreadAlertsCount}
              </span>
              <span className="kpi-card-placeholder-badge">
                Real-Time State
              </span>
            </div>
            <div className="kpi-card-footer">
              <span>Threshold & Tendering</span>
              <span style={{ fontWeight: '700', color: '#D97706' }}>
                Active Alerts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. PROCUREMENT REGISTER (REAL DATA FROM POSTGRESQL)               */}
      {/* ================================================================= */}
      <section className="section-card" aria-label="Procurement Register">
        <div className="section-header">
          <div className="section-title">
            <ShoppingBag size={18} color="var(--iocl-navy)" />
            <span>Procurement Register Overview</span>
          </div>
          <Link to="/admin/full-view" className="section-view-all-btn">
            <span>View All Records</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        <div className="section-body">
          {/* Procurement Real Stats Grid */}
          <div className="dashboard-stat-grid">
            <div className="dashboard-stat-box">
              <span className="stat-box-label">Rate Contracts</span>
              <span className="stat-box-value">
                {procurementLoading ? '...' : procurementSummary.totalRateContracts}
              </span>
            </div>
            <div className="dashboard-stat-box">
              <span className="stat-box-label">Call-Up POs</span>
              <span className="stat-box-value">
                {procurementLoading ? '...' : procurementSummary.totalCallUpPOs}
              </span>
            </div>
            <div className="dashboard-stat-box">
              <span className="stat-box-label">Active Contracts</span>
              <span className="stat-box-value green">
                {procurementLoading ? '...' : procurementSummary.activeContracts}
              </span>
            </div>
            <div className="dashboard-stat-box">
              <span className="stat-box-label">Total Contract Qty</span>
              <span className="stat-box-value">
                {procurementLoading ? '...' : procurementSummary.totalContractUnits.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Recent Procurement Entries Table */}
          {procurementLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading real procurement records...
            </div>
          ) : procurementError ? (
            <div className="section-error-card">
              <span className="section-error-text">{procurementError}</span>
              <button
                type="button"
                onClick={fetchProcurementData}
                className="btn-section-retry"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : recentProcurementRecords.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <FileSpreadsheet size={22} color="var(--iocl-navy)" />
              </div>
              <h2 className="empty-state-title">No procurement records available</h2>
              <p className="empty-state-desc">
                No rate contracts or purchase orders recorded.
              </p>
            </div>
          ) : (
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Supplier</th>
                    <th>Cartridge Part No.</th>
                    <th>Printer Model</th>
                    <th className="text-right">Contract Qty</th>
                    <th className="text-right">Executed</th>
                    <th className="text-right">Vide WO</th>
                    <th className="text-right">Net Available</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProcurementRecords.map((record) => {
                    const isLow = (record.netAvailableQuantity || 0) <= (record.totalContractQuantity * 0.2);
                    return (
                      <tr key={record.id}>
                        <td style={{ whiteSpace: 'nowrap', fontWeight: '600' }}>
                          {record.contractDate
                            ? new Date(record.contractDate).toLocaleDateString('en-IN')
                            : '--'}
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--iocl-navy)' }}>
                          {record.supplierName}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '600' }}>{record.cartridgeName}</span>
                            <span className="part-number-chip">{record.partNumber}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {record.printerModel}
                        </td>
                        <td className="text-right" style={{ fontWeight: '600' }}>
                          {record.totalContractQuantity}
                        </td>
                        <td className="text-right">
                          {record.totalExecutedQuantity ?? 0}
                        </td>
                        <td className="text-right">
                          {record.quantityTakenVideWorkOrder ?? 0}
                        </td>
                        <td className="text-right" style={{ fontWeight: '700', color: isLow ? 'var(--iocl-red)' : '#16A34A' }}>
                          {record.netAvailableQuantity}
                        </td>
                        <td className="text-center">
                          <span className={`status-badge ${isLow ? 'badge-status-low' : 'badge-status-active'}`}>
                            <span className="status-badge-dot" />
                            {record.status || (isLow ? 'Low Availability' : 'Active')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. STORE INVENTORY (REAL DATA FROM POSTGRESQL)                    */}
      {/* ================================================================= */}
      <section className="section-card" aria-label="Store Inventory">
        <div className="section-header">
          <div className="section-title">
            <Boxes size={18} color="var(--iocl-navy)" />
            <span>Store Inventory & Consumable Quotas</span>
          </div>
          <Link to="/admin/thresholds" className="section-view-all-btn">
            <span>View Full Inventory</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        <div className="section-body">
          {/* Inventory Stats Grid */}
          <div className="dashboard-stat-grid">
            <div className="dashboard-stat-box">
              <span className="stat-box-label">Total SKUs</span>
              <span className="stat-box-value">
                {inventoryLoading ? '...' : inventoryMetrics.totalSKUs}
              </span>
            </div>
            <div className="dashboard-stat-box">
              <span className="stat-box-label">Adequate Stock</span>
              <span className="stat-box-value green">
                {inventoryLoading ? '...' : inventoryMetrics.adequateCount}
              </span>
            </div>
            <div className="dashboard-stat-box">
              <span className="stat-box-label">Low Availability</span>
              <span className="stat-box-value red">
                {inventoryLoading ? '...' : inventoryMetrics.lowAvailabilityCount}
              </span>
            </div>
            <div className="dashboard-stat-box">
              <span className="stat-box-label">Printers Managed</span>
              <span className="stat-box-value">
                {inventoryLoading ? '...' : inventoryMetrics.totalPrinters}
              </span>
            </div>
          </div>

          {/* Real Inventory Table */}
          {inventoryLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading real store inventory...
            </div>
          ) : inventoryError ? (
            <div className="section-error-card">
              <span className="section-error-text">{inventoryError}</span>
              <button
                type="button"
                onClick={fetchInventoryData}
                className="btn-section-retry"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : inventoryList.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <Boxes size={22} color="var(--iocl-navy)" />
              </div>
              <h2 className="empty-state-title">No inventory records available</h2>
              <p className="empty-state-desc">
                No cartridge threshold records.
              </p>
            </div>
          ) : (
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Part Number</th>
                    <th>Cartridge / Consumable</th>
                    <th>Printer Model</th>
                    <th className="text-right">Store Net Qty</th>
                    <th className="text-right">RC Net Avail</th>
                    <th className="text-right">PO Threshold</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.slice(0, 6).map((item) => {
                    const isAdequate = item.status === 'Adequate';
                    return (
                      <tr key={item.id || item.cartridgeId}>
                        <td>
                          <span className="part-number-chip">{item.partNumber}</span>
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--iocl-navy)' }}>
                          {item.cartridgeName}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {item.printerName}
                        </td>
                        <td className="text-right" style={{ fontWeight: '600' }}>
                          {item.storeQuantity ?? 0}
                        </td>
                        <td className="text-right" style={{ fontWeight: '600' }}>
                          {item.netAvailableQuantity ?? 0}
                        </td>
                        <td className="text-right" style={{ fontWeight: '700' }}>
                          {item.poThreshold}
                        </td>
                        <td className="text-center">
                          <span
                            className={`status-badge ${isAdequate ? 'badge-status-active' : 'badge-status-low'}`}
                          >
                            <span className="status-badge-dot" />
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. TENDERING ALERTS (REAL ALERT 2 DATA FROM POSTGRESQL)            */}
      {/* ================================================================= */}
      <section className="section-card" aria-label="Tendering Alerts">
        <div className="section-header">
          <div className="section-title">
            <AlertOctagon size={18} color="var(--iocl-red)" />
            <span>Urgent Tendering Alerts</span>
          </div>
          <Link to="/admin/tendering-alerts" className="section-view-all-btn">
            <span>View All Tendering Alerts</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        <div className="section-body">
          {tenderingLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Evaluating live tendering thresholds...
            </div>
          ) : tenderingError ? (
            <div className="section-error-card">
              <span className="section-error-text">{tenderingError}</span>
              <button
                type="button"
                onClick={fetchTenderingData}
                className="btn-section-retry"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : tenderingList.filter((item) => item.isUrgent).length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <CheckCircle2 size={24} color="#16A34A" />
              </div>
              <h2 className="empty-state-title">No urgent tendering alerts</h2>
              <p className="empty-state-desc">
                Combined store and rate contract availability for all consumables are above configured tendering thresholds.
              </p>
            </div>
          ) : (
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Part Number</th>
                    <th>Cartridge</th>
                    <th>Printer Model</th>
                    <th className="text-right">Store Net</th>
                    <th className="text-right">RC Net</th>
                    <th className="text-right">Combined</th>
                    <th className="text-right">Tendering Threshold</th>
                    <th className="text-right">Deficit</th>
                    <th className="text-center">Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  {tenderingList
                    .filter((item) => item.isUrgent)
                    .slice(0, 6)
                    .map((alert) => (
                      <tr key={alert.cartridgeId} style={{ backgroundColor: 'var(--iocl-red-light)' }}>
                        <td>
                          <span className="part-number-chip">{alert.partNumber}</span>
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                          {alert.cartridgeName}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {alert.printerModel}
                        </td>
                        <td className="text-right">{alert.storeNetAvailableQuantity ?? 0}</td>
                        <td className="text-right">{alert.rateContractNetAvailableQuantity ?? 0}</td>
                        <td className="text-right" style={{ fontWeight: '800', color: 'var(--iocl-red)' }}>
                          {alert.combinedNetAvailableQuantity ?? alert.netAvailableQuantity}
                        </td>
                        <td className="text-right" style={{ fontWeight: '700' }}>
                          {alert.tenderingThreshold}
                        </td>
                        <td className="text-right" style={{ fontWeight: '800', color: 'var(--iocl-red)' }}>
                          {alert.difference}
                        </td>
                        <td className="text-center">
                          <span className="kpi-card-urgent-badge">
                            URGENT — TENDERING REQUIRED
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. TWO-COLUMN GRID: RECENT ACTIVITY & ACTIVE SYSTEM ALERTS        */}
      {/* ================================================================= */}
      <section className="dashboard-sections-grid" aria-label="System Operational Feeds">
        {/* Real Recent Activity Timeline */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <Activity size={18} color="var(--iocl-navy)" />
              <span>Recent System Activity</span>
            </div>
          </div>

          <div className="section-body">
            {recentActivities.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">
                  <Activity size={22} color="var(--iocl-navy)" />
                </div>
                <h2 className="empty-state-title">No recent activity available</h2>
                <p className="empty-state-desc">
                  Administrative activities and transaction history will appear here as records are created.
                </p>
              </div>
            ) : (
              <div className="activity-timeline">
                {recentActivities.map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className={`activity-dot ${act.type}`} />
                    <div className="activity-content">
                      <span className="activity-title">{act.title}</span>
                      <span className="activity-meta">
                        <span>{act.description}</span>
                        <span>&bull;</span>
                        <span>
                          {act.timestamp.toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active System Alerts (Existing Working Component) */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <AlertTriangle size={18} color="var(--iocl-red)" />
              <span>Active System Alerts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Refresh</span>
              <button
                type="button"
                onClick={fetchAlertsData}
                className="btn-refresh-icon"
                title="Refresh alerts"
                aria-label="Refresh alerts"
              >
                <RefreshCw size={13} className={alertsLoading ? 'spin-icon' : ''} />
              </button>
            </div>
          </div>

          <div className="section-body">
            {alertsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Checking threshold alerts...
              </div>
            ) : alertsError ? (
              <div className="section-error-card">
                <span className="section-error-text">{alertsError}</span>
                <button
                  type="button"
                  onClick={fetchAlertsData}
                  className="btn-section-retry"
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            ) : activeAlerts.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">
                  <CheckCircle2 size={24} color="#16A34A" />
                </div>
                <h2 className="empty-state-title">No active alerts</h2>
                <p className="empty-state-desc">
                  All stock quotas and rate contract availability are within configured operating parameters.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeAlerts.map((alert) => {
                  const isUrgent =
                    alert.severity === 'URGENT' || alert.alertType === 'TENDERING_REQUIRED';

                  return (
                    <div
                      key={alert.id}
                      className={`alert-card-row ${isUrgent ? 'alert-urgent-row' : 'alert-warning-row'}`}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                          }}
                        >
                          <span className={`alert-type-pill ${isUrgent ? 'urgent' : 'warning'}`}>
                            {isUrgent ? 'URGENT: TENDERING REQUIRED' : 'PROCUREMENT THRESHOLD'}
                          </span>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {alert.cartridgeName}
                          </strong>
                          <span className="part-number-chip">{alert.partNumber}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDismissAlert(alert.id)}
                          className="btn-mark-item-read"
                        >
                          Mark Read
                        </button>
                      </div>

                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-secondary)',
                          margin: 0
                        }}
                      >
                        {alert.message}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {isUrgent ? (
                            <>
                              <span style={{ color: 'var(--iocl-red)', fontWeight: '700' }}>
                                Combined Available:{' '}
                                {alert.combinedNetAvailableQuantity ?? alert.netAvailableQuantity}
                              </span>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                                Tendering Threshold:{' '}
                                {alert.tenderingThreshold ?? alert.threshold}
                              </span>
                            </>
                          ) : (
                            <>
                              <span style={{ color: 'var(--iocl-red)', fontWeight: '700' }}>
                                Net Available in RC: {alert.netAvailableQuantity}
                              </span>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                                PO Threshold: {alert.threshold}
                              </span>
                            </>
                          )}
                        </div>
                        <Link to="/admin/thresholds" className="alert-config-link">
                          <span>Configure Threshold</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
