import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Icon, nerdlet, PlatformStateContext } from 'nr1';

import { NoFlows } from '../../src/components';
import { useFetchFlows } from '../../src/hooks';

const HomeNerdlet = () => {
  const [flows, setFlows] = useState([]);
  const { accountId } = useContext(PlatformStateContext);
  const { data: flowsData, error: flowsError } = useFetchFlows({ accountId });

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
    // TODO: set flows
    setFlows(flowsData || []);
  }, [flowsData]);

  useEffect(() => {
    if (flowsError) console.error('Error fetching flows', flowsError);
  }, [flowsError]);

  const newFlowHandler = useCallback(() => {
    // TODO: handle creation of new flows
  });

  return (
    <div className="container">
      {flows && flows.length ? null : (
        <NoFlows newFlowHandler={newFlowHandler} />
      )}
    </div>
  );
};

export default HomeNerdlet;
