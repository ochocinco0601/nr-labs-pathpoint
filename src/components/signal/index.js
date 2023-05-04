import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { StatusIcon } from '@newrelic/nr-labs-components';
import { signalStatus } from '../../utils';

const Signal = ({ name, attainment, target }) => {
  const status = useMemo(
    () => signalStatus({ attainment, target }),
    [attainment, target]
  );

  return (
    <div className="signal">
      <StatusIcon status={status} />
      <span className="name">{name}</span>
    </div>
  );
};

Signal.propTypes = {
  name: PropTypes.string,
  attainment: PropTypes.number,
  target: PropTypes.number,
};

export default Signal;
