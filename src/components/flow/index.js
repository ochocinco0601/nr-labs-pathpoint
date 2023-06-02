import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Icon, useAccountStorageMutation } from 'nr1';

import { KpiBar, Stage } from '../';
import { MODES, NERD_STORAGE, STATUSES } from '../../constants';
import { useFetchServiceLevels } from '../../hooks';
import { annotateStageWithStatuses, signalStatus } from '../../utils';

const Flow = ({
  flow = {},
  onUpdate,
  onClose,
  accountId,
  mode = MODES.KIOSK,
}) => {
  const [stages, setStages] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [guids, setGuids] = useState([]);
  const { data: serviceLevelsData, error: serviceLevelsError } =
    useFetchServiceLevels({ guids });
  const [updateFlow, { data: updateFlowData, error: updateFlowError }] =
    useAccountStorageMutation({
      actionType: useAccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: NERD_STORAGE.FLOWS_COLLECTION,
      accountId: accountId,
    });

  useEffect(() => {
    const guidsSet = new Set();
    (flow?.stages || []).map(({ stepGroups }) =>
      stepGroups.map(({ steps }) =>
        steps.map(({ signals }) =>
          signals.map(({ guid }) => guidsSet.add(guid))
        )
      )
    );
    setGuids([...guidsSet]);
    setKpis(flow?.kpis || []);
  }, [flow]);

  useEffect(() => {
    if (Object.keys(serviceLevelsData).length) {
      const stagesWithSignalsData = flow.stages.map(({ name, stepGroups }) => ({
        name,
        stepGroups: stepGroups.map(({ order, steps }) => ({
          order,
          steps: steps.map(({ title, signals }) => ({
            title,
            signals: signals.map(({ type, guid }) => {
              const { name, attainment, target } = serviceLevelsData[guid];
              return {
                type,
                guid,
                name,
                attainment,
                target,
                status: signalStatus({ type, attainment, target }),
              };
            }),
          })),
        })),
      }));
      setStages(stagesWithSignalsData.map(annotateStageWithStatuses));
    }
  }, [serviceLevelsData]);

  useEffect(() => {
    if (serviceLevelsError)
      console.error('Error fetching service levels', serviceLevelsError);
  }, [serviceLevelsError]);

  const updateKpisHandler = useCallback(
    (updatedKpis) =>
      updateFlow({
        documentId: flow.id,
        document: {
          ...flow,
          kpis: updatedKpis,
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

  return (
    <div className="flow">
      <div className="header-bar">
        <div className="back" onClick={onClose}>
          <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT} />
        </div>
        <HeadingText type={HeadingText.TYPE.HEADING_4}>
          {flow?.name}
        </HeadingText>
      </div>
      <div className="stages">
        {stages.map(
          ({ name = '', stepGroups = [], status = STATUSES.UNKNOWN }, i) => (
            <Stage
              key={i}
              name={name}
              stepGroups={stepGroups}
              status={status}
              mode={mode}
            />
          )
        )}
      </div>
      <KpiBar kpis={kpis} onChange={updateKpisHandler} mode={mode} />
    </div>
  );
};

Flow.propTypes = {
  flow: PropTypes.object,
  onUpdate: PropTypes.func,
  onClose: PropTypes.func,
  accountId: PropTypes.number,
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Flow;
