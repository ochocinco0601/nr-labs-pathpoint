import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import { AccountStorageMutation, Spinner } from 'nr1';

import {
  KpiBar,
  Stages,
  DeleteConfirmModal,
  EditFlowSettingsModal,
  AuditLog,
  PlaybackBar,
} from '../';
import FlowHeader from './header';
import { MODES, NERD_STORAGE } from '../../constants';
import { useFlowWriter } from '../../hooks';
import {
  AppContext,
  FlowContext,
  FlowDispatchContext,
  useSidebar,
} from '../../contexts';
import {
  FLOW_DISPATCH_COMPONENTS,
  FLOW_DISPATCH_TYPES,
  flowReducer,
} from '../../reducers';

const Flow = forwardRef(
  (
    {
      flowDoc = {},
      onClose,
      mode = MODES.INLINE,
      prevNonEditMode,
      setMode = () => null,
      flows = [],
      onRefetch,
      onSelectFlow = () => null,
      onTransition,
      isAuditLogShown = false,
      onAuditLogClose,
      editFlowSettings = false,
      setEditFlowSettings = () => null,
    },
    ref
  ) => {
    const [flow, dispatch] = useReducer(flowReducer, {});
    const [isDeletingFlow, setIsDeletingFlow] = useState(false);
    const [deleteModalHidden, setDeleteModalHidden] = useState(true);
    const [lastSavedTimestamp, setLastSavedTimestamp] = useState();
    const [isPlayback, setIsPlayback] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const { account: { id: accountId } = {}, user } = useContext(AppContext);
    const { closeSidebar, openSidebar } = useSidebar();
    const flowWriter = useFlowWriter({ accountId, user });
    const stagesRef = useRef();
    const flowIdRef = useRef();

    useEffect(() => {
      dispatch({
        type: FLOW_DISPATCH_TYPES.CHANGED,
        component: FLOW_DISPATCH_COMPONENTS.FLOW,
        updates: flowDoc,
      });
      if (flowIdRef.current !== flowDoc.id) {
        closeSidebar();
        setIsPlayback(false);
        stagesRef.current?.clearPlaybackTimeWindow?.();
        flowIdRef.current = flowDoc.id;
      }
    }, [flowDoc]);

    useEffect(() => {
      if (isPreview) setMode(prevNonEditMode);
    }, [isPreview]);

    useEffect(() => {
      if (isAuditLogShown)
        openSidebar({
          content: <AuditLog flowId={flowDoc.id} accountId={accountId} />,
          onClose: onAuditLogClose,
        });
    }, [isAuditLogShown, flowDoc]);

    const saveFlow = useCallback(
      async (document) => {
        setLastSavedTimestamp(0);
        const documentId = document.id;
        await flowWriter.write({ documentId, document });
        onRefetch?.();
      },
      [onRefetch]
    );

    const flowUpdateHandler = (updates = {}) =>
      dispatch({
        type: FLOW_DISPATCH_TYPES.UPDATED,
        component: FLOW_DISPATCH_COMPONENTS.FLOW,
        updates,
      });

    const persistFlowHandler = () => {
      dispatch({
        type: FLOW_DISPATCH_TYPES.PERSISTED,
        component: FLOW_DISPATCH_COMPONENTS.FLOW,
        saveFlow,
      });
      if (onTransition && prevNonEditMode) onTransition(prevNonEditMode);
    };

    const discardFlowHandler = useCallback(() => {
      setIsPreview(false);
      if (onTransition) onTransition(prevNonEditMode);
    }, [prevNonEditMode]);

    useEffect(() => {
      const { nerdStorageWriteDocument: document } = flowWriter?.data || {};
      if (document) setLastSavedTimestamp(Date.now());
    }, [flowWriter.data]);

    useEffect(closeSidebar, [isPlayback]);

    const updateKpisHandler = (updatedKpis) =>
      flowUpdateHandler({ kpis: updatedKpis });

    const deleteFlowHandler = useCallback(async () => {
      setIsDeletingFlow(true);
      const {
        data: { nerdStorageDeleteDocument: { deleted } = {} } = {},
        error,
      } = await AccountStorageMutation.mutate({
        actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
        collection: NERD_STORAGE.FLOWS_COLLECTION,
        accountId,
        documentId: flow.id,
      });
      setIsDeletingFlow(false);
      if (error) console.error('Error deleting flow', error);
      if (deleted) onClose();
    }, [flow]);

    const togglePlayback = useCallback(() => setIsPlayback((p) => !p), []);

    const togglePreview = () => {
      if (isPreview && mode !== MODES.EDIT) setMode(MODES.EDIT);
      setIsPreview((p) => !p);
    };

    const refresh = useCallback(() => {
      stagesRef.current?.refresh?.();
    }, []);

    const preloadData = useCallback(async (timeBands, callback) => {
      await stagesRef.current?.preload?.(timeBands, callback);
    }, []);

    const seekHandler = useCallback((timeWindow) => {
      stagesRef.current?.seek?.(timeWindow);
    }, []);

    return (
      <FlowContext.Provider value={flow}>
        <FlowDispatchContext.Provider value={dispatch}>
          <div className="flow" ref={ref}>
            {flow?.id && (
              <>
                <DeleteConfirmModal
                  name={flow.name}
                  type="flow"
                  hidden={deleteModalHidden}
                  onConfirm={deleteFlowHandler}
                  onClose={() => setDeleteModalHidden(true)}
                  isDeletingFlow={isDeletingFlow}
                />
                {editFlowSettings && (
                  <EditFlowSettingsModal
                    onUpdate={flowUpdateHandler}
                    onDeleteFlow={() => setDeleteModalHidden(false)}
                    editFlowSettings={editFlowSettings}
                    setEditFlowSettings={setEditFlowSettings}
                  />
                )}
              </>
            )}
            {!isDeletingFlow ? (
              <>
                <FlowHeader
                  name={flow.name}
                  imageUrl={flow.imageUrl}
                  isPreview={isPreview}
                  onPreview={togglePreview}
                  onUpdate={flowUpdateHandler}
                  onDiscard={discardFlowHandler}
                  onPersist={persistFlowHandler}
                  onClose={onClose}
                  mode={mode}
                  setMode={setMode}
                  flows={flows}
                  isPlayback={isPlayback}
                  togglePlayback={togglePlayback}
                  onSelectFlow={onSelectFlow}
                  onDeleteFlow={() => setDeleteModalHidden(false)}
                  onRefreshFlow={refresh}
                  lastSavedTimestamp={lastSavedTimestamp}
                  resetLastSavedTimestamp={() => setLastSavedTimestamp(0)}
                  editFlowSettings={editFlowSettings}
                  setEditFlowSettings={setEditFlowSettings}
                />
                {isPlayback ? (
                  <PlaybackBar onPreload={preloadData} onSeek={seekHandler} />
                ) : null}
                <Stages mode={mode} ref={stagesRef} />
                <KpiBar onChange={updateKpisHandler} mode={mode} />
              </>
            ) : (
              <Spinner />
            )}
          </div>
        </FlowDispatchContext.Provider>
      </FlowContext.Provider>
    );
  }
);

Flow.propTypes = {
  flowDoc: PropTypes.object,
  onClose: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
  prevNonEditMode: PropTypes.oneOf(Object.values(MODES)),
  setMode: PropTypes.func,
  flows: PropTypes.array,
  onRefetch: PropTypes.func,
  onSelectFlow: PropTypes.func,
  onTransition: PropTypes.func,
  isAuditLogShown: PropTypes.bool,
  onAuditLogClose: PropTypes.func,
  editFlowSettings: PropTypes.bool,
  setEditFlowSettings: PropTypes.func,
};

Flow.displayName = 'Flow';

export default Flow;
