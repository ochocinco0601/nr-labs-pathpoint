import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

import Step from '../step';
import IconsLib from '../icons-lib';
import DeleteConfirmModal from '../delete-confirm-modal';
import { MODES, STATUSES } from '../../constants';

const StepGroup = ({
  order = 0,
  steps = [],
  stageName,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  status = STATUSES.UNKNOWN,
  mode = MODES.KIOSK,
}) => {
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);
  const isDragHandleClicked = useRef(false);

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

  return (
    <div
      className="step-group"
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
            name={`Step Group ${order}`}
            type="step group"
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
          >
            <Step
              title={title}
              signals={signals}
              stageName={stageName}
              stepGroup={order}
              onUpdate={(updates) => updateStepHandler(index, updates)}
              onDelete={() => deleteStepHandler(index)}
              status={status}
              mode={mode}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

StepGroup.propTypes = {
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

export default StepGroup;
