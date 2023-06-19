import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useAccountStorageMutation } from 'nr1';

import { KpiBar, Stages } from '../';
import FlowHeader from './header';
import { MODES, NERD_STORAGE } from '../../constants';

const Flow = ({
  flow = {},
  onUpdate,
  onClose,
  accountId,
  mode = MODES.KIOSK,
}) => {
  const [stages, setStages] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [updateFlow, { data: updateFlowData, error: updateFlowError }] =
    useAccountStorageMutation({
      actionType: useAccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: NERD_STORAGE.FLOWS_COLLECTION,
      accountId: accountId,
    });

  useEffect(() => {
    setStages(flow.stages || []);
    setKpis(flow.kpis || []);
  }, [flow]);

  const flowUpdateHandler = useCallback(
    (updates = {}) =>
      updateFlow({
        documentId: flow.id,
        document: {
          ...flow,
          ...updates,
        },
      }),
    [flow]
  );

  useEffect(() => {
    const { nerdStorageWriteDocument: { document } = {} } =
      updateFlowData || {};
    if (document) onUpdate(document);
  }, [updateFlowData]);

  useEffect(() => {
    if (updateFlowError) console.error('Error updating flow', updateFlowError);
  }, [updateFlowError]);

  const updateKpisHandler = (updatedKpis) =>
    flowUpdateHandler({ kpis: updatedKpis });

  return (
    <div className="flow">
      <FlowHeader
        name={flow.name}
        imageUrl={flow.imageUrl}
        onUpdate={flowUpdateHandler}
        onClose={onClose}
        mode={mode}
      />
      <Stages stages={stages} onUpdate={flowUpdateHandler} mode={mode} />
      <KpiBar kpis={kpis} onChange={updateKpisHandler} mode={mode} />
    </div>
  );
};

Flow.propTypes = {
  flow: PropTypes.object,
  onUpdate: PropTypes.func,
  onClose: PropTypes.func,
  accountId: PropTypes.number,
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Flow;
