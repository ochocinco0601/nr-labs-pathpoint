import React from 'react';
import PropTypes from 'prop-types';

import Signal from '../signal';

const SignalsList = ({ signals = [] }) => {
  return (
    <div className="signals-list">
      {signals.map((signal, i) => (
        <Signal key={i} {...signal} />
      ))}
    </div>
  );
};

SignalsList.propTypes = {
  signals: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      name: PropTypes.string,
      attainment: PropTypes.number, // for type === service_level
      target: PropTypes.number, // for type === service_level
    })
  ),
};

export default SignalsList;
