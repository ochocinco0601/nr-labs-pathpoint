import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Button, Icon, nerdlet, PlatformStateContext, Spinner } from 'nr1';

import { Flow, FlowList, NoFlows } from '../../src/components';
import { useFlowLoader, useFlowWriter, useFetchUser } from '../../src/hooks';
import { MODES, UI_CONTENT } from '../../src/constants';
import { uuid } from '../../src/utils';

const HomeNerdlet = () => {
  const [mode, setMode] = useState(MODES.INLINE);
  const [flows, setFlows] = useState([]);
  const [currentFlowIndex, setCurrentFlowIndex] = useState(-1);
  const { accountId } = useContext(PlatformStateContext);
  const { user } = useFetchUser();

  const {
    flows: flowsData,
    error: flowsError,
    loading: flowsLoading,
  } = useFlowLoader({ accountId });

  const flowWriter = useFlowWriter({ accountId, user });
  const newFlowId = useRef();

  const actionControlButtons = useMemo(() => {
    const buttons = [];
    if (mode !== MODES.EDIT) {
      if (currentFlowIndex > -1) {
        buttons.push({
          label: mode === MODES.INLINE ? 'Stacked view' : 'Inline view',
          type: Button.TYPE.SECONDARY,
          onClick: () =>
            setMode(mode === MODES.INLINE ? MODES.STACKED : MODES.INLINE),
        });
      }
      buttons.push({
        label: UI_CONTENT.GLOBAL.BUTTON_LABEL_CREATE_FLOW,
        type: Button.TYPE.PRIMARY,
        iconType: Icon.TYPE.DATAVIZ__DATAVIZ__SERVICE_MAP_CHART,
        onClick: () => newFlowHandler(),
      });
    }
    return buttons;
  }, [mode, newFlowHandler, currentFlowIndex, newFlowId]);

  useEffect(() => {
    nerdlet.setConfig({
      accountPicker: true,
      actionControls: true,
      actionControlButtons: actionControlButtons,
      headerType: nerdlet.HEADER_TYPE.CUSTOM,
      headerTitle: 'Project Hedgehog 🦔',
    });
  }, [mode, newFlowHandler, currentFlowIndex]);

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
    flowWriter.write({
      documentId: id,
      document: {
        id,
        name: 'Untitled',
        stages: [],
        kpis: [],
      },
    });
  }, []);

  const updateFlowHandler = useCallback(
    (flow) =>
      setFlows((f) =>
        f.map(({ document }) => (document.id === flow.id ? flow : document))
      ),
    []
  );

  const flowClickHandler = useCallback(
    (id) => setCurrentFlowIndex(flows.findIndex((f) => f.id === id)),
    [flows]
  );

  const backToFlowsHandler = useCallback(() => {
    setCurrentFlowIndex(-1);
    setMode(MODES.INLINE);
  }, []);

  useEffect(() => {
    const { nerdStorageWriteDocument: { id } = {} } = flowWriter?.data || {};
    if (id) {
      setMode(MODES.EDIT);
      flowClickHandler(id);
    }
  }, [flowWriter.data]);

  const currentView = useMemo(() => {
    if (currentFlowIndex > -1 && flows?.[currentFlowIndex]?.document) {
      return (
        <Flow
          flow={flows[currentFlowIndex].document}
          onUpdate={updateFlowHandler}
          onClose={backToFlowsHandler}
          accountId={accountId}
          mode={mode}
          setMode={setMode}
          flows={flows}
          onSelectFlow={flowClickHandler}
          user={user}
        />
      );
    }
    if (flows && flows.length) {
      backToFlowsHandler();
      return <FlowList flows={flows} onClick={flowClickHandler} />;
    }
    if (flowsLoading) {
      return <Spinner />;
    } else {
      return <NoFlows newFlowHandler={newFlowHandler} />;
    }
  }, [flows, currentFlowIndex, accountId, mode, flowClickHandler]);

  return <div className="container">{currentView}</div>;
};

export default HomeNerdlet;
