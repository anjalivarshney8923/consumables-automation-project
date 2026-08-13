import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { RateContractForm } from '../../components/procurement/RateContractForm';

export const NewRateContract = () => {
  const context = useOutletContext();
  const onEntryAdded = context?.onEntryAdded;

  return (
    <div className="new-rate-contract-page">
      <RateContractForm onEntryAdded={onEntryAdded} />
    </div>
  );
};
