import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IoclBrand } from '../components/branding/IoclBrand';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email or Admin ID is required.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordNotice(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors({ form: result.message || 'Authentication failed. Please check your credentials.' });
      }
    } catch (err) {
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Top Corporate Bar */}
      <header className="login-top-bar">
        <IoclBrand theme="dark" />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
          Internal Enterprise Portal
        </div>
      </header>

      {/* Centered Login Card Area */}
      <main className="login-content-area">
        <div className="login-card">
          {/* Card Header Branding */}
          <div className="login-header-group">
            <span className="login-badge">Administrative Access</span>
            <h1 className="login-title">ADMINISTRATOR LOGIN</h1>
            <p className="login-subtitle">
              Consumables & Procurement Management System
            </p>
          </div>

          {/* Form Level Error Alert */}
          {errors.form && (
            <div className="alert-banner alert-banner-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Forgot Password Helper Banner */}
          {forgotPasswordNotice && (
            <div className="alert-banner alert-banner-info" style={{ marginBottom: '1.25rem' }}>
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                To reset administrative credentials, please contact the IOCL Internal IT Systems Desk or system administrator.
              </span>
            </div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email / Admin ID Field */}
            <div className="form-group">
              <label htmlFor="admin-email" className="form-label">
                Email / Admin ID
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  autoComplete="username"
                  required
                />
              </div>
              {errors.email && (
                <span className="field-error-text" role="alert">
                  <AlertCircle size={13} /> {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="admin-password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Lock size={18} />
                </span>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field input-field-password ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error-text" role="alert">
                  <AlertCircle size={13} /> {errors.password}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" aria-hidden="true" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Options */}
          <div className="login-card-footer">
            <button
              type="button"
              className="btn-link"
              onClick={() => setForgotPasswordNotice((prev) => !prev)}
            >
              Forgot Password?
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Secure Session
            </span>
          </div>

          {/* Enterprise Notice */}
          <div className="login-security-notice">
            Authorized administrative personnel only. Unauthorized access attempts are logged and reported in accordance with corporate IT policies.
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="login-page-footer">
        &copy; {new Date().getFullYear()} Indian Oil Corporation Limited. Consumables & Procurement Management System.
      </footer>
    </div>
  );
};
