import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Button,
  Icon,
  nerdlet,
  PlatformStateContext,
  Spinner,
  useNerdletState,
} from 'nr1';

import {
  Flow,
  FlowList,
  GetStarted,
  NoFlows,
  Sidebar,
} from '../../src/components';
import {
  useFlowLoader,
  useFlowWriter,
  useFetchUser,
  useReadUserPreferences,
  useFetchAccount,
} from '../../src/hooks';
import { MODES, REFRESH_INTERVALS, UI_CONTENT } from '../../src/constants';
import { SidebarProvider } from '../../src/contexts';
import { uuid } from '../../src/utils';

const createFlowButtonAttributes = {
  label: UI_CONTENT.GLOBAL.BUTTON_LABEL_CREATE_FLOW,
  type: Button.TYPE.PRIMARY,
  iconType: Icon.TYPE.DATAVIZ__DATAVIZ__SERVICE_MAP_CHART,
};

const editButtonAttributes = {
  label: UI_CONTENT.GLOBAL.BUTTON_LABEL_EDIT_MODE,
  type: Button.TYPE.PRIMARY,
  iconType: Icon.TYPE.INTERFACE__OPERATIONS__EDIT,
};

const editButtonFlowSettingsAttributes = {
  type: Button.TYPE.PRIMARY,
  iconType: Icon.TYPE.INTERFACE__OPERATIONS__CONFIGURE,
};

const HomeNerdlet = () => {
  const [mode, setMode] = useState(MODES.INLINE);
  const [flows, setFlows] = useState([]);
  const [currentFlowIndex, setCurrentFlowIndex] = useState(-1);
  const [editFlowSettings, setEditFlowSettings] = useState(false);
  const [accountName, setAccountName] = useState('');
  const { accountId } = useContext(PlatformStateContext);
  const [nerdletState] = useNerdletState();
  const { user } = useFetchUser();
  const { userPreferences, loading: userPreferencesLoading } =
    useReadUserPreferences();
  const {
    flows: flowsData,
    error: flowsError,
    loading: flowsLoading,
  } = useFlowLoader({ accountId });
  const flowWriter = useFlowWriter({ accountId, user });

  const { accountObject } = useFetchAccount({ accountId });

  useEffect(() => setAccountName(accountObject.name), [accountObject]);

  useEffect(() => {
    nerdlet.setConfig({
      accountPicker: true,
      actionControls: true,
      actionControlButtons:
        currentFlowIndex > -1
          ? [
              {
                ...createFlowButtonAttributes,
                onClick: newFlowHandler,
              },
              {
                ...editButtonFlowSettingsAttributes,
                onClick: () => {
                  if (!editFlowSettings) setEditFlowSettings(true);
                },
              },
              {
                ...editButtonAttributes,
                onClick: () => setMode(MODES.EDIT),
              },
            ]
          : [
              {
                ...createFlowButtonAttributes,
                onClick: newFlowHandler,
              },
            ],
      headerType: nerdlet.HEADER_TYPE.CUSTOM,
      headerTitle: 'Project Hedgehog 🦔',
    });
  }, [user, newFlowHandler, currentFlowIndex, editFlowSettings]);

  useEffect(() => setFlows(flowsData || []), [flowsData]);

  useEffect(() => {
    if (flowsError) console.error('Error fetching flows', flowsError);
  }, [flowsError]);

  const newFlowHandler = useCallback(() => {
    const id = uuid();
    flowWriter.write({
      documentId: id,
      document: {
        id,
        name: 'Untitled',
        refreshInterval: Number(REFRESH_INTERVALS, [0].value),
        stages: [],
        kpis: [],
        created: {
          user,
          timestamp: Date.now(),
        },
      },
    });
  }, [user]);

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
    if (
      nerdletState?.redirfrom !== 'product-tour' &&
      !userPreferencesLoading &&
      !userPreferences?.tour?.skipped
    )
      return <GetStarted />;

    if (currentFlowIndex > -1 && flows?.[currentFlowIndex]?.document) {
      return (
        <SidebarProvider>
          <>
            <Flow
              flowDoc={flows[currentFlowIndex].document}
              onClose={backToFlowsHandler}
              accountId={accountId}
              accountName={accountName}
              mode={mode}
              setMode={setMode}
              flows={flows}
              onSelectFlow={flowClickHandler}
              user={user}
              editFlowSettings={editFlowSettings}
              setEditFlowSettings={setEditFlowSettings}
            />
            <Sidebar />
          </>
        </SidebarProvider>
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
  }, [
    flows,
    flowsLoading,
    currentFlowIndex,
    accountId,
    mode,
    flowClickHandler,
    editFlowSettings,
  ]);

  return <div className="container">{currentView}</div>;
};

export default HomeNerdlet;
