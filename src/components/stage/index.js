import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText } from 'nr1';

import Level from '../level';
import Signal from '../signal';
import StageHeader from './header';
import AddStep from '../add-step';
import { MODES, STATUSES } from '../../constants';

const Stage = ({
  name = 'Stage',
  levels = [],
  related = {},
  status = STATUSES.UNKNOWN,
  mode = MODES.INLINE,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [signals, setSignals] = useState({});
  const isDragHandleClicked = useRef(false);
  const dragItemIndex = useRef();
  const dragOverItemIndex = useRef();

  useEffect(
    () =>
      setSignals(
        levels.reduce(
          (acc, { steps = [] }) => ({
            ...acc,
            ...steps.reduce(
              (acc, { signals = [] }) => ({
                ...acc,
                ...signals.reduce(
                  (acc, { guid, name, status }) => ({
                    ...acc,
                    [guid]: { name, status },
                  }),
                  {}
                ),
              }),
              {}
            ),
          }),
          {}
        )
      ),
    [levels]
  );

  const SignalsList = memo(
    () =>
      Object.keys(signals).map((guid) => {
        const { name, status } = signals[guid];
        return <Signal key={guid} name={name} status={status} />;
      }),
    [signals]
  );
  SignalsList.displayName = 'SignalsList';

  const updateStageHandler = (updates = {}) => {
    if (onUpdate) onUpdate({ name, levels, related, ...updates });
  };

  const deleteLevelHandler = (index) => {
    if (onUpdate)
      onUpdate({
        name,
        related,
        levels: levels.filter((_, i) => i !== index),
      });
  };

  const updateLevelHandler = (index, updates = {}) =>
    updateStageHandler({
      levels: levels.map((level, i) =>
        i === index ? { ...level, ...updates } : level
      ),
    });

  const dragHandleHandler = (b) => (isDragHandleClicked.current = b);

  const dragStartHandler = (e) => {
    if (isDragHandleClicked.current) {
      if (onDragStart) onDragStart(e);
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onDropHandler = (e) => {
    if (onDrop) onDrop(e);
    isDragHandleClicked.current = false;
  };

  const dragEndHandler = () => {
    isDragHandleClicked.current = false;
  };

  const levelDragStartHandler = (e, index) => {
    e.stopPropagation();
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const levelDragOverHandler = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    dragOverItemIndex.current = index;
  };

  const levelDropHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const itemIndex = dragItemIndex.current;
    const overIndex = dragOverItemIndex.current;
    if (
      !Number.isInteger(itemIndex) ||
      !Number.isInteger(overIndex) ||
      itemIndex === overIndex
    )
      return;
    const updatedLevels = [...levels];
    const item = updatedLevels[itemIndex];
    updatedLevels.splice(itemIndex, 1);
    updatedLevels.splice(overIndex, 0, item);
    if (onUpdate) onUpdate({ name, related, levels: updatedLevels });
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  return (
    <div
      className="stage"
      draggable={mode === MODES.EDIT}
      onDragStart={dragStartHandler}
      onDragOver={onDragOver}
      onDrop={onDropHandler}
      onDragEnd={dragEndHandler}
    >
      <StageHeader
        name={name}
        related={related}
        status={status}
        onUpdate={updateStageHandler}
        onDelete={onDelete}
        mode={mode}
        onDragHandle={dragHandleHandler}
      />
      <div className="body">
        <div className="section-title">
          <HeadingText>Steps</HeadingText>
          {mode === MODES.EDIT ? (
            <AddStep levels={levels} onUpdate={updateStageHandler} />
          ) : null}
        </div>
        <div className="step-groups">
          {levels.map(({ id, steps, status }, index) => (
            <Level
              key={id}
              order={index + 1}
              steps={steps}
              stageName={name}
              onUpdate={(updates) => updateLevelHandler(index, updates)}
              onDelete={() => deleteLevelHandler(index)}
              onDragStart={(e) => levelDragStartHandler(e, index)}
              onDragOver={(e) => levelDragOverHandler(e, index)}
              onDrop={(e) => levelDropHandler(e)}
              status={status}
              mode={mode}
            />
          ))}
        </div>
        {mode === MODES.INLINE ? (
          <>
            <div className="section-title">
              <HeadingText className="title">Signals</HeadingText>
            </div>
            <div className="signals-listing">
              <SignalsList />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

Stage.propTypes = {
  name: PropTypes.string,
  levels: PropTypes.arrayOf(PropTypes.object),
  related: PropTypes.shape({
    target: PropTypes.bool,
    source: PropTypes.bool,
  }),
  status: PropTypes.oneOf(Object.values(STATUSES)),
  mode: PropTypes.oneOf(Object.values(MODES)),
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
};

export default Stage;
