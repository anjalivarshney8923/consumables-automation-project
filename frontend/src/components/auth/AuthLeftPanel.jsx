import React from 'react';

/**
 * Enterprise IOCL Left Branding Panel
 * Matches reference design with IndianOil Red, subtle dot pattern,
 * centered white rounded logo card, corporate text, and ministry footer.
 */
export const AuthLeftPanel = ({ systemDescription }) => {
  return (
    <div
      style={{
        flex: '1',
        width: '50%',
        minHeight: '100vh',
        backgroundColor: '#C4001A',
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4rem 2.5rem 2.5rem',
        textAlign: 'center',
        color: '#FFFFFF',
        position: 'relative',
        boxSizing: 'border-box'
      }}
      className="auth-left-panel"
    >
      {/* Top spacer for balanced vertical centering */}
      <div style={{ height: '10px' }} />

      {/* Centered Brand Content Block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '440px',
          margin: 'auto 0'
        }}
      >
        {/* White Rounded Square Logo Container */}
        <div
          style={{
            width: '136px',
            height: '136px',
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            padding: '12px'
          }}
        >
          {/* Authentic IndianOil Corporate Emblem SVG */}
          <svg viewBox="0 0 120 120" width="76" height="76" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Saffron / Orange Circle */}
            <circle cx="60" cy="54" r="38" fill="#F58220" />
            
            {/* Center Deep Navy Horizontal Bar */}
            <rect x="22" y="44" width="76" height="20" rx="3" fill="#002D62" />
            
            {/* IndianOil Emblem Text Inside Navy Bar */}
            <text
              x="60"
              y="54"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              fontWeight="800"
              fontSize="8.5"
              letterSpacing="0.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#FFFFFF"
            >
              इंडियनऑयल
            </text>
            <text
              x="60"
              y="60.5"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              fontWeight="700"
              fontSize="6.5"
              letterSpacing="0.3"
              textAnchor="middle"
              fill="#FFFFFF"
            >
              IndianOil
            </text>

            {/* IndianOil Wordmark at Bottom */}
            <text
              x="60"
              y="108"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              fontWeight="800"
              fontSize="12"
              letterSpacing="0.2"
              textAnchor="middle"
              fill="#002D62"
            >
              IndianOil
            </text>
          </svg>
        </div>

        {/* Corporate Title */}
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            lineHeight: '1.25',
            margin: '0 0 0.35rem',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          }}
        >
          Indian Oil<br />Corporation Ltd.
        </h1>

        {/* Brand Subtitle */}
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: '700',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.92)',
            marginBottom: '1.5rem',
            display: 'block'
          }}
        >
          INDIANOIL
        </span>

        {/* Subtle Horizontal Divider */}
        <div
          style={{
            width: '56px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
            borderRadius: '1px',
            margin: '0 auto 1.5rem'
          }}
        />

        {/* System Description */}
        <p
          style={{
            fontSize: '0.875rem',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.88)',
            margin: 0,
            maxWidth: '380px',
            fontWeight: '400'
          }}
        >
          {systemDescription}
        </p>
      </div>

      {/* Ministry / Government Footer */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.72)',
          fontWeight: '500',
          letterSpacing: '0.02em',
          marginTop: '2rem'
        }}
      >
        Ministry of Petroleum & Natural Gas · Govt. of India
      </div>
    </div>
  );
};
