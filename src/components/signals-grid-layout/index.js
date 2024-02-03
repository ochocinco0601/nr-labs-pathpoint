import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import IconsLib from '../icons-lib';
import { SIGNAL_TYPES } from '../../constants';

const SignalsGridLayout = ({ statuses }) => {
  const [entityGrid, setEntityGrid] = useState(null);
  const [alertGrid, setAlertGrid] = useState(null);
  const [width, setWidth] = useState(null);
  const wrapperRef = useRef();

  useEffect(() => {
    if (statuses) {
      setEntityGrid(
        statuses
          .filter((s) => s.type === SIGNAL_TYPES.ENTITY)
          .map(({ style, type, status, ...statusProps }, i) => (
            <IconsLib
              key={i}
              className={status}
              type={type}
              {...statusProps}
              style={{ style, margin: 1, marginBottom: -3 }}
            />
          ))
      );
      setAlertGrid(
        statuses
          .filter((s) => s.type === SIGNAL_TYPES.ALERT)
          .map(({ style, type, status, ...statusProps }, i) => (
            <IconsLib
              key={i}
              className={status}
              type={type}
              {...statusProps}
              style={{ style, margin: 1, marginBottom: -3 }}
            />
          ))
      );
    }
  }, [statuses]);

  useLayoutEffect(() => {
    const { width } = wrapperRef.current.getBoundingClientRect();
    setWidth(width);
  }, []);

  return (
    <>
      <div className="icons-grid-wrapper" ref={wrapperRef}>
        <div className="icons-grid-container" style={{ width }}>
          {width && entityGrid.length ? entityGrid : null}
        </div>
      </div>
      <div className="icons-grid-wrapper" ref={wrapperRef}>
        <div className="icons-grid-container" style={{ width }}>
          {width && alertGrid?.length ? alertGrid : null}
        </div>
      </div>
    </>
  );
};

SignalsGridLayout.propTypes = {
  statuses: PropTypes.array,
};

export default SignalsGridLayout;
