import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'nr1';

const AddStep = ({ stepGroups = [], onUpdate }) => {
  const [displayStepOptions, setDisplayStepOptions] = useState(false);
  const [selectedStepGroup, setSelectedStepGroup] = useState(
    stepGroups.length + 1
  );
  const [stepTitle, setStepTitle] = useState('');

  const addStepHandler = () => {
    const updatedStepGroups =
      selectedStepGroup > stepGroups.length
        ? [...stepGroups, { steps: [{ signals: [], title: stepTitle }] }]
        : stepGroups.map((stepGroup, index) =>
            index === selectedStepGroup - 1
              ? {
                  ...stepGroup,
                  steps: [
                    ...stepGroup.steps,
                    { signals: [], title: stepTitle },
                  ],
                }
              : stepGroup
          );
    if (onUpdate) onUpdate({ stepGroups: updatedStepGroups });
    cancelAddStepHandler();
  };

  const cancelAddStepHandler = useCallback(() => {
    setSelectedStepGroup(stepGroups.length + 1);
    setStepTitle('');
    setDisplayStepOptions(false);
  }, [stepGroups]);

  return displayStepOptions ? (
    <div className="add-step">
      <select
        value={selectedStepGroup}
        onChange={({ target: { value } = {} }) => setSelectedStepGroup(value)}
      >
        {stepGroups.map((_, index) => (
          <option key={index} value={index + 1}>
            {index + 1}
          </option>
        ))}
        <option value={stepGroups.length + 1}>{stepGroups.length + 1}</option>
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
  stepGroups: PropTypes.array,
  onUpdate: PropTypes.func,
};

export default AddStep;
