import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AuthLeftPanel } from '../../components/auth/AuthLeftPanel';

export const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Username or Store User ID is required.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Frontend transition to User Dashboard
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/user/dashboard');
    }, 400);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#FFFFFF',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
      className="auth-split-wrapper"
    >
      {/* 1. LEFT BRANDING PANEL (50% Desktop) */}
      <AuthLeftPanel
        systemDescription="Inventory & Asset Management System for consumables usage, execution tracking, and store operations."
      />

      {/* 2. RIGHT LOGIN FORM PANEL (50% Desktop) */}
      <div
        style={{
          flex: '1',
          width: '50%',
          minHeight: '100vh',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2.5rem 2rem',
          boxSizing: 'border-box'
        }}
        className="auth-right-panel"
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header Title & Subtitle */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#1E293B',
                margin: '0 0 0.4rem',
                letterSpacing: '-0.025em'
              }}
            >
              Welcome back
            </h2>
            <p
              style={{
                fontSize: '0.9375rem',
                color: '#94A3B8',
                margin: 0,
                fontWeight: '500'
              }}
            >
              Sign in to your user account
            </p>
          </div>

          {/* Form-Level Error Alert */}
          {errors.form && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#B91C1C',
                fontSize: '0.8125rem'
              }}
              role="alert"
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* USERNAME / USER ID */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="user-username"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#64748B',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}
              >
                USERNAME
              </label>
              <input
                id="user-username"
                name="username"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email || errors.form) {
                    setErrors((prev) => ({ ...prev, email: null, form: null }));
                  }
                }}
                placeholder="store.user"
                autoComplete="username"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.125rem',
                  backgroundColor: '#EDF3F9',
                  border: errors.email ? '1px solid #EF4444' : '1px solid transparent',
                  borderRadius: '12px',
                  fontSize: '0.9375rem',
                  color: '#0F172A',
                  fontWeight: '500',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => (e.target.style.backgroundColor = '#E4EDF6')}
                onBlur={(e) => (e.target.style.backgroundColor = '#EDF3F9')}
              />
              {errors.email && (
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', fontWeight: '500' }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label
                htmlFor="user-password"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#64748B',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}
              >
                PASSWORD
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="user-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password || errors.form) {
                      setErrors((prev) => ({ ...prev, password: null, form: null }));
                    }
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.875rem 3rem 0.875rem 1.125rem',
                    backgroundColor: '#EDF3F9',
                    border: errors.password ? '1px solid #EF4444' : '1px solid transparent',
                    borderRadius: '12px',
                    fontSize: '0.9375rem',
                    color: '#0F172A',
                    fontWeight: '500',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => (e.target.style.backgroundColor = '#E4EDF6')}
                  onBlur={(e) => (e.target.style.backgroundColor = '#EDF3F9')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', fontWeight: '500' }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.9375rem',
                backgroundColor: '#D4001F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                boxShadow: '0 4px 14px rgba(212, 0, 31, 0.3)',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.target.style.backgroundColor = '#BA001A';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.target.style.backgroundColor = '#D4001F';
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Switch to Admin Login Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
              Administrator?{' '}
              <Link
                to="/login"
                style={{
                  color: '#1E40AF',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                Switch to Admin Login
              </Link>
            </span>
          </div>

          {/* Authorised Personnel Footer */}
          <div
            style={{
              marginTop: '3.5rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#94A3B8',
              fontWeight: '500'
            }}
          >
            Authorised personnel only · © 2026 IOCL
          </div>
        </div>
      </div>
    </div>
  );
};
