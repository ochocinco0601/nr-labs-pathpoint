import React from 'react';
import PropTypes from 'prop-types';

import Signal from '../signal';

const SignalsList = ({ signals = [] }) => {
  return (
    <div className="signals-list">
      {signals.map(({ name, attainment, target }, i) => (
        <Signal key={i} name={name} attainment={attainment} target={target} />
      ))}
    </div>
  );
};

SignalsList.propTypes = {
  signals: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      attainment: PropTypes.number,
      target: PropTypes.number,
    })
  ),
};

export default SignalsList;
