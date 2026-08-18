import React from 'react';

/**
 * Professional IOCL Corporate Branding Component
 *
 * @param {object} props
 * @param {'dark' | 'light'} [props.theme='dark'] - Color theme for background contrast ('light' for dark navy sidebar)
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Sizing option
 * @param {string} [props.subtitle='Consumables & Procurement'] - Optional custom subtitle
 */
export const IoclBrand = ({ theme = 'dark', size = 'md', subtitle = 'Consumables & Procurement' }) => {
  const isLight = theme === 'light';

  return (
    <div className={`brand-identity ${isLight ? 'brand-light' : ''}`}>
      {/* IOCL Corporate SVG Emblem in rounded container */}
      <div className="brand-emblem" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Saffron / Orange Circle */}
          <circle cx="50" cy="50" r="42" fill="#F58220" />
          {/* Center Deep Navy Horizontal Bar */}
          <rect x="8" y="38" width="84" height="24" rx="4" fill="#002D62" />
          {/* Center Emblem Text */}
          <text
            x="50"
            y="49.5"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="800"
            fontSize="9"
            letterSpacing="0.4"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
          >
            इंडियनऑयल
          </text>
          <text
            x="50"
            y="55.5"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="700"
            fontSize="7"
            letterSpacing="0.2"
            textAnchor="middle"
            fill="#FFFFFF"
          >
            IndianOil
          </text>
        </svg>
      </div>

      {/* Brand Text Block */}
      <div className="brand-text-block">
        <span className="brand-company-name">INDIAN OIL</span>
        <span className="brand-sub-title">{subtitle}</span>
      </div>
    </div>
  );
};

