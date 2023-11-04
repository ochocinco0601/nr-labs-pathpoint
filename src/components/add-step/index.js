import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'nr1';

import { FlowDispatchContext, StagesContext } from '../../contexts';
import { FLOW_DISPATCH_COMPONENTS, FLOW_DISPATCH_TYPES } from '../../reducers';

const AddStep = ({ stageId, saveFlow }) => {
  const stages = useContext(StagesContext);
  const dispatch = useContext(FlowDispatchContext);
  const [levels, setLevels] = useState([]);
  const [nextLevel, setNextLevel] = useState(levels.length + 1);
  const [displayStepOptions, setDisplayStepOptions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [stepTitle, setStepTitle] = useState('');

  useEffect(() => {
    const { levels: stageLevels = [] } =
      (stages || []).find(({ id }) => id === stageId) || {};
    setLevels(stageLevels);
    setNextLevel(stageLevels.length + 1);
  }, [stageId, stages]);

  const addStepHandler = () => {
    dispatch({
      type: FLOW_DISPATCH_TYPES.ADDED,
      component: FLOW_DISPATCH_COMPONENTS.STEP,
      componentIds: { stageId, levelId: selectedLevel },
      updates: { title: stepTitle },
      saveFlow,
    });
    resetState();
  };

  const cancelAddStepHandler = () => resetState();

  const resetState = () => {
    setSelectedLevel('');
    setStepTitle('');
    setDisplayStepOptions(false);
  };

  return displayStepOptions ? (
    <div className="add-step">
      <select
        value={selectedLevel}
        onChange={({ target: { value } = {} }) => setSelectedLevel(value)}
      >
        {levels.map(({ id }, index) => (
          <option key={id} value={id}>
            {index + 1}
          </option>
        ))}
        <option value="">{nextLevel}</option>
      </select>
      <input
        type="text"
        placeholder="Untitled step"
        value={stepTitle}
        onChange={({ target: { value } = {} }) => setStepTitle(value)}
      />
      <Button
        type={Button.TYPE.PRIMARY}
        sizeType={Button.SIZE_TYPE.SMALL}
        iconType={Button.ICON_TYPE.INTERFACE__SIGN__CHECKMARK}
        disabled={!stepTitle}
        onClick={addStepHandler}
      />
      <Button
        type={Button.TYPE.TERTIARY}
        sizeType={Button.SIZE_TYPE.SMALL}
        iconType={Button.ICON_TYPE.INTERFACE__SIGN__CLOSE}
        onClick={cancelAddStepHandler}
      />
    </div>
  ) : (
    <Button
      type={Button.TYPE.SECONDARY}
      sizeType={Button.SIZE_TYPE.SMALL}
      iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS__V_ALTERNATE}
      onClick={() => setDisplayStepOptions(true)}
    >
      Add a step
    </Button>
  );
};

AddStep.propTypes = {
  stageId: PropTypes.string,
  saveFlow: PropTypes.func,
};

export default AddStep;
