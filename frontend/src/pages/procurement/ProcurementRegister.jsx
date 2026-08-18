import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { ProcurementTabs } from '../../components/procurement/ProcurementTabs';
import { ProcurementRegisterPreview } from '../../components/procurement/ProcurementRegisterPreview';
import { getRateContracts } from '../../services/procurementService';

export const ProcurementRegister = () => {
  const [rateContracts, setRateContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegisterData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getRateContracts();
    if (res.success && res.data) {
      setRateContracts(res.data);
    } else {
      setError(res.message || 'Failed to load procurement register data.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRegisterData();
  }, [fetchRegisterData]);

  const handleEntryAdded = () => {
    // Re-fetch real records from PostgreSQL whenever a Rate Contract or Call-Up PO is submitted
    fetchRegisterData();
  };

  return (
    <div className="procurement-page-container">
      {/* 4. Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <h1 className="page-title-text">Procurement Register Entry</h1>
          <p className="page-subtitle-text">
            Record new rate contracts and call-up purchase orders 
          </p>
        </div>
      </header>

      {/* 5. Procurement Navigation Tabs */}
      <ProcurementTabs />

      {/* Main Form Content via Nested Routes */}
      <div className="procurement-content-body">
        <Outlet context={{ onEntryAdded: handleEntryAdded }} />
      </div>

      {/* 11 & 12. PostgreSQL Procurement Register Table */}
      <ProcurementRegisterPreview rateContracts={rateContracts} loading={loading} error={error} />
    </div>
  );
};
