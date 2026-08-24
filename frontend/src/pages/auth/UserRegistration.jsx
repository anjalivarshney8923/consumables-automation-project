import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  AtSign,
  Mail,
  BadgeCheck,
  Building2,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { registerUser } from '../../services/authService';
import { IndianOilLogo } from '../../components/branding/IndianOilLogo';

const DEPARTMENT_OPTIONS = [
  'Operations',
  'Maintenance',
  'IT',
  'Administration',
  'Procurement',
  'Finance',
  'Stores',
  'Engineering',
  'Other'
];

const LOCATION_OPTIONS = [
  'Head Office',
  'Regional Office',
  'Refinery',
  'Terminal',
  'Depot',
  'Other'
];

const INITIAL_FORM_STATE = {
  fullName: '',
  username: '',
  email: '',
  employeeId: '',
  department: '',
  location: '',
  password: '',
  confirmPassword: '',
  termsAgreed: false
};

export const UserRegistration = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState(null);

  const navigate = useNavigate();

  // Password rules validation
  const passwordCriteria = {
    minLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  // Calculate live password strength: 0 to 3
  const getPasswordStrength = () => {
    if (!formData.password) return { score: 0, label: 'None', color: '#CBD5E1' };
    const passedCount = Object.values(passwordCriteria).filter(Boolean).length;
    if (passedCount <= 2) {
      return { score: 1, label: 'Weak', color: '#EF4444' };
    } else if (passedCount <= 4) {
      return { score: 2, label: 'Medium', color: '#F59E0B' };
    } else {
      return { score: 3, label: 'Strong', color: '#10B981' };
    }
  };

  const passwordStrength = getPasswordStrength();

  // Single field validator
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value || !value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
        return '';
      case 'username':
        if (!value || !value.trim()) return 'Username is required.';
        if (value.trim().length < 4 || value.trim().length > 30) {
          return 'Username must be between 4 and 30 characters.';
        }
        if (!/^[a-zA-Z0-9._-]+$/.test(value.trim())) {
          return 'Username can contain only letters, numbers, dot, underscore, and hyphen.';
        }
        return '';
      case 'email':
        if (!value || !value.trim()) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address.';
        }
        return '';
      case 'employeeId':
        if (!value || !value.trim()) return 'Employee / User ID is required.';
        return '';
      case 'department':
        if (!value) return 'Please select a department.';
        return '';
      case 'location':
        if (!value) return 'Please select a location.';
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter.';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number.';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character.';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== formData.password) return 'Passwords do not match.';
        return '';
      case 'termsAgreed':
        if (!value) return 'Please accept the declaration to continue.';
        return '';
      default:
        return '';
    }
  };

  // Full form validator
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) {
        newErrors[key] = errorMsg;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: fieldValue };
      // Real-time confirm password check if already typed
      if (name === 'password' && touched.confirmPassword) {
        setErrors((prevErr) => ({
          ...prevErr,
          confirmPassword: updated.confirmPassword !== fieldValue ? 'Passwords do not match.' : ''
        }));
      }
      return updated;
    });

    if (serverError) {
      setServerError(null);
    }

    if (touched[name]) {
      const fieldError = validateField(name, fieldValue);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, fieldValue);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Real API Call to Spring Boot Backend (POST /api/auth/user/register)
      const result = await registerUser(formData);

      if (result.success && result.data) {
        // Successful PostgreSQL Registration
        setRegisteredUserData(result.data);
        setIsSubmittedSuccess(true);
        // Clear passwords from memory for security
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Handle Server Error or Validation Failure
        if (result.validationErrors) {
          setErrors((prev) => ({ ...prev, ...result.validationErrors }));
        }
        setServerError(result.message || 'Registration failed. Please check the entered details.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setServerError('Unable to connect to the server. Please ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setTouched({});
    setServerError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSubmittedSuccess(false);
    setRegisteredUserData(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F1F5F9',
        backgroundImage: 'radial-gradient(#E2E8F0 1.2px, transparent 1.2px)',
        backgroundSize: '20px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2.5rem 1rem',
        boxSizing: 'border-box',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      {/* Centered Registration Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Accent Gradient Bar matching IOCL Navy & Saffron */}
        <div
          style={{
            height: '5px',
            width: '100%',
            background: 'linear-gradient(90deg, #002D62 0%, #F58220 50%, #C4001A 100%)'
          }}
        />

        <div style={{ padding: '2.5rem 2rem' }}>
          {/* Header Brand Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {/* IOCL Corporate Emblem */}
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                border: '1px solid #E2E8F0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                padding: '6px',
                boxSizing: 'border-box'
              }}
            >
              <IndianOilLogo size={48} alt="Indian Oil Corporation Limited" />
            </div>

            <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: '800', color: '#002D62', marginBottom: '0.25rem' }}>
              Indian Oil Corporation Limited
            </div>
            <h1
              style={{
                fontSize: '1.625rem',
                fontWeight: '800',
                color: '#0F172A',
                margin: '0 0 0.375rem',
                letterSpacing: '-0.02em'
              }}
            >
              Create User Account
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              Register to access the Consumables & Procurement Management System
            </p>
          </div>

          {/* Server Error Alert Banner */}
          {serverError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#B91C1C'
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {serverError}
              </div>
            </div>
          )}

          {/* Success State: Real PostgreSQL Database Record Confirmation */}
          {isSubmittedSuccess && registeredUserData ? (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                animation: 'fadeIn 0.3s ease-in-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <div
                  style={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    borderRadius: '50%',
                    padding: '6px',
                    display: 'flex',
                    flexShrink: 0
                  }}
                >
                  <CheckCircle2 size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.375rem', fontSize: '1.0625rem', fontWeight: '800', color: '#166534' }}>
                    Registration Successful!
                  </h3>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: '#15803D', lineHeight: 1.5 }}>
                    Your user account has been securely created and saved. You may now log in to the User Portal.
                  </p>

                  {/* Summary preview of real registered user */}
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DCFCE7',
                      borderRadius: '8px',
                      padding: '1rem',
                      fontSize: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.625rem 1rem',
                      color: '#334155'
                    }}
                  >
                    <div><strong>User ID:</strong> #{registeredUserData.id}</div>
                    <div><strong>Full Name:</strong> {registeredUserData.fullName}</div>
                    <div><strong>Username:</strong> {registeredUserData.username}</div>
                    <div><strong>Email:</strong> {registeredUserData.email}</div>
                    <div><strong>Employee ID:</strong> {registeredUserData.employeeId}</div>
                    <div><strong>Department:</strong> {registeredUserData.department || '—'}</div>
                    <div><strong>Location:</strong> {registeredUserData.location || '—'}</div>
                    <div><strong>Role:</strong> <span style={{ color: '#166534', fontWeight: '700' }}>{registeredUserData.role}</span></div>
                    <div><strong>Status:</strong> <span style={{ color: '#166534', fontWeight: '700' }}>{registeredUserData.status}</span></div>
                  </div>

                  <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link
                      to="/user/login"
                      style={{
                        padding: '0.5rem 1.25rem',
                        backgroundColor: '#C4001A',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: '700',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        boxShadow: '0 2px 8px rgba(196,0,26,0.2)'
                      }}
                    >
                      <span>Proceed to User Login</span>
                      <ArrowRight size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={handleReset}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      Register Another User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} noValidate>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem 1.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                {/* 1. Full Name */}
                <div className="form-group">
                  <label
                    htmlFor="fullName"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#1E293B',
                      marginBottom: '0.375rem'
                    }}
                  >
                    Full Name <span style={{ color: '#C4001A' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem 0.625rem 2.375rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        border: errors.fullName && touched.fullName ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                        outline: 'none',
                        backgroundColor: isSubmitting ? '#F8FAFC' : '#FFFFFF',
                        boxSizing: 'border-box',
                        color: '#0F172A',
                        transition: 'border-color 0.15s ease'
                      }}
                    />
                    <User
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                  {errors.fullName && touched.fullName && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* 2. Username */}
                <div className="form-group">
                  <label
                    htmlFor="username"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#1E293B',
                      marginBottom: '0.375rem'
                    }}
                  >
                    Username <span style={{ color: '#C4001A' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Create a username (e.g. anjali.varshney)"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem 0.625rem 2.375rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        border: errors.username && touched.username ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                        outline: 'none',
                        backgroundColor: isSubmitting ? '#F8FAFC' : '#FFFFFF',
                        boxSizing: 'border-box',
                        color: '#0F172A',
                        transition: 'border-color 0.15s ease'
                      }}
                    />
                    <AtSign
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                  {errors.username && touched.username ? (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} /> {errors.username}
                    </p>
                  ) : (
                    <span style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                      4-30 characters; letters, numbers, dot, underscore, hyphen.
                    </span>
                  )}
                </div>

                {/* 3. Email Address */}
                <div className="form-group">
                  <label
                    htmlFor="email"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#1E293B',
                      marginBottom: '0.375rem'
                    }}
                  >
                    Email Address <span style={{ color: '#C4001A' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem 0.625rem 2.375rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        border: errors.email && touched.email ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                        outline: 'none',
                        backgroundColor: isSubmitting ? '#F8FAFC' : '#FFFFFF',
                        boxSizing: 'border-box',
                        color: '#0F172A',
                        transition: 'border-color 0.15s ease'
                      }}
                    />
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* 4. Employee / User ID */}
                <div className="form-group">
                  <label
                    htmlFor="employeeId"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#1E293B',
                      marginBottom: '0.375rem'
                    }}
                  >
                    Employee / User ID <span style={{ color: '#C4001A' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      placeholder="Enter employee/user ID (e.g. IOCL10025)"
                      value={formData.employeeId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem 0.625rem 2.375rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        border: errors.employeeId && touched.employeeId ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                        outline: 'none',
                        backgroundColor: isSubmitting ? '#F8FAFC' : '#FFFFFF',
                        boxSizing: 'border-box',
                        color: '#0F172A',
                        transition: 'border-color 0.15s ease'
                      }}
                    />
                    <BadgeCheck
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                  {errors.employeeId && touched.employeeId && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} /> {errors.employeeId}
                    </p>
                  )}
                </div>

                {/* 5. Department */}
                <div className="form-group">
                  <label
                    htmlFor="department"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#1E293B',
                      marginBottom: '0.375rem'
                    }}
                  >
                    Department <span style={{ color: '#C4001A' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem 0.625rem 2.375rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        border: errors.department && touched.department ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                        outline: 'none',
                        backgroundColor: isSubmitting ? '#F8FAFC' : '#FFFFFF',
                        boxSizing: 'border-box',
                        color: formData.department ? '#0F172A' : '#94A3B8',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      <option value="" disabled>Select Department</option>
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <option key={dept} value={dept} style={{ color: '#0F172A' }}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <Building2
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                  {errors.department && touched.department && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} /> {errors.department}
                    </p>
                  )}
                </div>

                {/* 6. Location / Office */}
                <div className="form-group">
                  <label
                    htmlFor="location"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#1E293B',
                      marginBottom: '0.375rem'
                    }}
                  >
                    Location / Office <span style={{ color: '#C4001A' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem 0.625rem 2.375rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        border: errors.location && touched.location ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                        outline: 'none',
                        backgroundColor: isSubmitting ? '#F8FAFC' : '#FFFFFF',
                        boxSizing: 'border-box',
                        color: formData.location ? '#0F172A' : '#94A3B8',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      <option value="" disabled>Select Location</option>
                      {LOCATION_OPTIONS.map((loc) => (
                        <option key={loc} value={loc} style={{ color: '#0F172A' }}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    <MapPin
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                  {errors.location && touched.location && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} /> {errors.location}
                    </p>
                  )}
                </div>

                {/* 7. Password */}
                <div className="form-group">
                  <label
                    htmlFor="password"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#1E293B',
                      marginBottom: '0.375rem'
                    }}
                  >
                    Password <span style={{ color: '#C4001A' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '0.625rem 2.375rem 0.625rem 2.375rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        border: errors.password && touched.password ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                        outline: 'none',
                        backgroundColor: isSubmitting ? '#F8FAFC' : '#FFFFFF',
                        boxSizing: 'border-box',
                        color: '#0F172A',
                        transition: 'border-color 0.15s ease'
                      }}
                    />
                    <Lock
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        pointerEvents: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: '#94A3B8',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Live Password Strength Indicator */}
                  {formData.password && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.6875rem' }}>
                        <span style={{ color: '#64748B' }}>Password Strength:</span>
                        <span style={{ fontWeight: '700', color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                        <div
                          style={{
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor: passwordStrength.score >= 1 ? passwordStrength.color : '#E2E8F0',
                            transition: 'background-color 0.2s ease'
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor: passwordStrength.score >= 2 ? passwordStrength.color : '#E2E8F0',
                            transition: 'background-color 0.2s ease'
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor: passwordStrength.score >= 3 ? passwordStrength.color : '#E2E8F0',
                            transition: 'background-color 0.2s ease'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {errors.password && touched.password && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} /> {errors.password}
                    </p>
                  )}
                </div>

                {/* 8. Confirm Password */}
                <div className="form-group">
                  <label
                    htmlFor="confirmPassword"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#1E293B',
                      marginBottom: '0.375rem'
                    }}
                  >
                    Confirm Password <span style={{ color: '#C4001A' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '0.625rem 2.375rem 0.625rem 2.375rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        border: errors.confirmPassword && touched.confirmPassword ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                        outline: 'none',
                        backgroundColor: isSubmitting ? '#F8FAFC' : '#FFFFFF',
                        boxSizing: 'border-box',
                        color: '#0F172A',
                        transition: 'border-color 0.15s ease'
                      }}
                    />
                    <Lock
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        pointerEvents: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isSubmitting}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: '#94A3B8',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Security Rules Box */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.875rem 1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                  <ShieldCheck size={14} color="#002D62" />
                  <span>Password Requirements:</span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.375rem 0.75rem',
                    fontSize: '0.6875rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordCriteria.minLength ? '#16A34A' : '#64748B' }}>
                    {passwordCriteria.minLength ? <Check size={12} /> : <X size={12} />}
                    <span>Minimum 8 characters</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordCriteria.hasUpper ? '#16A34A' : '#64748B' }}>
                    {passwordCriteria.hasUpper ? <Check size={12} /> : <X size={12} />}
                    <span>At least one uppercase letter (A-Z)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordCriteria.hasLower ? '#16A34A' : '#64748B' }}>
                    {passwordCriteria.hasLower ? <Check size={12} /> : <X size={12} />}
                    <span>At least one lowercase letter (a-z)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordCriteria.hasNumber ? '#16A34A' : '#64748B' }}>
                    {passwordCriteria.hasNumber ? <Check size={12} /> : <X size={12} />}
                    <span>At least one number (0-9)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: passwordCriteria.hasSpecial ? '#16A34A' : '#64748B' }}>
                    {passwordCriteria.hasSpecial ? <Check size={12} /> : <X size={12} />}
                    <span>At least one special character</span>
                  </div>
                </div>
              </div>

              {/* Terms / Declaration Checkbox */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '0.8125rem',
                    color: '#334155',
                    lineHeight: 1.45
                  }}
                >
                  <input
                    type="checkbox"
                    name="termsAgreed"
                    checked={formData.termsAgreed}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    style={{
                      marginTop: '2px',
                      width: '16px',
                      height: '16px',
                      accentColor: '#C4001A',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  />
                  <span>
                    I confirm that the information provided above is correct and I agree to use this system only for authorized organizational purposes. <span style={{ color: '#C4001A' }}>*</span>
                  </span>
                </label>
                {errors.termsAgreed && touched.termsAgreed && (
                  <p style={{ margin: '0.375rem 0 0 1.625rem', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {errors.termsAgreed}
                  </p>
                )}
              </div>

              {/* Action Buttons: Register & Reset */}
              <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    minWidth: '200px',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isSubmitting ? '#94A3B8' : '#C4001A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(196, 0, 26, 0.25)',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = '#A30016';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = '#C4001A';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>CREATE ACCOUNT</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    minWidth: '110px',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#94A3B8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }
                  }}
                >
                  <RotateCcw size={15} />
                  <span>RESET</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer: Link to Login */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #E2E8F0',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#64748B'
            }}
          >
            <span>Already have an account? </span>
            <Link
              to="/user/login"
              style={{
                color: '#C4001A',
                fontWeight: '700',
                textDecoration: 'none',
                marginLeft: '0.25rem'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Enterprise Footer Note */}
      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#64748B'
        }}
      >
        <span>© {new Date().getFullYear()} Indian Oil Corporation Limited. All rights reserved.</span>
      </div>
    </div>
  );
};
