import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Hash,
  Mail,
  Building,
  Briefcase,
  MapPin,
  Printer,
  ShieldCheck,
  Tag,
  FileText,
  AlertCircle,
  Save,
  CheckCircle2
} from 'lucide-react';

const DEPARTMENT_OPTIONS = [
  'Information Systems',
  'Operations',
  'Maintenance',
  'IT & Communications',
  'Administration',
  'Procurement',
  'Finance & Accounts',
  'Stores & Inventory',
  'Engineering Services',
  'Human Resources',
  'Health Safety & Environment'
];

const LOCATION_OPTIONS = [
  'Head Office',
  'Refinery',
  'Refinery Complex',
  'Admin Block',
  'Regional Office',
  'Terminal',
  'Depot'
];

const PRINTER_TYPE_OPTIONS = [
  'Black & White',
  'Color',
  'Multifunction (MFP)'
];

export const AdminEmployeeFormModal = ({
  isOpen,
  employee = null, // null for Add, employee object for Edit
  onClose,
  onSave,
  isSaving = false
}) => {
  const isEditMode = Boolean(employee && employee.id);

  const [formData, setFormData] = useState({
    employeeNumber: '',
    employeeName: '',
    email: '',
    department: 'Information Systems',
    designation: '',
    gd: '',
    location: 'Refinery',
    cabinNumber: '',
    seatNumber: '',
    printerName: '',
    printerSerialNumber: '',
    printerType: 'Black & White',
    status: 'ACTIVE',
    remarks: ''
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (employee) {
      setFormData({
        employeeNumber: employee.employeeNumber || employee.employeeId || '',
        employeeName: employee.employeeName || employee.fullName || '',
        email: employee.email || '',
        department: employee.department || 'Information Systems',
        designation: employee.designation || '',
        gd: employee.gd || '',
        location: employee.location || 'Refinery',
        cabinNumber: employee.cabinNumber || employee.roomNumber || employee.seatOrCabinNo || '',
        seatNumber: employee.seatNumber || '',
        printerName: employee.printerName || employee.printerModel || '',
        printerSerialNumber: employee.printerSerialNumber || employee.serialNumber || '',
        printerType: employee.printerType || 'Black & White',
        status: employee.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        remarks: employee.remarks || ''
      });
      setErrors({});
    } else {
      setFormData({
        employeeNumber: '',
        employeeName: '',
        email: '',
        department: 'Information Systems',
        designation: '',
        gd: '',
        location: 'Refinery',
        cabinNumber: '',
        seatNumber: '',
        printerName: '',
        printerSerialNumber: '',
        printerType: 'Black & White',
        status: 'ACTIVE',
        remarks: ''
      });
      setErrors({});
    }
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.employeeNumber?.trim()) {
      newErrors.employeeNumber = 'Employee number is required.';
    }

    if (!formData.employeeName?.trim()) {
      newErrors.employeeName = 'Employee name is required.';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required.';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      employeeNumber: formData.employeeNumber.trim(),
      employeeName: formData.employeeName.trim(),
      email: formData.email.trim().toLowerCase(),
      designation: formData.designation.trim(),
      gd: formData.gd.trim(),
      cabinNumber: formData.cabinNumber.trim(),
      seatNumber: formData.seatNumber.trim(),
      printerName: formData.printerName.trim(),
      printerSerialNumber: formData.printerSerialNumber.trim(),
      remarks: formData.remarks.trim()
    };

    onSave(payload);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="modal-content-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', width: '92%' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div
              className="modal-icon-badge"
              style={{
                background: 'rgba(0, 45, 98, 0.1)',
                color: 'var(--iocl-navy, #002D62)'
              }}
            >
              <User size={22} />
            </div>
            <div>
              <h3 className="modal-title">
                {isEditMode ? 'Edit Employee Record' : 'Add New Employee'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {isEditMode
                  ? `Updating details for Employee No: ${formData.employeeNumber || employee.id}`
                  : 'Enter official employee, department, workplace, and printer details'}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div
            className="modal-body"
            style={{ maxHeight: '74vh', overflowY: 'auto', padding: '1.25rem 1.5rem' }}
          >
            {/* SECTION 1: EMPLOYEE INFORMATION */}
            <div className="form-section-card mb-5">
              <div className="form-section-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '6px' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--iocl-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> SECTION 1: EMPLOYEE INFORMATION
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Employee Number */}
                <div className="form-group">
                  <label className="form-label font-semibold">
                    Employee Number <span style={{ color: 'var(--iocl-red, #DC2626)' }}>*</span>
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      name="employeeNumber"
                      className={`form-input ${errors.employeeNumber ? 'input-error' : ''}`}
                      placeholder="e.g. 93917 or IOCL1005"
                      value={formData.employeeNumber}
                      onChange={handleChange}
                      disabled={isEditMode} // Usually unique identifier
                    />
                  </div>
                  {errors.employeeNumber && (
                    <span className="field-error-msg" style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '2px', display: 'block' }}>
                      {errors.employeeNumber}
                    </span>
                  )}
                </div>

                {/* Employee Name */}
                <div className="form-group">
                  <label className="form-label font-semibold">
                    Full Name <span style={{ color: 'var(--iocl-red, #DC2626)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="employeeName"
                    className={`form-input ${errors.employeeName ? 'input-error' : ''}`}
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.employeeName}
                    onChange={handleChange}
                  />
                  {errors.employeeName && (
                    <span className="field-error-msg" style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '2px', display: 'block' }}>
                      {errors.employeeName}
                    </span>
                  )}
                </div>

                {/* Official Email */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label font-semibold">
                    Official Email <span style={{ color: 'var(--iocl-red, #DC2626)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="e.g. rajesh.kumar@iocl.co.in"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <span className="field-error-msg" style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '2px', display: 'block' }}>
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Department */}
                <div className="form-group">
                  <label className="form-label font-semibold">
                    Department <span style={{ color: 'var(--iocl-red, #DC2626)' }}>*</span>
                  </label>
                  <select
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div className="form-group">
                  <label className="form-label font-semibold">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    className="form-input"
                    placeholder="e.g. Senior Engineer, Manager..."
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>

                {/* GD (Grade) */}
                <div className="form-group">
                  <label className="form-label font-semibold">Grade / GD</label>
                  <input
                    type="text"
                    name="gd"
                    className="form-input"
                    placeholder="e.g. Grade E, Grade F..."
                    value={formData.gd}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: WORKPLACE LOCATION */}
            <div className="form-section-card mb-5">
              <div className="form-section-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '6px' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#059669', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} /> SECTION 2: WORKPLACE & CABIN INFORMATION
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Location */}
                <div className="form-group">
                  <label className="form-label font-semibold">Location / Office</label>
                  <select
                    name="location"
                    className="form-select"
                    value={formData.location}
                    onChange={handleChange}
                  >
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room / Cabin Number */}
                <div className="form-group">
                  <label className="form-label font-semibold">Room / Cabin Number</label>
                  <input
                    type="text"
                    name="cabinNumber"
                    className="form-input"
                    placeholder="e.g. 412 or Admin-204"
                    value={formData.cabinNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* Seat Number */}
                <div className="form-group">
                  <label className="form-label font-semibold">Seat Number (Optional)</label>
                  <input
                    type="text"
                    name="seatNumber"
                    className="form-input"
                    placeholder="e.g. Desk 14"
                    value={formData.seatNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: PRINTER INFORMATION */}
            <div className="form-section-card mb-5">
              <div className="form-section-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '6px' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#7C3AED', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={16} /> SECTION 3: ASSIGNED PRINTER INFORMATION
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Printer Model / Name */}
                <div className="form-group">
                  <label className="form-label font-semibold">Printer Model / Name</label>
                  <input
                    type="text"
                    name="printerName"
                    className="form-input"
                    placeholder="e.g. Canon LBP246dw, HP M454dn"
                    value={formData.printerName}
                    onChange={handleChange}
                  />
                </div>

                {/* Printer Serial Number */}
                <div className="form-group">
                  <label className="form-label font-semibold">Printer Serial Number</label>
                  <input
                    type="text"
                    name="printerSerialNumber"
                    className="form-input font-mono"
                    placeholder="e.g. CN-SER-41289"
                    value={formData.printerSerialNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* Printer Type */}
                <div className="form-group">
                  <label className="form-label font-semibold">Printer Type</label>
                  <select
                    name="printerType"
                    className="form-select"
                    value={formData.printerType}
                    onChange={handleChange}
                  >
                    {PRINTER_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: STATUS */}
            <div className="form-section-card mb-5">
              <div className="form-section-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '6px' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--iocl-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> SECTION 4: DIRECTORY STATUS
                </h4>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="status"
                    value="ACTIVE"
                    checked={formData.status === 'ACTIVE'}
                    onChange={handleChange}
                  />
                  <span style={{ color: '#059669' }}>ACTIVE (Eligible for Asset Usage)</span>
                </label>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="status"
                    value="INACTIVE"
                    checked={formData.status === 'INACTIVE'}
                    onChange={handleChange}
                  />
                  <span style={{ color: '#DC2626' }}>INACTIVE (Suspended / Left IOCL)</span>
                </label>
              </div>
            </div>

            {/* SECTION 5: ADDITIONAL REMARKS */}
            <div className="form-section-card mb-2">
              <div className="form-section-header" style={{ marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '6px' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> SECTION 5: ADDITIONAL REMARKS
                </h4>
              </div>

              <div className="form-group">
                <textarea
                  name="remarks"
                  className="form-textarea"
                  rows={2}
                  placeholder="Optional notes or references for this employee record..."
                  value={formData.remarks}
                  onChange={handleChange}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: 'var(--iocl-navy, #002D62)',
                color: '#FFFFFF',
                border: 'none'
              }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving...' : isEditMode ? 'Update Employee' : 'Save Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEmployeeFormModal;
