import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { StatusIcon } from '@newrelic/nr-labs-components';
import { SIGNAL_TYPES, signalStatus } from '../../utils';

const Signal = ({ type = '', name, ...params }) => {
  const status = useMemo(
    () => signalStatus({ type, ...params }),
    [type, params]
  );

  return (
    <div className="signal">
      <StatusIcon status={status} />
      <span className="name">{name}</span>
    </div>
  );
};

Signal.propTypes = {
  type: PropTypes.oneOf(Object.values(SIGNAL_TYPES)),
  name: PropTypes.string,
  attainment: PropTypes.number, // for type === service_level
  target: PropTypes.number, // for type === service_level
};

export default Signal;
