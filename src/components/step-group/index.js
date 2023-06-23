import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

import Step from '../step';
import IconsLib from '../icons-lib';
import DeleteConfirmModal from '../delete-confirm-modal';
import { MODES, STATUSES } from '../../constants';

const StepGroup = ({
  order = 0,
  steps = [],
  onDelete,
  status = STATUSES.UNKNOWN,
  mode = MODES.KIOSK,
}) => {
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);

  const deleteHandler = useCallback(() => {
    if (onDelete) onDelete();
    setDeleteModalHidden(true);
  }, []);

  return (
    <div className="step-group">
      {mode === MODES.EDIT ? (
        <>
          <div className={`order edit ${status}`}>
            {order}
            <span className="drag-handle">
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
            <Step title={title} signals={signals} status={status} mode={mode} />
          </div>
        ))}
      </div>
    </div>
  );
};

StepGroup.propTypes = {
  order: PropTypes.number,
  steps: PropTypes.arrayOf(PropTypes.object),
  onDelete: PropTypes.func,
  status: PropTypes.oneOf(Object.values(STATUSES)),
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default StepGroup;
