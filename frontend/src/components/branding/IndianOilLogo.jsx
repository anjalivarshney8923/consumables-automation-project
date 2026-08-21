import React from 'react';
import indianOilLogo from '../../assets/indian-oil-logo.png';

/**
 * Official Indian Oil Corporate Logo Component
 *
 * @param {object} props
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl' | number} [props.size='md'] - Sizing preset or custom pixel number
 * @param {string} [props.className=''] - Custom CSS class
 * @param {string} [props.alt='Indian Oil Corporation Limited'] - Accessible alt text
 * @param {React.CSSProperties} [props.style={}] - Inline styles
 * @param {boolean} [props.withContainer=false] - Whether to wrap in a white rounded badge container
 */
export const IndianOilLogo = ({
  size = 'md',
  className = '',
  alt = 'Indian Oil Corporation Limited',
  style = {},
  withContainer = false,
  containerStyle = {}
}) => {
  // Sizing map (height in px)
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 64,
    xl: 96
  };

  const dimension = typeof size === 'number' ? size : (sizeMap[size] || 40);

  const imgElement = (
    <img
      src={indianOilLogo}
      alt={alt}
      width={dimension}
      height={dimension}
      className={`iocl-official-logo ${className}`.trim()}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
        userSelect: 'none',
        ...style
      }}
      loading="eager"
    />
  );

  if (withContainer) {
    return (
      <div
        className="iocl-logo-container"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '4px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          flexShrink: 0,
          ...containerStyle
        }}
      >
        {imgElement}
      </div>
    );
  }

  return imgElement;
};

export default IndianOilLogo;
