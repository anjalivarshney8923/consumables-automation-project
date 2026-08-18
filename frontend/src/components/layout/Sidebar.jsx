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
  X
} from 'lucide-react';
import { IoclBrand } from '../branding/IoclBrand';
import { getTenderingAlerts } from '../../services/alertService';

export const Sidebar = ({ isOpen, onClose }) => {
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
            const threshold = Number(item.tenderingThreshold) || 0;
            return item.isUrgent !== undefined ? Boolean(item.isUrgent) : combinedQty < threshold;
          }).length;
          setTenderingUrgentCount(count);
        }
      } catch (err) {
        // Keep previous or default if fetch fails
      }
    };

    fetchTenderingCount();
    const interval = setInterval(fetchTenderingCount, 20000);
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
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header with IOCL Branding */}
        <div className="sidebar-header">
          <IoclBrand theme="light" />
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
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Item List */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-section-title">MAIN MENU</div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isImplemented =
              item.path === '/admin/dashboard' ||
              item.path === '/admin/tendering-alerts' ||
              item.path === '/admin/procurement' ||
              item.path === '/admin/full-view' ||
              item.path === '/admin/thresholds' ||
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
              >
                <span className="nav-item-icon">
                  <Icon size={18} />
                </span>
                <span className="nav-item-text">{item.label}</span>
                {item.alertBadge && (
                  <span className="nav-alert-badge">
                    {item.alertBadge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <span>IOCL Internal Portal</span>
          <span style={{ color: 'var(--iocl-saffron)', fontWeight: '700' }}>v1.0.0</span>
        </div>
      </aside>
    </>
  );
};

