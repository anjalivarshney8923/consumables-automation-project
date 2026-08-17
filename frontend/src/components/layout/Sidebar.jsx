import React from 'react';
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

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Tendering Alerts (Alert 2)',
      path: '/admin/tendering-alerts',
      icon: AlertOctagon,
      alertBadge: 'Alert 2'
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
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <IoclBrand theme="light" />
          {/* Close button for mobile screen drawer */}
          <button
            type="button"
            className="header-toggle-btn"
            onClick={onClose}
            aria-label="Close Sidebar"
            style={{
              display: isOpen ? 'inline-flex' : 'none',
              background: 'transparent',
              color: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.2)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Item List */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-section-title">Main Menu</div>

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

            if (isImplemented) {
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-item-icon">
                    <Icon size={18} />
                  </span>
                  <span className="nav-item-text">{item.label}</span>
                  {item.alertBadge && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.625rem',
                        fontWeight: '800',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '4px',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {item.alertBadge}
                    </span>
                  )}
                </NavLink>
              );
            }

            // Future Module Placeholders
            return (
              <div
                key={item.label}
                className="nav-item nav-item-disabled"
                title={`${item.label} (Module In Development)`}
              >
                <span className="nav-item-icon">
                  <Icon size={18} />
                </span>
                <span className="nav-item-text">{item.label}</span>
                {item.badge && <span className="nav-item-badge">{item.badge}</span>}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <span>IOCL Internal Portal</span>
          <span style={{ color: 'var(--iocl-saffron)', fontWeight: '600' }}>v1.0.0</span>
        </div>
      </aside>
    </>
  );
};
