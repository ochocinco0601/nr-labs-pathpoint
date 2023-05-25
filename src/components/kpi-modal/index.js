import React, { useContext, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText, Modal, PlatformStateContext } from 'nr1';

import {
  EditInPlace,
  NrqlEditor,
  SimpleBillboard,
} from '@newrelic/nr-labs-components';

import KpiModalDeleteContent from './delete';
import KpiModalEmptyState from './empty';
import { useFetchKpis } from '../../hooks';
import { KPI_MODES } from '../../constants';

const KpiModal = ({
  kpi = {},
  kpiIndex = 0,
  kpiMode = 'view', // kpiMode = "view" / "add" kpi / "edit" existing kpi / "delete" existing kpi
  showModal = false,
  setShowModal = setShowModal ? setShowModal : () => null,
  updateKpiArray = updateKpiArray ? updateKpiArray : () => null,
}) => {
  const { accountId: platformAcctId } = useContext(PlatformStateContext);
  const [accountId, setAccountId] = useState(
    Number.isInteger(platformAcctId) ? platformAcctId : ''
  );

  const [name, setName] = useState(
    ['edit', 'delete'].includes(kpiMode) ? kpi.name : ''
  );
  const [nrqlQuery, setNrqlQuery] = useState(
    ['edit', 'delete'].includes(kpiMode) ? kpi.nrqlQuery : ''
  );

  const [previewOk, setPreviewOk] = useState(false);

  const nameRef = useRef('name');

  useEffect(() => {
    setAccountId(kpi.accountIds?.length ? kpi.accountIds[0] : '');
    ['add', 'edit'].includes(kpiMode) && setName(kpi.name);
    ['add', 'edit'].includes(kpiMode) && setNrqlQuery(kpi.nrqlQuery);
  }, [kpi, kpiMode]);

  const hookData = useFetchKpis({
    kpiData:
      accountId && accountId !== 'cross-account' && nrqlQuery
        ? [
            {
              index: kpiIndex,
              accountIds: [accountId],
              nrqlQuery: nrqlQuery,
            },
          ]
        : [],
  });

  useEffect(() => {
    if (
      accountId &&
      accountId !== 'cross-account' &&
      nrqlQuery &&
      !hookData?.error
    ) {
      setPreviewOk(true);
    } else {
      setPreviewOk(false);
    }
  }, [accountId, nrqlQuery, hookData]);

  return (
    <Modal hidden={!showModal} onClose={() => setShowModal(false)}>
      <div className="modal-component">
        {kpiMode === KPI_MODES.DELETE ? (
          <KpiModalDeleteContent
            kpi={kpi}
            kpiIndex={kpiIndex}
            setShowModal={setShowModal}
            updateKpiArray={updateKpiArray}
          />
        ) : (
          <>
            <div className="modal-component-kpi-title"></div>
            <div className="modal-component-detail">
              <>
                <div className="modal-component-edit-in-place">
                  <div className="modal-component-kpi-name">
                    <EditInPlace
                      value={name}
                      setValue={setName}
                      ref={nameRef}
                      placeholder="Enter KPI name"
                    />
                  </div>
                </div>
                <div className="modal-component-nrql-editor">
                  <NrqlEditor
                    query={kpi.nrqlQuery}
                    accountId={accountId}
                    saveButtonText="Preview"
                    onSave={(res) => {
                      setAccountId(res.accountId);
                      setNrqlQuery(res.query);
                    }}
                  />
                </div>
                <div className="modal-component-preview-heading">
                  <HeadingText type={HeadingText.TYPE.HEADING_1}>
                    Preview:
                  </HeadingText>
                </div>
                {!accountId ||
                accountId === 'cross-account' ||
                !nrqlQuery ||
                hookData?.error ? (
                  <div className="modal-component-empty-state">
                    <KpiModalEmptyState
                      accountId={accountId}
                      nrqlQuery={nrqlQuery}
                      error={hookData?.error}
                    />
                  </div>
                ) : (
                  <div className="kpi-data">
                    <SimpleBillboard
                      metric={{
                        value: (hookData?.kpis || [])[0]?.value,
                        previousValue: (hookData?.kpis || [])[0]?.previousValue,
                        className: 'modal-component-metric-value',
                      }}
                      statusTrend={{
                        className: 'modal-component-status-trend',
                      }}
                      title={{
                        name: name,
                        className: 'modal-component-metric-name',
                      }}
                    />
                  </div>
                )}
              </>
            </div>
            <div className="kpi-modal-button-bar">
              <Button
                className={`kpi-modal-buttons ${
                  kpiMode === KPI_MODES.ADD ? 'add' : 'save'
                }`}
                type={Button.TYPE.PRIMARY}
                sizeType={Button.SIZE_TYPE.LARGE}
                spacingType={[Button.SPACING_TYPE.EXTRA_LARGE]}
                disabled={!previewOk}
                onClick={() => {
                  switch (kpiMode) {
                    case KPI_MODES.ADD:
                      updateKpiArray({
                        id: kpi.id,
                        accountIds: [accountId],
                        name,
                        nrqlQuery,
                      });
                      break;
                    case KPI_MODES.EDIT:
                      updateKpiArray(
                        {
                          id: kpi.id,
                          accountIds: [accountId],
                          name,
                          nrqlQuery,
                        },
                        kpiIndex
                      );
                      break;
                  }
                  setShowModal(false);
                }}
              >
                {kpiMode === KPI_MODES.ADD ? 'Add KPI' : 'Save changes'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

KpiModal.propTypes = {
  kpi: PropTypes.object,
  kpiIndex: PropTypes.number,
  kpiMode: PropTypes.oneOf(Object.values(KPI_MODES)),
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
  updateKpiArray: PropTypes.func,
};

export default KpiModal;
