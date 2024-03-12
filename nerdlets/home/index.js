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
  navigation,
  nerdlet,
  PlatformStateContext,
  Spinner,
  useAccountsQuery,
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
  useFetchUser,
  useReadUserPreferences,
} from '../../src/hooks';
import { exportFlowDoc, flowDocument } from '../../src/utils';
import { MAX_ENTITIES_IN_STEP, MODES, UI_CONTENT } from '../../src/constants';
import { AppContext, SidebarProvider } from '../../src/contexts';

const ACTION_BTN_ATTRIBS = {
  CREATE_FLOW: {
    type: Button.TYPE.PRIMARY,
    label: UI_CONTENT.GLOBAL.BUTTON_LABEL_CREATE_FLOW,
    iconType: Icon.TYPE.DATAVIZ__DATAVIZ__SERVICE_MAP_CHART,
  },
  EDIT_FLOW: {
    type: Button.TYPE.SECONDARY,
    iconType: Icon.TYPE.INTERFACE__OPERATIONS__EDIT,
    hint: UI_CONTENT.GLOBAL.BUTTON_LABEL_EDIT_MODE,
  },
  EDIT_FLOW_SETTINGS: {
    type: Button.TYPE.TERTIARY,
    label: UI_CONTENT.GLOBAL.BUTTON_LABEL_EDIT_SETTINGS,
  },
  EXPORT_FLOW: {
    type: Button.TYPE.TERTIARY,
    label: UI_CONTENT.GLOBAL.BUTTON_LABEL_EXPORT_FLOW,
  },
  AUDIT_LOG: {
    type: Button.TYPE.TERTIARY,
    label: UI_CONTENT.GLOBAL.BUTTON_LABEL_AUDIT_LOG,
  },
};

const HomeNerdlet = () => {
  const [app, setApp] = useState({});
  const [mode, setMode] = useState(MODES.INLINE);
  const [prevNonEditMode, setPrevNonEditMode] = useState(MODES.INLINE);
  const [flows, setFlows] = useState([]);
  const [currentFlowId, setCurrentFlowId] = useState();
  const [isAuditLogShown, setisAuditLogShown] = useState(false);
  const [editFlowSettings, setEditFlowSettings] = useState(false);
  const [transitionToFlow, setTransitionToFlow] = useState(false);
  const [transitionIntervalId, setTransitionIntervalId] = useState();
  const { accountId } = useContext(PlatformStateContext);
  const [nerdletState, setNerdletState] = useNerdletState();
  const { user } = useFetchUser();
  const { userPreferences, loading: userPreferencesLoading } =
    useReadUserPreferences();
  const {
    flows: flowsData,
    error: flowsError,
    loading: flowsLoading,
    refetch: flowsRefetch,
  } = useFlowLoader({ accountId });
  const { data: accounts = [] } = useAccountsQuery();

  useEffect(() => {
    return () => {
      if (transitionIntervalId) clearInterval(transitionIntervalId);
    };
  }, [transitionIntervalId]);

  useEffect(
    () =>
      setApp({
        account: {
          id: accountId,
          name: accounts.find(({ id }) => id === accountId)?.name,
        },
        accounts: accounts.map(({ id, name }) => ({ id, name })),
        maxEntitiesInStep: MAX_ENTITIES_IN_STEP,
        user,
      }),
    [accountId, accounts, user]
  );

  useEffect(() => {
    const defaultButtons = currentFlowId
      ? [
          {
            ...ACTION_BTN_ATTRIBS.EDIT_FLOW_SETTINGS,
            onClick: () => setEditFlowSettings(true),
          },
        ]
      : [
          {
            ...ACTION_BTN_ATTRIBS.CREATE_FLOW,
            onClick: newFlowHandler,
          },
        ];

    const actionControlButtons =
      currentFlowId && mode !== MODES.EDIT
        ? [
            {
              ...ACTION_BTN_ATTRIBS.EDIT_FLOW,
              onClick: () => changeMode(MODES.EDIT),
            },
            {
              ...ACTION_BTN_ATTRIBS.EXPORT_FLOW,
              onClick: () => exportFlowDoc(flows, currentFlowId),
            },
            {
              ...ACTION_BTN_ATTRIBS.AUDIT_LOG,
              onClick: () => setisAuditLogShown(true),
            },
            ...defaultButtons,
            {
              ...ACTION_BTN_ATTRIBS.CREATE_FLOW,
              onClick: newFlowHandler,
            },
          ]
        : [...defaultButtons];

    nerdlet.setConfig({
      accountPicker: true,
      actionControls: true,
      actionControlButtons,
      headerType: nerdlet.HEADER_TYPE.CUSTOM,
      headerTitle: 'Project Hedgehog 🦔',
    });
  }, [currentFlowId, flows, mode]);

  useEffect(() => setCurrentFlowId(nerdletState.flow?.id), [nerdletState.flow]);

  useEffect(() => {
    const newMode = nerdletState.mode || MODES.INLINE;
    if (newMode !== MODES.EDIT) setPrevNonEditMode(newMode);
    setMode(newMode);
  }, [nerdletState.mode]);

  useEffect(() => {
    if (nerdletState.refreshFlows) {
      flowsRefetch();
      setNerdletState({ refreshFlows: false });
    }
  }, [nerdletState.refreshFlows]);

  useEffect(() => setFlows(flowsData || []), [flowsData]);

  useEffect(() => {
    if (flowsError) console.error('Error fetching flows', flowsError);
  }, [flowsError]);

  const newFlowHandler = () =>
    navigation.openStackedNerdlet({
      id: 'create-flow',
    });

  const changeMode = useCallback(
    (newMode = MODES.INLINE) =>
      setNerdletState({
        mode: newMode,
      }),
    []
  );

  const flowClickHandler = useCallback(
    (id) => setNerdletState({ flow: { id } }),
    []
  );

  const backToFlowsHandler = useCallback(
    () =>
      setNerdletState({
        flow: {},
        mode: MODES.INLINE,
      }),
    []
  );

  const transitionToMode = useCallback((newMode) => {
    setTransitionToFlow(true);
    setTransitionIntervalId(
      setInterval(() => {
        setTransitionToFlow(false);
      }, 3000)
    );
    if (newMode) changeMode(newMode);
  }, []);

  const auditLogCloseHandler = () => setisAuditLogShown(false);

  const currentFlowDoc = useMemo(
    () => (currentFlowId ? flowDocument(flows, currentFlowId) : null),
    [currentFlowId, flows]
  );

  const currentView = useMemo(() => {
    if (
      nerdletState?.redirfrom !== 'product-tour' &&
      !userPreferencesLoading &&
      !userPreferences?.tour?.skipped
    )
      return <GetStarted />;

    if (currentFlowDoc)
      return (
        <AppContext.Provider value={app}>
          <SidebarProvider>
            <Flow
              flowDoc={currentFlowDoc}
              onClose={backToFlowsHandler}
              mode={mode}
              setMode={changeMode}
              prevNonEditMode={prevNonEditMode}
              flows={flows}
              onSelectFlow={flowClickHandler}
              onTransition={transitionToMode}
              isAuditLogShown={isAuditLogShown}
              onAuditLogClose={auditLogCloseHandler}
              editFlowSettings={editFlowSettings}
              setEditFlowSettings={setEditFlowSettings}
            />
            <Sidebar />
          </SidebarProvider>
        </AppContext.Provider>
      );

    if (flows && flows.length)
      return <FlowList flows={flows} onClick={flowClickHandler} />;

    if (flowsLoading) {
      return <Spinner />;
    } else {
      return <NoFlows newFlowHandler={newFlowHandler} />;
    }
  }, [
    flows,
    flowsLoading,
    currentFlowDoc,
    accountId,
    mode,
    flowClickHandler,
    isAuditLogShown,
    editFlowSettings,
  ]);

  return transitionToFlow ? (
    <Spinner />
  ) : (
    <div className="container">{currentView}</div>
  );
};

export default HomeNerdlet;
