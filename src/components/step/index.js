import React, { memo } from 'react';
import PropTypes from 'prop-types';

import { StatusIconsLayout } from '@newrelic/nr-labs-components';

import Signal from '../signal';
import StepHeader from './header';
import { MODES, STATUSES } from '../../constants';

const Step = ({
  title = 'Step',
  signals = [],
  onUpdate,
  onDelete,
  status = STATUSES.UNKNOWN,
  mode = MODES.KIOSK,
}) => {
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
      signals.map(({ name, status }, i) => (
        <Signal key={i} name={name} status={status} />
      )),
    [signals]
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
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  status: PropTypes.oneOf(Object.values(STATUSES)),
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Step;
