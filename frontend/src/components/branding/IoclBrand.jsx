import React from 'react';
import { IndianOilLogo } from './IndianOilLogo';

/**
 * Professional IOCL Corporate Branding Component
 *
 * @param {object} props
 * @param {'dark' | 'light'} [props.theme='dark'] - Color theme for background contrast ('light' for dark navy sidebar)
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Sizing option
 * @param {string} [props.subtitle='Consumables & Procurement'] - Optional custom subtitle
 */
export const IoclBrand = ({
  theme = 'dark',
  size = 'md',
  subtitle = 'Consumables & Procurement'
}) => {
  const isLight = theme === 'light';
  const logoDimension = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;

  return (
    <div
      className={`brand-identity ${isLight ? 'brand-light' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none'
      }}
    >
      {/* Official IOCL Logo in crisp white rounded emblem badge */}
      <div
        className="brand-emblem-wrapper"
        style={{
          width: `${logoDimension + 6}px`,
          height: `${logoDimension + 6}px`,
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          flexShrink: 0
        }}
      >
        <IndianOilLogo size={logoDimension} />
      </div>

      {/* Brand Corporate Text Block */}
      <div
        className="brand-text-block"
        style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: '1.2'
        }}
      >
        <span
          className="brand-company-name"
          style={{
            fontSize: size === 'sm' ? '0.8125rem' : '0.9375rem',
            fontWeight: '800',
            letterSpacing: '0.04em',
            color: '#FFFFFF'
          }}
        >
          INDIAN OIL
        </span>
        {subtitle && (
          <span
            className="brand-sub-title"
            style={{
              fontSize: '0.6875rem',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.75)',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default IoclBrand;
