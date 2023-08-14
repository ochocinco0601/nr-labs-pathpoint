import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Button,
  Icon,
  nerdlet,
  PlatformStateContext,
  Spinner,
  useAccountStorageMutation,
} from 'nr1';

import { Flow, FlowList, NoFlows } from '../../src/components';
import { useFlowLoader } from '../../src/hooks';
import { MODES, NERD_STORAGE } from '../../src/constants';
import { uuid } from '../../src/utils';

const HomeNerdlet = () => {
  const [mode, setMode] = useState(MODES.INLINE);
  const [flows, setFlows] = useState([]);
  const [currentFlowIndex, setCurrentFlowIndex] = useState(-1);
  const { accountId } = useContext(PlatformStateContext);

  const {
    flows: flowsData,
    error: flowsError,
    loading: flowsLoading,
  } = useFlowLoader({ accountId });

  const [createFlow, { data: createFlowData, error: createFlowError }] =
    useAccountStorageMutation({
      actionType: useAccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: NERD_STORAGE.FLOWS_COLLECTION,
      accountId: accountId,
    });
  const newFlowId = useRef();

  const actionControlButtons = useMemo(() => {
    const buttons = [];
    if (mode === MODES.EDIT) {
      buttons.push({
        label: 'Exit edit mode',
        type: Button.TYPE.PRIMARY,
        iconType: Icon.TYPE.INTERFACE__OPERATIONS__CLOSE,
        onClick: () => setMode(MODES.INLINE),
      });
    } else {
      if (currentFlowIndex > -1) {
        buttons.push({
          label: 'Editing mode',
          type: Button.TYPE.SECONDARY,
          iconType: Icon.TYPE.INTERFACE__OPERATIONS__EDIT,
          onClick: () => setMode(MODES.EDIT),
        });
        buttons.push({
          label: mode === MODES.INLINE ? 'Stacked view' : 'Inline view',
          type: Button.TYPE.SECONDARY,
          onClick: () =>
            setMode(mode === MODES.INLINE ? MODES.STACKED : MODES.INLINE),
        });
      }
      buttons.push({
        label: 'Create new flow',
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
    const { nerdStorageWriteDocument: { id } = {} } = createFlowData || {};
    if (id) {
      setMode(MODES.EDIT);
      flowClickHandler(id);
    }
  }, [createFlowData]);

  useEffect(() => {
    if (createFlowError)
      console.error('Error creating new flow', createFlowError);
  }, [createFlowError]);

  const currentView = useMemo(() => {
    if (currentFlowIndex > -1 && flows?.[currentFlowIndex]?.document) {
      return (
        <Flow
          flow={flows[currentFlowIndex].document}
          onUpdate={updateFlowHandler}
          onClose={backToFlowsHandler}
          accountId={accountId}
          mode={mode}
          flows={flows}
          onSelectFlow={flowClickHandler}
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
