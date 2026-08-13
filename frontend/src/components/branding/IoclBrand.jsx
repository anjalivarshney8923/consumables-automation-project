import React from 'react';

/**
 * Professional IOCL Corporate Branding Component
 *
 * @param {object} props
 * @param {'dark' | 'light'} [props.theme='dark'] - Color theme for background contrast
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Sizing option
 */
export const IoclBrand = ({ theme = 'dark', size = 'md' }) => {
  const isLight = theme === 'light';

  return (
    <div className={`brand-identity ${isLight ? 'brand-light' : ''}`}>
      {/* IOCL Corporate SVG Emblem */}
      <div className="brand-emblem" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer circle */}
          <circle cx="50" cy="50" r="44" stroke="#F58220" strokeWidth="6" />
          {/* Inner circle */}
          <circle cx="50" cy="50" r="32" fill="#F58220" />
          {/* White core */}
          <circle cx="50" cy="50" r="18" fill="#FFFFFF" />
          {/* Center text */}
          <text
            x="50"
            y="56"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize="14"
            textAnchor="middle"
            fill="#0B2545"
          >
            IOCL
          </text>
        </svg>
      </div>

      {/* Brand Text Block */}
      <div className="brand-text-block">
        <span className="brand-company-name">INDIAN OIL</span>
        <span className="brand-sub-title">Consumables & Procurement</span>
      </div>
    </div>
  );
};
