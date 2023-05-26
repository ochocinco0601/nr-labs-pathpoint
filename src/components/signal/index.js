import React from 'react';
import PropTypes from 'prop-types';

import { StatusIcon } from '@newrelic/nr-labs-components';
import { STATUSES } from '../../constants';

const Signal = ({ name, status = STATUSES.UNKNOWN }) => (
  <div className="signal">
    <div className="status">
      <StatusIcon status={status} />
    </div>
    <span className="name">{name}</span>
  </div>
);

Signal.propTypes = {
  name: PropTypes.string,
  status: PropTypes.oneOf(Object.values(STATUSES)),
};

export default Signal;
