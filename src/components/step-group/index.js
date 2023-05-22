import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { MODES } from '../../constants';
import { statusFromStatuses } from '../../utils';
import Step from '../step';

const StepGroup = ({ order = 0, steps = [], mode = MODES.KIOSK }) => {
  const { statuses, elements } = useMemo(
    () =>
      steps.reduce(
        (acc, { title, signals = [] }, index) => ({
          statuses: [...acc.statuses, { status: statusFromStatuses(signals) }],
          elements: [
            ...acc.elements,
            <div className="cell" key={index}>
              <Step title={title} signals={signals} mode={mode} />
            </div>,
          ],
        }),
        { statuses: [], elements: [] }
      ),
    [steps, mode]
  );

  const classFromStatuses = useMemo(
    () => (statuses?.length ? statusFromStatuses(statuses) : ''),
    [statuses]
  );

  return (
    <div className="step-group">
      <div className={`order ${classFromStatuses}`}>{order}</div>
      <div className="steps">{elements}</div>
    </div>
  );
};

StepGroup.propTypes = {
  order: PropTypes.number,
  steps: PropTypes.arrayOf(PropTypes.object),
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default StepGroup;
