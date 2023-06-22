import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText } from 'nr1';

import StepGroup from '../step-group';
import Signal from '../signal';
import StageHeader from './header';
import AddStep from '../add-step';
import { MODES, STATUSES } from '../../constants';

const Stage = ({
  name = 'Stage',
  stepGroups = [],
  related = {},
  status = STATUSES.UNKNOWN,
  mode = MODES.KIOSK,
  onUpdate,
  onDelete,
}) => {
  const [signals, setSignals] = useState({});

  useEffect(
    () =>
      setSignals(
        stepGroups.reduce(
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
    [stepGroups]
  );

  const SignalsList = memo(
    () =>
      Object.keys(signals).map((key, i) => {
        const { name, status } = signals[key];
        return <Signal key={i} name={name} status={status} />;
      }),
    [signals]
  );
  SignalsList.displayName = 'SignalsList';

  const updateStageHandler = (updates = {}) =>
    onUpdate({ name, stepGroups, related, ...updates });

  return (
    <div className="stage">
      <StageHeader
        name={name}
        related={related}
        status={status}
        onUpdate={updateStageHandler}
        onDelete={onDelete}
        mode={mode}
      />
      <div className="body">
        <div className="section-title">
          <HeadingText>Steps</HeadingText>
          {mode === MODES.EDIT ? (
            <AddStep stepGroups={stepGroups} onUpdate={updateStageHandler} />
          ) : null}
        </div>
        <div className="step-groups">
          {stepGroups.map(({ steps, status }, i) => (
            <StepGroup
              key={i}
              order={i + 1}
              steps={steps}
              status={status}
              mode={mode}
            />
          ))}
        </div>
        {mode === MODES.KIOSK ? (
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
  stepGroups: PropTypes.arrayOf(PropTypes.object),
  related: PropTypes.shape({
    target: PropTypes.bool,
    source: PropTypes.bool,
  }),
  status: PropTypes.oneOf(Object.values(STATUSES)),
  mode: PropTypes.oneOf(Object.values(MODES)),
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default Stage;
