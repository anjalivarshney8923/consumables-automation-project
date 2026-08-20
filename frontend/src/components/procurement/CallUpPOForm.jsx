import React, { useState, useEffect } from 'react';
import { Calendar, Building2, Package, Hash, FileCheck, CheckCircle2, AlertCircle, RefreshCw, FileText, Info, Loader2 } from 'lucide-react';
import { getRateContracts, createCallUpPO } from '../../services/procurementService';

export const CallUpPOForm = ({ onEntryAdded }) => {
  const [rateContracts, setRateContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [contractFetchError, setContractFetchError] = useState(null);

  const [formData, setFormData] = useState({
    poNumber: '',
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    cartridgePartNumber: '',
    rateContractId: '',
    quantity: '',
    remarks: ''
  });

  const [selectedContract, setSelectedContract] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load real Rate Contracts from PostgreSQL backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchContracts = async () => {
      setLoadingContracts(true);
      setContractFetchError(null);
      const res = await getRateContracts();
      if (isMounted) {
        if (res.success && res.data) {
          setRateContracts(res.data);
        } else {
          setContractFetchError(res.message || 'Failed to load master Rate Contracts from database.');
        }
        setLoadingContracts(false);
      }
    };

    fetchContracts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleContractChange = (e) => {
    const rcId = e.target.value;
    const foundRC = rateContracts.find((item) => String(item.id) === String(rcId));

    if (foundRC) {
      setSelectedContract(foundRC);
      setFormData((prev) => ({
        ...prev,
        rateContractId: rcId,
        supplierName: foundRC.supplierName || '',
        cartridgePartNumber: foundRC.cartridge?.partNumber || foundRC.cartridge?.cartridgeName || ''
      }));
    } else {
      setSelectedContract(null);
      setFormData((prev) => ({
        ...prev,
        rateContractId: '',
        supplierName: '',
        cartridgePartNumber: ''
      }));
    }

    if (errors.rateContractId) {
      setErrors((prev) => ({ ...prev, rateContractId: null }));
    }
    if (serverError) setServerError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const validate = () => {
    const newErrors = {};

    // 1. PO Number
    if (!formData.poNumber.trim()) {
      newErrors.poNumber = 'Call-Up PO / WO Number is required.';
    }

    // 2. Date
    if (!formData.date) {
      newErrors.date = 'Date is required.';
    }

    // 3. Rate Contract Reference Selection
    if (!formData.rateContractId) {
      newErrors.rateContractId = 'Please select a Rate Contract from database.';
    }

    // 4. Supplier Name
    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier Name is required.';
    }

    // 5. Quantity
    if (!formData.quantity && formData.quantity !== 0) {
      newErrors.quantity = 'Quantity is required.';
    } else {
      const qtyNum = Number(formData.quantity);
      if (isNaN(qtyNum)) {
        newErrors.quantity = 'Quantity must be a valid number.';
      } else if (qtyNum <= 0) {
        newErrors.quantity = 'Quantity must be a positive number greater than 0.';
      } else if (selectedContract && qtyNum > selectedContract.netAvailableQuantity) {
        newErrors.quantity = `Quantity (${qtyNum}) exceeds current net available quantity (${selectedContract.netAvailableQuantity}).`;
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
      poNumber: formData.poNumber.trim(),
      poDate: formData.date,
      supplierName: formData.supplierName.trim(),
      rateContractId: Number(formData.rateContractId),
      quantity: Number(formData.quantity),
      remarks: formData.remarks.trim()
    };

    const res = await createCallUpPO(payload);

    setIsSubmitting(false);

    if (res.success && res.data) {
      const created = res.data;
      setSuccessMessage({
        title: 'Call-Up PO Created & Quantities Updated',
        details: `Work Order ${created.poNumber} saved. Rate Contract remaining: ${created.remainingAvailableQuantity} units. Store inventory increased by ${created.quantity} units.`
      });

      // Clear form inputs
      setFormData({
        poNumber: '',
        date: new Date().toISOString().split('T')[0],
        supplierName: '',
        cartridgePartNumber: '',
        rateContractId: '',
        quantity: '',
        remarks: ''
      });
      setSelectedContract(null);

      // Refresh master Rate Contracts list from PostgreSQL
      getRateContracts().then((rcRes) => {
        if (rcRes.success && rcRes.data) {
          setRateContracts(rcRes.data);
        }
      });

      // Notify parent to refresh real register table from PostgreSQL
      if (onEntryAdded) {
        onEntryAdded(created);
      }
    } else {
      setServerError(res.message || 'Failed to submit Call-Up PO to backend server.');
    }
  };

  const handleReset = () => {
    setFormData({
      poNumber: '',
      date: new Date().toISOString().split('T')[0],
      supplierName: '',
      cartridgePartNumber: '',
      rateContractId: '',
      quantity: '',
      remarks: ''
    });
    setSelectedContract(null);
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="procurement-form-card">
      <div className="form-card-header">
        <div>
          <h2 className="form-card-title">Call-Up PO Entry</h2>
          <p className="form-card-subtitle">
            Record a work-order call-up executed against an active master Rate Contract.
          </p>
        </div>
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

      {contractFetchError && (
        <div className="alert-banner alert-banner-danger mb-4" role="alert">
          <AlertCircle size={20} className="alert-icon" />
          <div className="alert-content">
            <strong className="alert-title">Rate Contract Master Error</strong>
            <p className="alert-desc">{contractFetchError}</p>
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
          {/* Field 1: Rate Contract Selection from Database */}
          <div className="form-group full-width-field">
            <label className="form-label required" htmlFor="po-rcref">
              Select Rate Contract Reference
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <FileText size={16} />
              </span>
              <select
                id="po-rcref"
                name="rateContractId"
                disabled={isSubmitting || loadingContracts}
                className={`input-field ${errors.rateContractId ? 'input-error' : ''}`}
                value={formData.rateContractId}
                onChange={handleContractChange}
              >
                <option value="">
                  {loadingContracts ? 'Loading Rate Contracts from database...' : '-- Select Active Rate Contract --'}
                </option>
                {rateContracts.map((rc) => (
                  <option key={rc.id} value={rc.id}>
                    RC #{rc.id} | Supplier: {rc.supplierName} | Item: {rc.cartridge?.cartridgeName} ({rc.cartridge?.partNumber}) | Net Available Qty: {rc.netAvailableQuantity}
                  </option>
                ))}
              </select>
            </div>
            {errors.rateContractId && (
              <span className="field-error-text">
                <AlertCircle size={12} /> {errors.rateContractId}
              </span>
            )}
          </div>

          {/* Selected Contract Available Quota Badge */}
          {selectedContract && (
            <div className="contract-summary-preview full-width-field" style={{ margin: 0 }}>
              <div className="summary-col">
                <span className="summary-label">Total Contract Qty</span>
                <span className="summary-val">{selectedContract.totalContractQuantity}</span>
              </div>
              <div className="summary-col">
                <span className="summary-label">Quantity Issued vide WO</span>
                <span className="summary-val">{selectedContract.quantityTakenThroughWO}</span>
              </div>
              <div className="summary-col highlight">
                <span className="summary-label">Current Net Available</span>
                <span className="summary-val">{selectedContract.netAvailableQuantity}</span>
              </div>
            </div>
          )}

          {/* Field 2: Call-Up PO / WO Number */}
          <div className="form-group">
            <label className="form-label required" htmlFor="po-number">
              Call-Up PO / WO Number
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <FileCheck size={16} />
              </span>
              <input
                id="po-number"
                type="text"
                name="poNumber"
                disabled={isSubmitting}
                placeholder="e.g. WO/2026/0104"
                className={`input-field ${errors.poNumber ? 'input-error' : ''}`}
                value={formData.poNumber}
                onChange={handleChange}
              />
            </div>
            {errors.poNumber && (
              <span className="field-error-text">
                <AlertCircle size={12} /> {errors.poNumber}
              </span>
            )}
          </div>

          {/* Field 3: Date */}
          <div className="form-group">
            <label className="form-label required" htmlFor="po-date">
              PO Date
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Calendar size={16} />
              </span>
              <input
                id="po-date"
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

          {/* Field 4: Supplier Name */}
          <div className="form-group">
            <label className="form-label required" htmlFor="po-supplier">
              Supplier Name
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Building2 size={16} />
              </span>
              <input
                id="po-supplier"
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

          {/* Field 5: Quantity */}
          <div className="form-group">
            <label className="form-label required" htmlFor="po-quantity">
              Order Quantity
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Hash size={16} />
              </span>
              <input
                id="po-quantity"
                type="number"
                name="quantity"
                min="1"
                disabled={isSubmitting}
                placeholder="e.g. 20"
                className={`input-field ${errors.quantity ? 'input-error' : ''}`}
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
            {errors.quantity && (
              <span className="field-error-text">
                <AlertCircle size={12} /> {errors.quantity}
              </span>
            )}
          </div>
        </div>

        {/* Field 6: Remarks */}
        <div className="form-group full-width-field mt-3">
          <label className="form-label" htmlFor="po-remarks">
            Remarks / Order Notes
          </label>
          <div className="input-wrapper">
            <textarea
              id="po-remarks"
              name="remarks"
              rows={3}
              disabled={isSubmitting}
              placeholder="Enter optional call-up details, PO terms, or delivery location..."
              className="textarea-field"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions-row">
          <button type="button" className="btn-secondary" onClick={handleReset} disabled={isSubmitting}>
            <RefreshCw size={16} /> Reset
          </button>
          <button type="submit" className="btn-primary-action" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="spinner" /> Processing Call-Up...
              </>
            ) : (
              'Submit Call-Up PO'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
