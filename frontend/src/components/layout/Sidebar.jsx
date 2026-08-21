import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FileSpreadsheet,
  Sliders,
  AlertOctagon,
  Package,
  Boxes,
  History,
  ClipboardList,
  Users,
  FileBarChart2,
  X
} from 'lucide-react';
import { IoclBrand } from '../branding/IoclBrand';
import { getTenderingAlerts } from '../../services/alertService';

export const Sidebar = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const [tenderingUrgentCount, setTenderingUrgentCount] = useState(null);

  // Fetch real Alert 2 count dynamically from backend state
  useEffect(() => {
    let isMounted = true;
    const fetchTenderingCount = async () => {
      try {
        const res = await getTenderingAlerts();
        if (res.success && Array.isArray(res.data) && isMounted) {
          const count = res.data.filter((item) => {
            const storeQty = Number(item.storeNetAvailableQuantity) || 0;
            const rcQty = Number(item.rateContractNetAvailableQuantity) || 0;
            const combinedQty = item.combinedNetAvailableQuantity !== undefined
              ? Number(item.combinedNetAvailableQuantity)
              : storeQty + rcQty;
            const threshold = Number(item.thresholdLimit ?? item.tenderingThreshold) || 0;
            return combinedQty <= threshold;
          }).length;
          setTenderingUrgentCount(count);
        }
      } catch {
        // Silently preserve dashboard resilience if server is restarting
      }
    };

    fetchTenderingCount();
    const interval = setInterval(fetchTenderingCount, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Reports & Export',
      path: '/admin/reports',
      icon: FileBarChart2
    },
    {
      label: 'Tendering Alerts',
      path: '/admin/tendering-alerts',
      icon: AlertOctagon,
      alertBadge: tenderingUrgentCount !== null ? `Alert ${tenderingUrgentCount}` : 'Alert 2'
    },
    {
      label: 'Setting Threshold Limits',
      path: '/admin/thresholds',
      icon: Sliders
    },
    {
      label: 'Full View of Record',
      path: '/admin/full-view',
      icon: FileSpreadsheet
    },
    {
      label: 'Procurement Register Entry',
      path: '/admin/procurement',
      icon: ShoppingBag
    },
    {
      label: 'Asset Usage History',
      path: '/admin/asset-usage-history',
      icon: ClipboardList
    },
    {
      label: 'Employee Master',
      path: '/admin/employees',
      icon: Users
    },
    {
      label: 'New Asset Addition',
      path: '/admin/assets/new',
      icon: Package
    },
    {
      label: 'Update / Change in Asset',
      path: '/admin/assets/update',
      icon: Boxes
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Sidebar */}
      <aside
        className={`app-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        aria-label="Admin Navigation"
      >
        {/* Sidebar Header with IOCL Branding */}
        <div className="sidebar-header">
          <IoclBrand
            theme="light"
            size={isCollapsed ? 'sm' : 'md'}
            subtitle={isCollapsed ? '' : 'Consumables & Procurement'}
          />
          {/* Close button for mobile screen drawer */}
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close Sidebar"
            style={{
              display: isOpen ? 'inline-flex' : 'none',
              background: 'transparent',
              border: 'none',
              color: '#B71C1C',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Item List */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          {!isCollapsed && <div className="nav-section-title">MAIN MENU</div>}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isImplemented =
              item.path === '/admin/dashboard' ||
              item.path === '/admin/reports' ||
              item.path === '/admin/tendering-alerts' ||
              item.path === '/admin/procurement' ||
              item.path === '/admin/full-view' ||
              item.path === '/admin/thresholds' ||
              item.path === '/admin/asset-usage-history' ||
              item.path === '/admin/employees' ||
              item.path === '/admin/assets/new' ||
              item.path === '/admin/assets/update';
            const isActive = isImplemented && (
              location.pathname === item.path ||
              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
            );

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
                title={item.label}
                aria-label={item.label}
              >
                <span className="nav-item-icon">
                  <Icon size={18} />
                </span>
                {!isCollapsed && <span className="nav-item-text">{item.label}</span>}
                {item.alertBadge && (
                  <span className="nav-alert-badge" title={item.alertBadge}>
                    {isCollapsed ? '' : item.alertBadge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="sidebar-footer">
            <span>IOCL Internal Portal</span>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
