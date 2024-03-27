import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from 'nr1';

import IconsLib from '../icons-lib';
import { SelectionsContext } from '../../contexts';
import { COMPONENTS, SIGNAL_TYPES, UI_CONTENT } from '../../constants';

const renderSignalIcon = (
  {
    style,
    name = UI_CONTENT.SIGNAL.DEFAULT_NAME,
    type,
    status,
    isFaded = false,
    ...statusProps
  },
  i,
  onClick
) => (
  <Tooltip text={name}>
    <IconsLib
      key={i}
      className={`${status} ${isFaded ? ' faded' : ''}`}
      type={type}
      shouldShowTitle={false}
      {...statusProps}
      style={style}
      onClick={onClick}
    />
  </Tooltip>
);

const SignalsGridLayout = ({ statuses }) => {
  const [grid, setGrid] = useState({ entities: [], alerts: [] });
  const [width, setWidth] = useState(null);
  const { markSelection } = useContext(SelectionsContext);
  const wrapperRef = useRef();

  useEffect(() => {
    if (statuses) {
      setGrid(
        statuses.reduce(
          (acc, signal, index) => {
            const signalIcon = renderSignalIcon(signal, index, (e) => {
              e.stopPropagation();
              markSelection(COMPONENTS.SIGNAL, signal.guid, signal);
            });
            if (signal.type === SIGNAL_TYPES.ENTITY) {
              acc.entities = [...acc.entities, signalIcon];
            }
            if (signal.type === SIGNAL_TYPES.ALERT) {
              acc.alerts = [...acc.alerts, signalIcon];
            }
            return acc;
          },
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
