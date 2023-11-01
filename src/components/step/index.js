import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'nr1';
import { StatusIconsLayout } from '@newrelic/nr-labs-components';

import Signal from '../signal';
import StepHeader from './header';
import EditStepModal from '../edit-step-modal';
import DeleteConfirmModal from '../delete-confirm-modal';
import { MODES, STATUSES } from '../../constants';
import { StagesContext } from '../../contexts';

const Step = ({
  stageId,
  levelId,
  levelOrder,
  stepId,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  mode = MODES.INLINE,
}) => {
  const stages = useContext(StagesContext);
  const [title, setTitle] = useState('Step');
  const [signals, setSignals] = useState([]);
  const [status, setStatus] = useState(STATUSES.UNKNOWN);
  const [stageName, setStageName] = useState('');
  const [editModalHidden, setEditModalHidden] = useState(true);
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);
  const signalToDelete = useRef({});
  const isDragHandleClicked = useRef(false);

  useEffect(() => {
    const { name, levels = [] } =
      (stages?.withStatuses || []).find(({ id }) => id === stageId) || {};
    const { steps = [] } = levels.find(({ id }) => id === levelId) || {};
    const {
      signals: stepSignals,
      status: stepStatus,
      title: stepTitle,
    } = steps.find(({ id }) => id === stepId) || {};
    setStageName(name);
    setTitle(stepTitle);
    setSignals(stepSignals);
    setStatus(stepStatus);
  }, [stageId, levelId, stepId, stages]);

  const addSignalsHandler = (guids) => {
    if (onUpdate)
      onUpdate({
        signals: guids.map((guid) => ({
          guid,
          type: 'service_level',
        })),
      });
  };

  const openDeleteModalHandler = (index, name) => {
    signalToDelete.current = { index, name };
    setDeleteModalHidden(false);
  };

  const deleteSignalHandler = () => {
    if (onUpdate) {
      const { index } = signalToDelete.current;
      onUpdate({
        signals: signals.filter((_, i) => i !== index),
      });
      signalToDelete.current = {};
    }
  };

  const closeDeleteModalHandler = () => {
    signalToDelete.current = {};
    setDeleteModalHidden(true);
  };

  const dragHandleHandler = (b) => (isDragHandleClicked.current = b);

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

  const SignalsGrid = memo(
    () => (
      <StatusIconsLayout
        statuses={signals.map(({ status = STATUSES.UNKNOWN } = {}) => ({
          status,
        }))}
      />
    ),
    [signals]
  );
  SignalsGrid.displayName = 'SignalsGrid';

  const SignalsList = memo(
    () =>
      signals.map(({ guid, name, status }, i) => (
        <Signal
          key={guid}
          name={name}
          onDelete={() => openDeleteModalHandler(i, name)}
          status={status}
          mode={mode}
        />
      )),
    [signals, mode]
  );
  SignalsList.displayName = 'SignalsList';

  return (
    <div
      className={`step ${status}`}
      draggable={mode === MODES.EDIT}
      onDragStart={dragStartHandler}
      onDragOver={onDragOver}
      onDrop={onDropHandler}
      onDragEnd={dragEndHandler}
    >
      <StepHeader
        title={title}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDragHandle={dragHandleHandler}
        mode={mode}
      />
      {mode === MODES.EDIT ? (
        <>
          <div className="add-signal-btn">
            <Button
              type={Button.TYPE.SECONDARY}
              sizeType={Button.SIZE_TYPE.SMALL}
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS__V_ALTERNATE}
              onClick={() => setEditModalHidden(false)}
            >
              Add a signal
            </Button>
          </div>
          <div className="edit-signals-list">
            <SignalsList />
          </div>
          <EditStepModal
            stageName={stageName}
            level={levelOrder}
            stepTitle={title}
            existingSignals={signals.map(({ guid }) => guid)}
            hidden={editModalHidden}
            onChange={addSignalsHandler}
            onClose={() => setEditModalHidden(true)}
          />
          <DeleteConfirmModal
            name={signalToDelete.current.name}
            hidden={deleteModalHidden}
            onConfirm={deleteSignalHandler}
            onClose={closeDeleteModalHandler}
          />
        </>
      ) : null}
      <div className="signals">
        {mode === MODES.INLINE ? <SignalsGrid /> : null}
        {mode === MODES.STACKED ? <SignalsList /> : null}
      </div>
    </div>
  );
};

Step.propTypes = {
  stageId: PropTypes.string,
  levelId: PropTypes.string,
  levelOrder: PropTypes.string,
  stepId: PropTypes.string,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Step;
