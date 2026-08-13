import React from 'react';

export const ProcurementStatusBadge = ({ status }) => {
  const normStatus = (status || 'ACTIVE').toUpperCase().replace(/ /g, '_');

  let badgeClass = 'badge-status-active';
  let label = 'Active';

  switch (normStatus) {
    case 'ACTIVE':
      badgeClass = 'badge-status-active';
      label = 'Active';
      break;
    case 'PARTIALLY_USED':
    case 'PARTIAL':
      badgeClass = 'badge-status-partial';
      label = 'Partially Used';
      break;
    case 'COMPLETED':
      badgeClass = 'badge-status-completed';
      label = 'Completed';
      break;
    case 'LOW_AVAILABILITY':
    case 'LOW':
      badgeClass = 'badge-status-low';
      label = 'Low Availability';
      break;
    default:
      badgeClass = 'badge-status-active';
      label = status;
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <span className="status-badge-dot" />
      {label}
    </span>
  );
};
