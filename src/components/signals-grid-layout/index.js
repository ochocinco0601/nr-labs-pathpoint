import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import IconsLib from '../icons-lib';
import { SIGNAL_TYPES } from '../../constants';

const SignalsGridLayout = ({ statuses }) => {
  const [grid, setGridData] = useState({ entities: [], alerts: [] });
  const [width, setWidth] = useState(null);
  const wrapperRef = useRef();

  useEffect(() => {
    const renderSignalIcon = ({ style, type, status, ...statusProps }, i) => (
      <IconsLib
        key={i}
        className={status}
        type={type}
        {...statusProps}
        style={{ style, margin: 1, marginBottom: -3 }}
      />
    );
    if (statuses) {
      setGridData(
        statuses.reduce(
          (acc, signal, index) => ({
            entities:
              signal.type === SIGNAL_TYPES.ENTITY
                ? [...acc.entities, renderSignalIcon(signal, index)]
                : [...acc.entities],
            alerts:
              signal.type === SIGNAL_TYPES.ALERT
                ? [...acc.alerts, renderSignalIcon(signal, index)]
                : [...acc.alerts],
          }),
          { entities: [], alerts: [] }
        )
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
        {width && grid.entities.length ? (
          <div className="icons-grid-container" style={{ width }}>
            {grid.entities}
          </div>
        ) : (
          ''
        )}
      </div>
      <div className="icons-grid-wrapper" ref={wrapperRef}>
        {width && grid.alerts.length ? (
          <div className="icons-grid-container" style={{ width }}>
            {grid.alerts}
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  );
};

SignalsGridLayout.propTypes = {
  statuses: PropTypes.array,
};

export default SignalsGridLayout;
