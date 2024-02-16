import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { FlowList } from '../../src/components';
import Callout from './callout';

const FlowListSteps = ({
  flows = [],
  content,
  nextHandler,
  dismissHandler,
}) => {
  const [overlayStyle, setOverlayStyle] = useState({});
  const [calloutStyle, setCalloutStyle] = useState({});
  const flowListRef = useRef();
  const calloutRef = useRef();

  useEffect(() => {
    setOverlayStyle({ left: 0, top: 0, width: '100%', height: '100%' });
    setCalloutStyle({
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -100%)',
    });
  }, []);

  return (
    <div className="product-tour">
      <FlowList flows={flows} onClick={null} ref={flowListRef} />
      <div className="focused-overlay" style={overlayStyle}></div>
      <Callout
        content={content}
        nextHandler={nextHandler}
        dismissHandler={dismissHandler}
        style={calloutStyle}
        ref={calloutRef}
      />
    </div>
  );
};

FlowListSteps.propTypes = {
  flows: PropTypes.array,
  content: PropTypes.object,
  nextHandler: PropTypes.func,
  dismissHandler: PropTypes.func,
};

export default FlowListSteps;
