import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Icon,
  nerdlet,
  PlatformStateContext,
  useAccountStorageMutation,
} from 'nr1';

import { NoFlows } from '../../src/components';
import { useFlowLoader } from '../../src/hooks';
import { NERD_STORAGE } from '../../src/constants';
import { uuid } from '../../src/utils';

const HomeNerdlet = () => {
  const [flows, setFlows] = useState([]);
  const { accountId } = useContext(PlatformStateContext);
  const { flows: flowsData, error: flowsError } = useFlowLoader({ accountId });
  const [createFlow, { error: createFlowError }] = useAccountStorageMutation({
    actionType: useAccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: NERD_STORAGE.FLOWS_COLLECTION,
    accountId: accountId,
  });
  const newFlowId = useRef();

  useEffect(() => {
    nerdlet.setConfig({
      accountPicker: true,
      actionControls: true,
      actionControlButtons: [
        {
          label: 'Create new flow',
          iconType: Icon.TYPE.DATAVIZ__DATAVIZ__SERVICE_MAP_CHART,
          onClick: newFlowHandler,
        },
      ],
      headerType: nerdlet.HEADER_TYPE.CUSTOM,
      headerTitle: 'Project Hedgehog 🦔',
    });
  }, []);

  useEffect(() => {
    setFlows(flowsData || []);
    if (newFlowId.current) {
      // TODO: set current flow
      // const index = flowsData.findIndex((f) => f.id === newFlowId.current);
      newFlowId.current = null;
    }
  }, [flowsData]);

  useEffect(() => {
    if (flowsError) console.error('Error fetching flows', flowsError);
  }, [flowsError]);

  const newFlowHandler = useCallback(() => {
    const id = uuid();
    newFlowId.current = id;
    createFlow({
      documentId: id,
      document: {
        id,
        name: 'Untitled',
        stages: [],
        kpis: [],
      },
    });
  }, []);

  useEffect(() => {
    if (createFlowError)
      console.error('Error creating new flow', createFlowError);
  }, [createFlowError]);

  return (
    <div className="container">
      {flows && flows.length ? null : (
        <NoFlows newFlowHandler={newFlowHandler} />
      )}
    </div>
  );
};

export default HomeNerdlet;
