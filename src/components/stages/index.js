import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText } from 'nr1';

import { Stage } from '../';
import { useFetchServiceLevels } from '../../hooks';
import { MODES, STATUSES } from '../../constants';
import {
  addSignalStatuses,
  annotateStageWithStatuses,
  uniqueSignalGuidsInStages,
} from '../../utils';

const Stages = ({ stages = [], onUpdate, mode = MODES.KIOSK }) => {
  const [stagesWithStatuses, setStagesWithStatuses] = useState([]);
  const [guids, setGuids] = useState([]);
  const { data: serviceLevelsData, error: serviceLevelsError } =
    useFetchServiceLevels({ guids });

  useEffect(() => {
    setStagesWithStatuses(stages);
    setGuids(uniqueSignalGuidsInStages(stages));
  }, [stages]);

  useEffect(() => {
    if (!Object.keys(serviceLevelsData).length) return;
    const stagesWithSLData = addSignalStatuses(stages, serviceLevelsData);
    setStagesWithStatuses(stagesWithSLData.map(annotateStageWithStatuses));
  }, [serviceLevelsData]);

  useEffect(() => {
    if (serviceLevelsError)
      console.error('Error fetching service levels', serviceLevelsError);
  }, [serviceLevelsError]);

  const addStageHandler = () =>
    onUpdate
      ? onUpdate({
          stages: [
            ...stages,
            {
              name: 'New Stage',
              stepGroups: [],
            },
          ],
        })
      : null;

  const updateStageHandler = (updatedStage, index) => {
    const updatedStages = [...stages];
    updatedStages[index] = updatedStage;
    if (onUpdate) onUpdate({ stages: updatedStages });
  };

  return (
    <>
      <div className="stages-header">
        <HeadingText type={HeadingText.TYPE.HEADING_4}>Stages</HeadingText>
        {mode === MODES.EDIT ? (
          <Button
            type={Button.TYPE.SECONDARY}
            sizeType={Button.SIZE_TYPE.SMALL}
            iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS__V_ALTERNATE}
            onClick={addStageHandler}
          >
            Add a stage
          </Button>
        ) : null}
      </div>
      <div className="stages">
        {(stagesWithStatuses || []).map(
          ({ name = '', stepGroups = [], status = STATUSES.UNKNOWN }, i) => (
            <Stage
              key={i}
              name={name}
              stepGroups={stepGroups}
              status={status}
              mode={mode}
              onUpdate={(updateStage) => updateStageHandler(updateStage, i)}
            />
          )
        )}
      </div>
    </>
  );
};

Stages.propTypes = {
  stages: PropTypes.array,
  onUpdate: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Stages;
