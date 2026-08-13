import React from 'react';
import { NavLink } from 'react-router-dom';
import { FilePlus2, ShoppingBag } from 'lucide-react';

export const ProcurementTabs = () => {
  return (
    <div className="procurement-tabs-container">
      <nav className="procurement-tabs" aria-label="Procurement Entry Modes">
        <NavLink
          to="/admin/procurement/new-rate-contract"
          className={({ isActive }) => `procurement-tab ${isActive ? 'active' : ''}`}
        >
          <FilePlus2 size={18} className="tab-icon" />
          <span>New Rate Contract Entry</span>
        </NavLink>

        <NavLink
          to="/admin/procurement/call-up-po"
          className={({ isActive }) => `procurement-tab ${isActive ? 'active' : ''}`}
        >
          <ShoppingBag size={18} className="tab-icon" />
          <span>Call-Up PO Entry</span>
        </NavLink>
      </nav>
    </div>
  );
};
