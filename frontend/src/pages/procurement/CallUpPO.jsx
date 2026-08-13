import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CallUpPOForm } from '../../components/procurement/CallUpPOForm';

export const CallUpPO = () => {
  const context = useOutletContext();
  const onEntryAdded = context?.onEntryAdded;

  return (
    <div className="call-up-po-page">
      <CallUpPOForm onEntryAdded={onEntryAdded} />
    </div>
  );
};
