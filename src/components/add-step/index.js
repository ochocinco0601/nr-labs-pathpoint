import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'nr1';

const AddStep = ({ levels = [], onUpdate }) => {
  const [displayStepOptions, setDisplayStepOptions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(levels.length + 1);
  const [stepTitle, setStepTitle] = useState('');

  const addStepHandler = () => {
    const updatedLevels =
      selectedLevel > levels.length
        ? [...levels, { steps: [{ signals: [], title: stepTitle }] }]
        : levels.map((level, index) =>
            index === selectedLevel - 1
              ? {
                  ...level,
                  steps: [...level.steps, { signals: [], title: stepTitle }],
                }
              : level
          );
    if (onUpdate) onUpdate({ levels: updatedLevels });
    cancelAddStepHandler();
  };

  const cancelAddStepHandler = useCallback(() => {
    setSelectedLevel(levels.length + 1);
    setStepTitle('');
    setDisplayStepOptions(false);
  }, [levels]);

  return displayStepOptions ? (
    <div className="add-step">
      <select
        value={selectedLevel}
        onChange={({ target: { value } = {} }) => setSelectedLevel(value)}
      >
        {levels.map((_, index) => (
          <option key={index} value={index + 1}>
            {index + 1}
          </option>
        ))}
        <option value={levels.length + 1}>{levels.length + 1}</option>
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
  levels: PropTypes.array,
  onUpdate: PropTypes.func,
};

export default AddStep;
