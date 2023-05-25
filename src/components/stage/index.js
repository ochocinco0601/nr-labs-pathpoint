import React, { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText } from 'nr1';

import StepGroup from '../step-group';
import Signal from '../signal';
import { MODES, STATUSES } from '../../constants';

const Stage = ({
  name = 'Stage',
  stepGroups = [],
  status = STATUSES.UNKNOWN,
  related = {},
  mode = MODES.KIOSK,
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

  const shape = useMemo(() => {
    const { target, source } = related;
    if (!target && !source) return '';
    if (target && source) return 'has-target has-source';
    if (target) return 'has-target';
    if (source) return 'has-source';
    return '';
  }, [related]);

  return (
    <div className="stage">
      <div className={`head ${status} ${shape}`}>
        <HeadingText className="name">{name}</HeadingText>
      </div>
      <div className="body">
        <div className="section-title">
          <HeadingText>Steps</HeadingText>
        </div>
        <div className="step-groups">
          {stepGroups.map(({ order, steps, status }, i) => (
            <StepGroup
              key={i}
              order={order}
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
  status: PropTypes.oneOf(Object.values(STATUSES)),
  related: PropTypes.shape({
    target: PropTypes.bool,
    source: PropTypes.bool,
  }),
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Stage;
