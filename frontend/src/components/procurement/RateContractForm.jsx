import React, { useState, useEffect } from 'react';
import { Calendar, Building2, Package, Hash, IndianRupee, Percent, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { getActiveCartridges } from '../../services/cartridgeService';
import { createRateContract } from '../../services/procurementService';

export const RateContractForm = ({ onEntryAdded }) => {
  const [cartridges, setCartridges] = useState([]);
  const [loadingCartridges, setLoadingCartridges] = useState(true);
  const [cartridgeFetchError, setCartridgeFetchError] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    cartridgeId: '',
    totalQuantity: '',
    ratePerUnit: '',
    taxPercentage: '18'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load real cartridges from PostgreSQL backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCartridges = async () => {
      setLoadingCartridges(true);
      setCartridgeFetchError(null);
      const res = await getActiveCartridges();
      if (isMounted) {
        if (res.success && res.data) {
          setCartridges(res.data);
        } else {
          setCartridgeFetchError(res.message || 'Failed to load cartridge master data.');
        }
        setLoadingCartridges(false);
      }
    };

    fetchCartridges();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) {
      setServerError(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Date
    if (!formData.date) {
      newErrors.date = 'Contract date is required.';
    }

    // 2. Supplier Name
    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier Name is required.';
    }

    // 3. Cartridge Selection
    if (!formData.cartridgeId) {
      newErrors.cartridgeId = 'Please select a Cartridge from master data.';
    }

    // 4. Total Quantity
    if (!formData.totalQuantity && formData.totalQuantity !== 0) {
      newErrors.totalQuantity = 'Total Contract Quantity is required.';
    } else {
      const qtyNum = Number(formData.totalQuantity);
      if (isNaN(qtyNum)) {
        newErrors.totalQuantity = 'Quantity must be a valid number.';
      } else if (qtyNum <= 0) {
        newErrors.totalQuantity = 'Contract Quantity must be greater than 0.';
      }
    }

    // 5. Rate Per Unit
    if (!formData.ratePerUnit && formData.ratePerUnit !== 0) {
      newErrors.ratePerUnit = 'Rate Per Unit is required.';
    } else {
      const rateNum = Number(formData.ratePerUnit);
      if (isNaN(rateNum)) {
        newErrors.ratePerUnit = 'Rate must be a valid number.';
      } else if (rateNum < 0) {
        newErrors.ratePerUnit = 'Rate per unit cannot be negative.';
      }
    }

    // 6. Tax (%)
    if (formData.taxPercentage === '' || formData.taxPercentage === null) {
      newErrors.taxPercentage = 'Tax percentage is required.';
    } else {
      const taxNum = Number(formData.taxPercentage);
      if (isNaN(taxNum)) {
        newErrors.taxPercentage = 'Tax must be a valid number.';
      } else if (taxNum < 0) {
        newErrors.taxPercentage = 'Tax percentage cannot be negative.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      contractDate: formData.date,
      supplierName: formData.supplierName.trim(),
      cartridgeId: Number(formData.cartridgeId),
      ratePerUnit: Number(formData.ratePerUnit),
      taxPercentage: Number(formData.taxPercentage),
      totalContractQuantity: Number(formData.totalQuantity)
    };

    const res = await createRateContract(payload);

    setIsSubmitting(false);

    if (res.success && res.data) {
      const created = res.data;
      setSuccessMessage({
        title: 'Rate Contract Created',
        details: `Contract for "${created.supplierName}" (${created.cartridge?.cartridgeName}) with Qty: ${created.totalContractQuantity} was successfully saved.`
      });

      // Clear form inputs except date and tax
      setFormData((prev) => ({
        ...prev,
        supplierName: '',
        cartridgeId: '',
        totalQuantity: '',
        ratePerUnit: ''
      }));

      // Notify parent to refresh real register table from PostgreSQL
      if (onEntryAdded) {
        onEntryAdded(created);
      }
    } else {
      setServerError(res.message || 'Failed to create rate contract on server.');
    }
  };

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      supplierName: '',
      cartridgeId: '',
      totalQuantity: '',
      ratePerUnit: '',
      taxPercentage: '18'
    });
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);
  };

  // Live calculation preview
  const qtyVal = Number(formData.totalQuantity) || 0;
  const rateVal = Number(formData.ratePerUnit) || 0;
  const taxVal = Number(formData.taxPercentage) || 0;
  const baseAmt = qtyVal * rateVal;
  const taxAmt = baseAmt * (taxVal / 100);
  const totalAmt = baseAmt + taxAmt;

  return (
    <div className="procurement-form-card">
      <div className="form-card-header">
        <div>
          <h2 className="form-card-title">New Rate Contract Entry</h2>
        </div>
        <span className="badge-contract-type">Master Rate Contract</span>
      </div>

      {serverError && (
        <div className="alert-banner alert-banner-danger mb-4" role="alert">
          <AlertCircle size={20} className="alert-icon" />
          <div className="alert-content">
            <strong className="alert-title">Submission Error</strong>
            <p className="alert-desc">{serverError}</p>
          </div>
        </div>
      )}

      {cartridgeFetchError && (
        <div className="alert-banner alert-banner-danger mb-4" role="alert">
          <AlertCircle size={20} className="alert-icon" />
          <div className="alert-content">
            <strong className="alert-title">Cartridge Master Error</strong>
            <p className="alert-desc">{cartridgeFetchError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="alert-banner alert-banner-success mb-4" role="alert">
          <CheckCircle2 size={20} className="alert-icon" />
          <div className="alert-content">
            <strong className="alert-title">{successMessage.title}</strong>
            <p className="alert-desc">{successMessage.details}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="procurement-entry-form">
        <div className="form-two-col-grid">
          {/* Field 1: Date */}
          <div className="form-group">
            <label className="form-label required" htmlFor="rc-date">
              Contract Date
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Calendar size={16} />
              </span>
              <input
                id="rc-date"
                type="date"
                name="date"
                disabled={isSubmitting}
                className={`input-field ${errors.date ? 'input-error' : ''}`}
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            {errors.date && (
              <span className="field-error-text">
                <AlertCircle size={12} /> {errors.date}
              </span>
            )}
          </div>

          {/* Field 2: Supplier Name */}
          <div className="form-group">
            <label className="form-label required" htmlFor="rc-supplier">
              Supplier Name
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Building2 size={16} />
              </span>
              <input
                id="rc-supplier"
                type="text"
                name="supplierName"
                disabled={isSubmitting}
                placeholder="e.g. M/s Canon India Pvt Ltd"
                className={`input-field ${errors.supplierName ? 'input-error' : ''}`}
                value={formData.supplierName}
                onChange={handleChange}
              />
            </div>
            {errors.supplierName && (
              <span className="field-error-text">
                <AlertCircle size={12} /> {errors.supplierName}
              </span>
            )}
          </div>

          {/* Field 3: Cartridge Selection from Database */}
          <div className="form-group">
            <label className="form-label required" htmlFor="rc-cartridge">
              Cartridge Master (Part Number)
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Package size={16} />
              </span>
              <select
                id="rc-cartridge"
                name="cartridgeId"
                disabled={isSubmitting || loadingCartridges}
                className={`input-field ${errors.cartridgeId ? 'input-error' : ''}`}
                value={formData.cartridgeId}
                onChange={handleChange}
              >
                <option value="">
                  {loadingCartridges ? 'Loading cartridges from database...' : '-- Select Cartridge Part Number --'}
                </option>
                {cartridges.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.cartridgeName} ({item.partNumber}) - {item.printerName}
                  </option>
                ))}
              </select>
            </div>
            {errors.cartridgeId && (
              <span className="field-error-text">
                <AlertCircle size={12} /> {errors.cartridgeId}
              </span>
            )}
          </div>

          {/* Field 4: Total Contract Quantity */}
          <div className="form-group">
            <label className="form-label required" htmlFor="rc-quantity">
              Total Contract Quantity
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Hash size={16} />
              </span>
              <input
                id="rc-quantity"
                type="number"
                name="totalQuantity"
                min="1"
                disabled={isSubmitting}
                placeholder="e.g. 100"
                className={`input-field ${errors.totalQuantity ? 'input-error' : ''}`}
                value={formData.totalQuantity}
                onChange={handleChange}
              />
            </div>
            {errors.totalQuantity && (
              <span className="field-error-text">
                <AlertCircle size={12} /> {errors.totalQuantity}
              </span>
            )}
          </div>

          {/* Field 5: Rate Per Unit (₹) */}
          <div className="form-group">
            <label className="form-label required" htmlFor="rc-rate">
              Rate Per Unit (₹)
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <IndianRupee size={16} />
              </span>
              <input
                id="rc-rate"
                type="number"
                name="ratePerUnit"
                step="0.01"
                min="0"
                disabled={isSubmitting}
                placeholder="e.g. 4500.00"
                className={`input-field ${errors.ratePerUnit ? 'input-error' : ''}`}
                value={formData.ratePerUnit}
                onChange={handleChange}
              />
            </div>
            {errors.ratePerUnit && (
              <span className="field-error-text">
                <AlertCircle size={12} /> {errors.ratePerUnit}
              </span>
            )}
          </div>

          {/* Field 6: Tax (%) */}
          <div className="form-group">
            <label className="form-label required" htmlFor="rc-tax">
              Tax (%)
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Percent size={16} />
              </span>
              <input
                id="rc-tax"
                type="number"
                name="taxPercentage"
                step="0.1"
                min="0"
                disabled={isSubmitting}
                placeholder="e.g. 18"
                className={`input-field ${errors.taxPercentage ? 'input-error' : ''}`}
                value={formData.taxPercentage}
                onChange={handleChange}
              />
            </div>
            {errors.taxPercentage && (
              <span className="field-error-text">
                <AlertCircle size={12} /> {errors.taxPercentage}
              </span>
            )}
          </div>
        </div>

        {/* Financial Summary Preview Box */}
        {qtyVal > 0 && rateVal > 0 && (
          <div className="contract-summary-preview">
            <div className="summary-col">
              <span className="summary-label">Base Order Value</span>
              <span className="summary-val">₹ {baseAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Tax Amount ({taxVal}%)</span>
              <span className="summary-val">₹ {taxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-col highlight">
              <span className="summary-label">Total Contract Value</span>
              <span className="summary-val">₹ {totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="form-actions-row">
          <button type="button" className="btn-secondary" onClick={handleReset} disabled={isSubmitting}>
            <RefreshCw size={16} /> Reset
          </button>
          <button type="submit" className="btn-primary-action" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="spinner" /> Saving 
              </>
            ) : (
              'Submit Rate Contract Entry'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
