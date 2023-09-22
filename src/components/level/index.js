import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

import Step from '../step';
import IconsLib from '../icons-lib';
import DeleteConfirmModal from '../delete-confirm-modal';
import { MODES, STATUSES } from '../../constants';

const Level = ({
  order = 0,
  steps = [],
  stageName,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  status = STATUSES.UNKNOWN,
  mode = MODES.INLINE,
}) => {
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);
  const isDragHandleClicked = useRef(false);
  const dragItemIndex = useRef();
  const dragOverItemIndex = useRef();
  const stepCellsRefs = useRef([]);

  useEffect(() => {
    if (mode === MODES.EDIT) return;
    const stepCells = stepCellsRefs.current;
    const rows = Math.ceil(stepCells.length / 3);
    const lastRowColumns = stepCells.length % 3;
    stepCells.forEach((scr, index) => {
      let col = (index + 1) % 3;
      if (!col) col = 3;
      const row = Math.ceil((index + 1) / 3);
      if (row === 1 && (col === 3 || (rows === 1 && col === lastRowColumns))) {
        scr.classList.add('top-radius');
      }
      if (row < rows) {
        scr.classList.add('bot-thin-border');
      } else if (row === rows) {
        scr.classList.add('top-thin-border');
        if (col === lastRowColumns) {
          scr.classList.add('bot-radius');
          scr.classList.add(`start-col-${col === 1 ? '1' : '2'}`);
          scr.classList.add('last-col');
        }
      }
      if (col === 3) scr.classList.add('last-col');
    });
  }, [mode]);

  const deleteHandler = useCallback(() => {
    if (onDelete) onDelete();
    setDeleteModalHidden(true);
  }, []);

  const updateStepHandler = (index, updates = {}) => {
    if (onUpdate) {
      onUpdate({
        steps: steps.map((step, i) =>
          i === index ? { ...step, ...updates } : step
        ),
      });
    }
  };

  const deleteStepHandler = (index) => {
    if (onUpdate) {
      onUpdate({ steps: steps.filter((_, i) => i !== index) });
    }
  };

  const dragStartHandler = (e) => {
    if (isDragHandleClicked.current) {
      if (onDragStart) onDragStart(e);
    } else {
      e.preventDefault();
    }
  };

  const onDropHandler = (e) => {
    if (onDrop) onDrop(e);
    isDragHandleClicked.current = false;
  };

  const dragEndHandler = () => {
    isDragHandleClicked.current = false;
  };

  const stepDragStartHandler = (e, index) => {
    e.stopPropagation();
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const stepDragOverHandler = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    dragOverItemIndex.current = index;
  };

  const stepDropHandler = (e) => {
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
    const updatedSteps = [...steps];
    const item = updatedSteps[itemIndex];
    updatedSteps.splice(itemIndex, 1);
    updatedSteps.splice(overIndex, 0, item);
    if (onUpdate) onUpdate({ steps: updatedSteps });
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  return (
    <div
      className="level"
      draggable={mode === MODES.EDIT}
      onDragStart={dragStartHandler}
      onDragOver={onDragOver}
      onDrop={onDropHandler}
      onDragEnd={dragEndHandler}
    >
      {mode === MODES.EDIT ? (
        <>
          <div className={`order edit ${STATUSES.UNKNOWN}`}>
            {order}
            <span
              className="drag-handle"
              onMouseDown={() => (isDragHandleClicked.current = true)}
              onMouseUp={() => (isDragHandleClicked.current = false)}
            >
              <IconsLib type={IconsLib.TYPES.HANDLE} />
            </span>
            <span
              className="delete-btn"
              onClick={() => setDeleteModalHidden(false)}
            >
              <Icon
                type={Icon.TYPE.INTERFACE__OPERATIONS__CLOSE__V_ALTERNATE}
              />
            </span>
          </div>
          <DeleteConfirmModal
            name={`Level ${order}`}
            type="level"
            hidden={deleteModalHidden}
            onConfirm={deleteHandler}
            onClose={() => setDeleteModalHidden(true)}
          />
        </>
      ) : (
        <div className={`order ${status}`}>{order}</div>
      )}
      <div className="steps">
        {steps.map(({ title, signals = [], status }, index) => (
          <div
            className={`step-cell ${mode === MODES.EDIT ? 'edit' : ''}`}
            key={index}
            ref={(el) => (stepCellsRefs.current[index] = el)}
          >
            <Step
              title={title}
              signals={signals}
              stageName={stageName}
              level={order}
              onUpdate={(updates) => updateStepHandler(index, updates)}
              onDelete={() => deleteStepHandler(index)}
              onDragStart={(e) => stepDragStartHandler(e, index)}
              onDragOver={(e) => stepDragOverHandler(e, index)}
              onDrop={(e) => stepDropHandler(e)}
              status={status}
              mode={mode}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

Level.propTypes = {
  order: PropTypes.number,
  steps: PropTypes.arrayOf(PropTypes.object),
  stageName: PropTypes.string,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  status: PropTypes.oneOf(Object.values(STATUSES)),
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Level;
