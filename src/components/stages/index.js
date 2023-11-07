import React, { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText } from 'nr1';

import { Stage } from '../';
import { useFetchServiceLevels } from '../../hooks';
import { MODES } from '../../constants';
import {
  addSignalStatuses,
  annotateStageWithStatuses,
  uniqueSignalGuidsInStages,
} from '../../utils';
import {
  FlowContext,
  FlowDispatchContext,
  StagesContext,
} from '../../contexts';
import { FLOW_DISPATCH_COMPONENTS, FLOW_DISPATCH_TYPES } from '../../reducers';

const Stages = ({ mode = MODES.INLINE, saveFlow }) => {
  const { stages = [] } = useContext(FlowContext);
  const dispatch = useContext(FlowDispatchContext);
  const [guids, setGuids] = useState([]);
  const [stagesWithStatuses, setStagesWithStatuses] = useState(stages);
  const dragItemIndex = useRef();
  const dragOverItemIndex = useRef();
  const { data: serviceLevelsData, error: serviceLevelsError } =
    useFetchServiceLevels({ guids });

  useEffect(() => {
    const uniqueGuids = uniqueSignalGuidsInStages(stages);
    if (
      uniqueGuids.length === guids.length &&
      uniqueGuids.every((guid) => guids.includes(guid))
    )
      return;
    setGuids(uniqueGuids);
  }, [stages]);

  useEffect(() => {
    const stagesWithSLData = addSignalStatuses(stages, serviceLevelsData);
    setStagesWithStatuses(stagesWithSLData.map(annotateStageWithStatuses));
  }, [stages, serviceLevelsData]);

  useEffect(() => {
    if (serviceLevelsError)
      console.error('Error fetching service levels', serviceLevelsError);
  }, [serviceLevelsError]);

  const addStageHandler = () =>
    dispatch({
      type: FLOW_DISPATCH_TYPES.ADDED,
      component: FLOW_DISPATCH_COMPONENTS.STAGE,
      saveFlow,
    });

  const dragStartHandler = (e, index) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const dragOverHandler = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverItemIndex.current = index;
  };

  const dropHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceIndex = dragItemIndex.current;
    const targetIndex = dragOverItemIndex.current;
    dispatch({
      type: FLOW_DISPATCH_TYPES.REORDERED,
      component: FLOW_DISPATCH_COMPONENTS.STAGE,
      updates: { sourceIndex, targetIndex },
      saveFlow,
    });
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  return (
    <StagesContext.Provider value={stagesWithStatuses}>
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
        {(stagesWithStatuses || []).map(({ id }, i) => (
          <Stage
            key={id}
            stageId={id}
            mode={mode}
            onDragStart={(e) => dragStartHandler(e, i)}
            onDragOver={(e) => dragOverHandler(e, i)}
            onDrop={(e) => dropHandler(e)}
            saveFlow={saveFlow}
          />
        ))}
      </div>
    </StagesContext.Provider>
  );
};

Stages.propTypes = {
  mode: PropTypes.oneOf(Object.values(MODES)),
  saveFlow: PropTypes.func,
};

export default Stages;
