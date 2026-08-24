import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  Layers,
  Printer,
  TrendingUp,
  PackageCheck,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  Database,
  ShieldCheck,
  Hash,
  Receipt,
  FileCheck,
  PlusCircle,
  Inbox
} from 'lucide-react';
import { getRateContractById } from '../../services/procurementService';

export const RateContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contractDetails, setContractDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const res = await getRateContractById(id);
    if (res.success && res.data) {
      setContractDetails(res.data);
    } else {
      setError(res.message || 'Failed to load rate contract details.');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const callUpPOs = contractDetails?.callUpPOs || [];
  const totalContractQty = contractDetails?.totalContractQuantity || 0;
  const totalWOQty = contractDetails?.totalWOQuantity !== undefined
    ? contractDetails.totalWOQuantity
    : (contractDetails?.quantityTakenThroughWO || 0);
  const qtyExecuted = contractDetails?.quantityAlreadyExecuted || 0;
  const remainingQty = contractDetails?.remainingContractQuantity !== undefined
    ? contractDetails.remainingContractQuantity
    : (contractDetails?.netAvailableQuantity || 0);

  const executionPercentage = totalContractQty > 0
    ? Math.min(100, Math.round((totalWOQty / totalContractQty) * 100))
    : 0;

  return (
    <div className="procurement-page-container">
      {/* 1. Navigation & Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/procurement')}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Back to Procurement Register"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 className="page-title-text" style={{ margin: 0 }}>
                  Rate Contract Details
                </h1>
              </div>
              <p className="page-subtitle-text" style={{ marginTop: '0.25rem' }}>
                Complete Call-Up Purchase Order execution history and rate contract specifications
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={fetchDetails}
            disabled={loading}
            style={{
              padding: '0.4375rem 0.875rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#475569',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/procurement/call-up-po"
            style={{
              padding: '0.4375rem 0.875rem',
              backgroundColor: 'var(--iocl-navy)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#FFFFFF',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              textDecoration: 'none'
            }}
          >
            <PlusCircle size={14} />
            <span>Create Call-Up PO</span>
          </Link>
        </div>
      </header>

      {/* 2. Loading / Error / Content */}
      {loading ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#64748B'
          }}
        >
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--iocl-navy)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            Loading Rate Contract Details...
          </h3>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Fetching rate contract information and Call-Up PO records 
          </p>
        </div>
      ) : error ? (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <AlertCircle size={32} color="#DC2626" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#991B1B', margin: '0 0 0.5rem' }}>
            {error}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#B91C1C', marginBottom: '1.25rem' }}>
            The requested Rate Contract ID could not be retrieved.
          </p>
          <button
            type="button"
            onClick={fetchDetails}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Retry Loading
          </button>
        </div>
      ) : contractDetails ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 3. Contract Master Overview Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Building2 size={20} color="var(--iocl-navy)" />
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
                    {contractDetails.supplierName}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Contract Executed on {contractDetails.contractDate ? new Date(contractDetails.contractDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '6px',
                    border: '1px solid #86EFAC',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                  Rate Contract Active
                </span>
              </div>
            </div>

            {/* Specifications Grid */}
            <div
              style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                backgroundColor: '#FAFAFA'
              }}
            >
              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Cartridge Part Number
                </span>
                <p style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--iocl-navy)', margin: '0.25rem 0 0' }}>
                  {contractDetails.cartridge?.partNumber || '—'}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Cartridge Model Name
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', margin: '0.25rem 0 0' }}>
                  {contractDetails.cartridge?.cartridgeName || '—'}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Target Printer Device
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', margin: '0.25rem 0 0' }}>
                  {contractDetails.cartridge?.printerName || '—'}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Unit Rate (excl. tax)
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A', margin: '0.25rem 0 0' }}>
                  ₹{contractDetails.ratePerUnit ? Number(contractDetails.ratePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Applicable GST / Tax
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A', margin: '0.25rem 0 0' }}>
                  {contractDetails.taxPercentage ? `${contractDetails.taxPercentage}%` : '0%'}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Created At
                </span>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} />
                  <span>{contractDetails.createdAt ? new Date(contractDetails.createdAt).toLocaleString('en-IN') : '—'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 4. Quantity Summary KPI Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}
          >
            {/* Card 1: Total Contract Quantity */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                    Total Contract Qty
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--iocl-navy)', marginTop: '0.25rem' }}>
                    {totalContractQty}
                  </div>
                </div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileText size={18} />
                </div>
              </div>
              <span style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.5rem', display: 'block' }}>
                Master sanctioned contract quota
              </span>
            </div>

            {/* Card 2: Total Call-Up PO Quantity */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                    Total Call-Up PO Qty
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--iocl-saffron)', marginTop: '0.25rem' }}>
                    {totalWOQty}
                  </div>
                </div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#FFF7ED',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingUp size={18} />
                </div>
              </div>
              <span style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.5rem', display: 'block' }}>
                Sum of {callUpPOs.length} Call-Up PO{callUpPOs.length === 1 ? '' : 's'} taken vide WO
              </span>
            </div>

            {/* Card 3: Quantity Already Executed */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                    Qty Already Executed
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#475569', marginTop: '0.25rem' }}>
                    {qtyExecuted}
                  </div>
                </div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PackageCheck size={18} />
                </div>
              </div>
              <span style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.5rem', display: 'block' }}>
                Total units consumed by users through Asset Usage
              </span>
            </div>

            {/* Card 4: Remaining Contract Quantity (Net Available) */}
            <div
              style={{
                borderRadius: '10px',
                border: '1px solid #86EFAC',
                backgroundColor: '#F0FDF4',
                padding: '1.25rem',
                boxShadow: '0 2px 4px rgba(22, 163, 74, 0.06)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>
                    Remaining Available Qty
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#15803D', marginTop: '0.25rem' }}>
                    {remainingQty}
                  </div>
                </div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileCheck size={18} />
                </div>
              </div>
              <span style={{ fontSize: '0.6875rem', color: '#15803D', marginTop: '0.5rem', display: 'block' }}>
                Net available for future Call-Up POs
              </span>
            </div>
          </div>

          {/* 5. Execution Progress Bar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '1.25rem 1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                Contract Allocation Progress
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#475569' }}>
                {totalWOQty} / {totalContractQty} units ({executionPercentage}%)
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '10px',
                backgroundColor: '#E2E8F0',
                borderRadius: '5px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${executionPercentage}%`,
                  height: '100%',
                  backgroundColor: executionPercentage > 90 ? '#DC2626' : 'var(--iocl-saffron)',
                  borderRadius: '5px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* 6. CALL-UP PO HISTORY TABLE */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Receipt size={20} color="var(--iocl-navy)" />
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
                    Call-Up Purchase Order History ({callUpPOs.length})
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    All individual Call-Up work orders dispatched 
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '6px',
                    border: '1px solid #BFDBFE'
                  }}
                >
                  Summed WO Qty: {totalWOQty}
                </span>
              </div>
            </div>

            {callUpPOs.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>#</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>PO / WO NUMBER</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>PO DATE</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>SUPPLIER</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>QUANTITY</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>REMARKS</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>CREATED AT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callUpPOs.map((po, idx) => (
                      <tr
                        key={po.id}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                        }}
                      >
                        <td style={{ padding: '0.875rem 1rem', color: '#64748B', fontWeight: '600' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                          {po.poNumber}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#1E40AF' }}>
                          {po.poDate ? new Date(po.poDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#334155' }}>
                          {po.supplierName || contractDetails.supplierName}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: '800', color: 'var(--iocl-saffron)' }}>
                          {po.quantity}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#475569', fontStyle: po.remarks ? 'normal' : 'italic' }}>
                          {po.remarks || 'No remarks entered'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#64748B', fontSize: '0.75rem' }}>
                          {po.createdAt ? new Date(po.createdAt).toLocaleString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#F8FAFC', borderTop: '2px solid #CBD5E1', fontWeight: '800' }}>
                      <td colSpan={4} style={{ padding: '0.875rem 1rem', color: 'var(--iocl-navy)', textAlign: 'right' }}>
                        TOTAL CALL-UP PO QUANTITY:
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: 'var(--iocl-saffron)', fontSize: '0.9375rem' }}>
                        {totalWOQty}
                      </td>
                      <td colSpan={2} style={{ padding: '0.875rem 1rem', color: '#64748B', fontSize: '0.75rem' }}>
                        (Remaining available: <strong>{remainingQty}</strong> units)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              /* Empty Call-Up PO History */
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}
                >
                  <Inbox size={24} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
                  No Call-Up POs Found
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                  No Call-Up POs have been created for this Rate Contract yet. The full contract quantity of{' '}
                  <strong>{totalContractQty}</strong> units is currently net available.
                </p>
                <Link
                  to="/admin/procurement/call-up-po"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--iocl-navy)',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    textDecoration: 'none'
                  }}
                >
                  <PlusCircle size={15} />
                  <span>Create First Call-Up PO</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
