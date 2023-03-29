import React from 'react';
import PropTypes from 'prop-types';

import { icons, TYPES } from './icons';

const IconsLib = ({ type, style = {}, className = '' }) => {
  return (
    <span className="icons-lib-wrapper">
      <svg
        className={`icons-lib ${className}`}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        role="img"
        style={style}
      >
        <title>{`${type} icon`}</title>
        {icons[type]}
      </svg>
    </span>
  );
};

IconsLib.TYPES = TYPES;

IconsLib.propTypes = {
  type: PropTypes.oneOf(Object.keys(TYPES)),
  style: PropTypes.object,
  className: PropTypes.string,
};

export default IconsLib;
