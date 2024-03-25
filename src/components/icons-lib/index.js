import React from 'react';
import PropTypes from 'prop-types';

import { icons, TYPES } from './icons';

const IconsLib = ({
  type,
  style = {},
  className = '',
  title = '',
  shouldShowTitle = true,
  onClick,
}) => {
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
        onClick={onClick}
      >
        {shouldShowTitle ? <title>{title || `${type} icon`}</title> : null}
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
  title: PropTypes.string,
  shouldShowTitle: PropTypes.bool,
  onClick: PropTypes.func,
};

export default IconsLib;
