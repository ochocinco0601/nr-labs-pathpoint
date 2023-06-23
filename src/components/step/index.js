import React, { memo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, Icon } from 'nr1';
import { StatusIconsLayout } from '@newrelic/nr-labs-components';

import Signal from '../signal';
import StepHeader from './header';
import DeleteConfirmModal from '../delete-confirm-modal';
import { MODES, STATUSES } from '../../constants';
import EditStepModal from '../edit-step-modal';

const Step = ({
  title = 'Step',
  signals = [],
  stageName,
  stepGroup,
  onUpdate,
  onDelete,
  status = STATUSES.UNKNOWN,
  mode = MODES.KIOSK,
}) => {
  const [editModalHidden, setEditModalHidden] = useState(true);
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);
  const signalToDelete = useRef({});

  const addSignalsHandler = (guids) => {
    if (onUpdate)
      onUpdate({
        signals: [
          ...signals,
          ...guids.map((guid) => ({
            guid,
            type: 'service_level',
          })),
        ],
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
      signals.map(({ name, status }, i) =>
        mode === MODES.EDIT ? (
          <div className="signal-edit-row" key={i}>
            <Signal name={name} />
            <span
              className="delete-btn"
              onClick={() => openDeleteModalHandler(i, name)}
            >
              <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__CLOSE} />
            </span>
          </div>
        ) : (
          <Signal key={i} name={name} status={status} />
        )
      ),
    [signals, mode]
  );
  SignalsList.displayName = 'SignalsList';

  return (
    <div className={`step ${status}`}>
      <StepHeader
        title={title}
        onUpdate={onUpdate}
        onDelete={onDelete}
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
            stepGroup={stepGroup}
            stepTitle={title}
            existingSignals={signals}
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
        {mode === MODES.KIOSK ? <SignalsGrid /> : null}
        {mode === MODES.LIST ? <SignalsList /> : null}
      </div>
    </div>
  );
};

Step.propTypes = {
  title: PropTypes.string,
  signals: PropTypes.arrayOf(PropTypes.object),
  stageName: PropTypes.string,
  stepGroup: PropTypes.string,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  status: PropTypes.oneOf(Object.values(STATUSES)),
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Step;
