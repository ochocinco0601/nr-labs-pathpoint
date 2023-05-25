import React, { useContext, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  EmptyState,
  HeadingText,
  Modal,
  PlatformStateContext,
} from 'nr1';

import {
  EditInPlace,
  NrqlEditor,
  SimpleBillboard,
} from '@newrelic/nr-labs-components';

import { useFetchKpis } from '../../hooks';

const kpiEmptyState = (props) => {
  const accountValid =
    props.accountId > 0 && props.accountId !== 'cross-account';

  const desc = !accountValid
    ? 'At least one account must be selected'
    : !props.nrqlQuery
    ? 'Enter and run a query to preview the result'
    : props.error && props.error.graphQLErrors[0].message;

  return (
    <EmptyState
      fullWidth
      iconType={EmptyState.ICON_TYPE.INTERFACE__PLACEHOLDERS__ICON_PLACEHOLDER}
      title={
        !accountValid || !props.nrqlQuery
          ? 'No preview available yet'
          : 'Error!'
      }
      description={desc}
      type={
        !accountValid || !props.nrqlQuery
          ? EmptyState.TYPE.NORMAL
          : EmptyState.TYPE.ERROR
      }
      additionalInfoLink={{
        label: 'See our NRQL reference',
        to: 'https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/nrql-syntax-clauses-functions/',
      }}
    />
  );
};

const KpiModal = ({
  kpi = {},
  kpiIndex = 0,
  kpiMode = 'view', // kpiMode = "view" / "add" kpi / "edit" existing kpi / "delete" existing kpi
  showModal = false,
  setShowModal = setShowModal ? setShowModal : () => null,
  updateKpiArray = updateKpiArray ? updateKpiArray : () => null,
}) => {
  const { accountId: platformAcctId } =
    useContext(PlatformStateContext).accountId;
  const [accountId, setAccountId] = useState(
    platformAcctId > 0
      ? platformAcctId
      : kpi?.accountIds?.length
      ? kpi.accountIds[0]
      : ''
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
    ['add', 'edit'].includes(kpiMode) && setName(kpi.name);
    ['add', 'edit'].includes(kpiMode) && setNrqlQuery(kpi.nrqlQuery);
  }, [kpi]);

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
        <div
          className={`${kpiMode !== 'delete' && 'modal-component-kpi-title'}`}
        ></div>
        <div className={`${kpiMode !== 'delete' && 'modal-component-detail'}`}>
          {kpiMode === 'delete' ? (
            <div>
              <HeadingText type={HeadingText.TYPE.HEADING_3}>
                Are you sure you want to delete &quot;{kpi.name}&quot; KPI ?
              </HeadingText>
            </div>
          ) : (
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
                  {kpiEmptyState({
                    accountId,
                    nrqlQuery,
                    error: hookData?.error,
                  })}
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
          )}
        </div>
        <div className="kpi-modal-button-bar">
          <Button
            className={`kpi-modal-buttons ${
              kpiMode === 'add' ? 'add' : kpiMode === 'edit' ? 'save' : 'delete'
            }`}
            type={
              kpiMode === 'delete'
                ? Button.TYPE.DESTRUCTIVE
                : Button.TYPE.PRIMARY
            }
            sizeType={Button.SIZE_TYPE.LARGE}
            spacingType={[Button.SPACING_TYPE.EXTRA_LARGE]}
            disabled={!previewOk}
            onClick={() => {
              switch (kpiMode) {
                case 'add':
                  updateKpiArray({
                    id: kpi.id,
                    accountIds: [accountId],
                    name,
                    nrqlQuery,
                  });
                  break;
                case 'edit':
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
                case 'delete':
                  updateKpiArray(kpiIndex);
              }
              setShowModal(false);
            }}
          >
            {kpiMode === 'add'
              ? 'Add KPI'
              : kpiMode === 'edit'
              ? 'Save changes'
              : 'Delete KPI'}
          </Button>
          {kpiMode === 'delete' && (
            <Button
              className={`kpi-modal-buttons cancel`}
              type={Button.TYPE.NORMAL}
              sizeType={Button.SIZE_TYPE.LARGE}
              spacingType={[Button.SPACING_TYPE.EXTRA_LARGE]}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

KpiModal.propTypes = {
  kpi: PropTypes.object,
  kpiIndex: PropTypes.number,
  kpiMode: PropTypes.string,
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
  updateKpiArray: PropTypes.func,
};

export default KpiModal;
