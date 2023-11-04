import React, {
  forwardRef,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import { Spinner, useAccountStorageMutation } from 'nr1';

import { KpiBar, Stages, DeleteConfirmModal } from '../';
import FlowHeader from './header';
import { MODES, NERD_STORAGE } from '../../constants';
import { useFlowWriter } from '../../hooks';
import { FlowContext, FlowDispatchContext } from '../../contexts';
import { flowReducer } from '../../reducers';

const Flow = forwardRef(
  (
    {
      flowDoc = {},
      onClose,
      accountId,
      mode = MODES.INLINE,
      setMode = () => null,
      flows = [],
      onSelectFlow = () => null,
      user,
    },
    ref
  ) => {
    const [flow, dispatch] = useReducer(flowReducer, flowDoc);
    const [isDeletingFlow, setDeletingFlow] = useState(false);
    const [kpis, setKpis] = useState([]);
    const [deleteModalHidden, setDeleteModalHidden] = useState(true);
    const [lastSavedTimestamp, setLastSavedTimestamp] = useState();
    const flowWriter = useFlowWriter({ accountId, user });

    useEffect(() => {
      setKpis(flow.kpis || []);
    }, [flow]);

    const saveFlow = useCallback((document) => {
      setLastSavedTimestamp(0);
      const documentId = document.id;
      flowWriter.write({ documentId, document });
    }, []);

    const flowUpdateHandler = useCallback(
      (updates = {}) => {
        setLastSavedTimestamp(0);
        flowWriter.write({
          documentId: flow.id,
          document: {
            ...flow,
            ...updates,
          },
        });
      },
      [flow]
    );

    useEffect(() => {
      const { nerdStorageWriteDocument: document } = flowWriter?.data || {};
      if (document) setLastSavedTimestamp(Date.now());
    }, [flowWriter.data]);

    const updateKpisHandler = (updatedKpis) =>
      flowUpdateHandler({ kpis: updatedKpis });

    const [deleteFlow, { data: deleteFlowData, error: deleteFlowError }] =
      useAccountStorageMutation({
        actionType: useAccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
        collection: NERD_STORAGE.FLOWS_COLLECTION,
        accountId: accountId,
      });

    const deleteFlowHandler = useCallback(async () => {
      setDeletingFlow(true);
      await deleteFlow({
        documentId: flow.id,
      });
      setDeletingFlow(false);
    }, [flow]);

    useEffect(() => {
      const { nerdStorageDeleteDocument: { deleted } = {} } =
        deleteFlowData || {};
      if (deleted) onClose();
    }, [deleteFlowData]);

    useEffect(() => {
      if (deleteFlowError)
        console.error('Error deleting flow', deleteFlowError);
    }, [deleteFlowError]);

    return (
      <FlowContext.Provider value={flow}>
        <FlowDispatchContext.Provider value={dispatch}>
          <div className="flow" ref={ref}>
            {mode === MODES.EDIT && (
              <DeleteConfirmModal
                name={flow.name}
                type="flow"
                hidden={deleteModalHidden}
                onConfirm={() => deleteFlowHandler()}
                onClose={() => setDeleteModalHidden(true)}
                isDeletingFlow={isDeletingFlow}
              />
            )}
            {!isDeletingFlow ? (
              <>
                <FlowHeader
                  name={flow.name}
                  imageUrl={flow.imageUrl}
                  onUpdate={flowUpdateHandler}
                  onClose={onClose}
                  mode={mode}
                  setMode={setMode}
                  flows={flows}
                  onSelectFlow={onSelectFlow}
                  onDeleteFlow={() => setDeleteModalHidden(false)}
                  lastSavedTimestamp={lastSavedTimestamp}
                  resetLastSavedTimestamp={() => setLastSavedTimestamp(0)}
                />
                <Stages mode={mode} saveFlow={saveFlow} />
                <KpiBar kpis={kpis} onChange={updateKpisHandler} mode={mode} />
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
  accountId: PropTypes.number,
  mode: PropTypes.oneOf(Object.values(MODES)),
  setMode: PropTypes.func,
  flows: PropTypes.array,
  onSelectFlow: PropTypes.func,
  user: PropTypes.object,
};

Flow.displayName = 'Flow';

export default Flow;
