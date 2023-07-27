import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, Icon, Spinner, useAccountStorageMutation } from 'nr1';

import { KpiBar, Stages, DeleteConfirmModal } from '../';
import FlowHeader from './header';
import { MODES, NERD_STORAGE } from '../../constants';

const Flow = ({
  flow = {},
  onUpdate,
  onClose,
  accountId,
  mode = MODES.KIOSK,
  flows = [],
  onSelectFlow = () => null,
  userConfig = {},
  updateUserStorage = () => null,
}) => {
  const [isDeletingFlow, setDeletingFlow] = useState(false);
  const [stages, setStages] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);
  const [hideBanner, setHideBanner] = useState(
    userConfig?.dismissEditModeBanner | false
  );
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
    if (deleteFlowError) console.error('Error deleting flow', deleteFlowError);
  }, [deleteFlowError]);

  return (
    <div className="flow">
      {mode === MODES.EDIT && (
        <>
          <DeleteConfirmModal
            name={flow.name}
            type="flow"
            hidden={deleteModalHidden}
            onConfirm={() => deleteFlowHandler()}
            onClose={() => setDeleteModalHidden(true)}
            isDeletingFlow={isDeletingFlow}
          />
          {!hideBanner && (
            <div className="edit-mode-banner">
              <div>
                <Icon
                  className="info-icon"
                  type={Icon.TYPE.INTERFACE__INFO__INFO}
                />
                Note: Changes in edit mode are automatically saved.
              </div>
              <div>
                <Button
                  className="button dismiss"
                  sizeType={Button.SIZE_TYPE.SMALL}
                  onClick={() => {
                    setHideBanner(true);
                    updateUserStorage({
                      ...userConfig,
                      dismissEditModeBanner: true,
                      timestamp: new Date().getTime(),
                    });
                  }}
                >
                  {"Don't show this banner again"}
                </Button>
                <Button
                  className="button close"
                  sizeType={Button.SIZE_TYPE.SMALL}
                  iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__CLOSE}
                  onClick={() => setHideBanner(true)}
                />
              </div>
            </div>
          )}
        </>
      )}
      {!isDeletingFlow ? (
        <>
          <FlowHeader
            name={flow.name}
            imageUrl={flow.imageUrl}
            onUpdate={flowUpdateHandler}
            onClose={onClose}
            mode={mode}
            flows={flows}
            onSelectFlow={onSelectFlow}
            onDeleteFlow={() => setDeleteModalHidden(false)}
          />
          <Stages stages={stages} onUpdate={flowUpdateHandler} mode={mode} />
          <KpiBar kpis={kpis} onChange={updateKpisHandler} mode={mode} />
        </>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

Flow.propTypes = {
  flow: PropTypes.object,
  onUpdate: PropTypes.func,
  onClose: PropTypes.func,
  accountId: PropTypes.number,
  mode: PropTypes.oneOf(Object.values(MODES)),
  flows: PropTypes.array,
  onSelectFlow: PropTypes.func,
  userConfig: PropTypes.object,
  updateUserStorage: PropTypes.func,
};

export default Flow;
