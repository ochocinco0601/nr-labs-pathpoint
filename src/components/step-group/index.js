import React from 'react';
import PropTypes from 'prop-types';

import Step from '../step';
import { MODES, STATUSES } from '../../constants';

const StepGroup = ({
  order = 0,
  steps = [],
  status = STATUSES.UNKNOWN,
  mode = MODES.KIOSK,
}) => (
  <div className="step-group">
    <div className={`order ${status}`}>{order}</div>
    <div className="steps">
      {steps.map(({ title, signals = [], status }, index) => (
        <div className="step-cell" key={index}>
          <Step title={title} signals={signals} status={status} mode={mode} />
        </div>
      ))}
    </div>
  </div>
);

StepGroup.propTypes = {
  order: PropTypes.number,
  steps: PropTypes.arrayOf(PropTypes.object),
  status: PropTypes.oneOf(Object.values(STATUSES)),
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default StepGroup;
