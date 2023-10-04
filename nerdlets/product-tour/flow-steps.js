import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Flow } from '../../src/components';
import Callout from './callout';

const FlowSteps = ({
  step,
  flow = {},
  accountId,
  mode,
  setMode,
  user,
  content,
  nextHandler,
  backHandler,
  ctaHandler,
  dismissHandler,
}) => {
  const [overlayStyle, setOverlayStyle] = useState({});
  const [calloutStyle, setCalloutStyle] = useState({});
  const flowRef = useRef();
  const calloutRef = useRef();

  useEffect(() => {
    console.log('flowRef', flowRef);
    if (step === 2) {
      setOverlayStyle({ left: 0, top: 0, width: '100%', height: '100%' });
      setCalloutStyle({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
    } else if (step === 3) {
      const {
        left = 0,
        top = 0,
        width = 0,
        height = 0,
      } = flowRef?.current
        ?.querySelector('.stages')
        ?.children?.[0]?.getBoundingClientRect?.() || {};
      setOverlayStyle((os) => {
        if (
          os.left === left &&
          os.top === top &&
          os.width === width &&
          os.height === height
        )
          return os;
        return { ...os, left, top, width, height };
      });
      setCalloutStyle({
        top: '50%',
        left: 0,
        transform: `translate(${left + width + 10}px, -50%)`,
      });
    } else if (step === 4) {
      const {
        left = 0,
        top = 0,
        width = 0,
        height = 0,
      } = flowRef?.current
        ?.querySelector('.stages')
        ?.children?.[0]?.querySelector('.step-groups')
        ?.children?.[0]?.getBoundingClientRect?.() || {};
      setOverlayStyle((os) => {
        if (
          os.left === left &&
          os.top === top &&
          os.width === width &&
          os.height === height
        )
          return os;
        return { ...os, left, top, width, height };
      });
    } else if (step === 5) {
      const {
        left = 0,
        top = 0,
        width = 0,
        height = 0,
      } = flowRef?.current
        ?.querySelector('.stages')
        ?.children?.[0]?.querySelector('.step-groups')
        ?.children?.[0]?.querySelector('.steps')
        ?.children?.[0]?.getBoundingClientRect?.() || {};
      setOverlayStyle((os) => {
        if (
          os.left === left &&
          os.top === top &&
          os.width === width &&
          os.height === height
        )
          return os;
        return { ...os, left, top, width, height };
      });
    } else if (step === 6) {
      const {
        left = 0,
        top = 0,
        width = 0,
        height = 0,
      } = flowRef?.current
        ?.querySelector('.stages')
        ?.children?.[0]?.querySelector('.signals-listing')
        ?.children?.[0]?.getBoundingClientRect?.() || {};
      setOverlayStyle((os) => {
        if (
          os.left === left &&
          os.top === top &&
          os.width === width &&
          os.height === height
        )
          return os;
        return { ...os, left, top, width, height };
      });
    } else if (step === 7) {
      const {
        left = 0,
        top = 0,
        width = 0,
        height = 0,
      } = flowRef?.current
        ?.querySelector('.kpi-bar')
        ?.getBoundingClientRect?.() || {};
      setOverlayStyle((os) => {
        if (
          os.left === left &&
          os.top === top &&
          os.width === width &&
          os.height === height
        )
          return os;
        return { ...os, left, top, width, height };
      });
    } else if (step === 8) {
      const {
        left = 0,
        top = 0,
        width = 0,
        height = 0,
      } = flowRef?.current?.getBoundingClientRect?.() || {};
      setOverlayStyle((os) => {
        if (
          os.left === left &&
          os.top === top &&
          os.width === width &&
          os.height === height
        )
          return os;
        return { ...os, left, top, width, height };
      });
    }
  }, [step]);

  useEffect(() => {
    const { left = 0, top = 0, width = 0, height = 0 } = overlayStyle || {};
    if (width && height) {
      const { width: calloutWidth = 0, height: calloutHeight = 0 } =
        calloutRef?.current?.getBoundingClientRect?.() || {};
      if (step === 4 || step === 5) {
        setCalloutStyle({
          top: 0,
          left: 0,
          transform: `translate(0, ${top - calloutHeight - 10}px)`,
        });
      } else if (step === 6) {
        setCalloutStyle({
          top: 0,
          left: 0,
          transform: `translate(${left + width + 10}px, ${
            top - calloutHeight / 2
          }px)`,
        });
      } else if (step === 7) {
        setCalloutStyle({
          top: 0,
          left: '50%',
          transform: `translate(-50%, ${top - calloutHeight - 10}px)`,
        });
      } else if (step === 8) {
        setCalloutStyle({
          top: 0,
          left: 0,
          transform: `translate(${width - calloutWidth}px, 10px)`,
        });
      }
    }
  }, [step, overlayStyle]);

  return (
    <div className="product-tour">
      <Flow
        flow={flow}
        onUpdate={null}
        onClose={null}
        accountId={accountId}
        mode={mode}
        setMode={setMode}
        flows={[]}
        onSelectFlow={null}
        user={user}
        ref={flowRef}
      />
      <div className="focused-overlay" style={overlayStyle}></div>
      <Callout
        content={content}
        nextHandler={step < 8 ? nextHandler : null}
        backHandler={backHandler}
        ctaHandler={step === 8 ? ctaHandler : null}
        dismissHandler={dismissHandler}
        style={calloutStyle}
        ref={calloutRef}
      />
    </div>
  );
};

FlowSteps.propTypes = {
  step: PropTypes.number,
  flow: PropTypes.object,
  accountId: PropTypes.number,
  mode: PropTypes.string,
  setMode: PropTypes.func,
  user: PropTypes.object,
  content: PropTypes.object,
  nextHandler: PropTypes.func,
  backHandler: PropTypes.func,
  ctaHandler: PropTypes.func,
  dismissHandler: PropTypes.func,
};

export default FlowSteps;
