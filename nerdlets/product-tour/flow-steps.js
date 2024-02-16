import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Flow } from '../../src/components';
import Callout from './callout';

const calloutStyler = ({ top = 0, left = 0, tx = 0, ty = 0 }) => ({
  top,
  left,
  transform: `translate(${tx}, ${ty})`,
});

const spotlightElement = (el, shouldCoverCanvas = false) => {
  const rect = el?.getBoundingClientRect?.() || {};
  const { left = 0, top = 0 } = rect;
  const { width = 0, height = 0 } = shouldCoverCanvas ? {} : rect;
  return { left, top, width, height };
};

const FlowSteps = ({
  step,
  flow = {},
  accountId,
  mode,
  setMode,
  content,
  nextHandler,
  backHandler,
  ctaHandler,
  dismissHandler,
}) => {
  const [calloutStyle, setCalloutStyle] = useState({});
  const flowRef = useRef();
  const calloutRef = useRef();

  useEffect(() => {
    if (step === 2 || step === 8) {
      setCalloutStyle(
        calloutStyler({ top: '50%', left: '50%', tx: '-50%', ty: '-50%' })
      );
    } else {
      const { left = 0, top = 0, width = 0, height = 0 } = overlayStyle || {};
      if (width && height) {
        const { height: calloutHeight = 0 } =
          calloutRef?.current?.getBoundingClientRect?.() || {};
        if (step === 3) {
          setCalloutStyle(
            calloutStyler({
              top: '50%',
              tx: `${left + width + 10}px`,
              ty: '-50%',
            })
          );
        } else if (step === 4 || step === 5) {
          setCalloutStyle(
            calloutStyler({ ty: `${top - calloutHeight - 10}px` })
          );
        } else if (step === 6) {
          setCalloutStyle(
            calloutStyler({
              tx: `${left + width + 10}px`,
              ty: `${top - calloutHeight / 2}px`,
            })
          );
        } else if (step === 7) {
          setCalloutStyle(
            calloutStyler({
              left: '50%',
              tx: '-50%',
              ty: `${top - calloutHeight - 10}px`,
            })
          );
        }
      }
    }
  }, [step, overlayStyle]);

  const flowDoc = useMemo(
    () => ({
      ...flow,
      kpis: flow.kpis.map((kpi) => ({ ...kpi, accountIds: [accountId] })),
      stages: flow.stages.map((stage) => ({
        ...stage,
        levels: stage.levels.map((level) => ({
          ...level,
          steps: level.steps.map((step) => ({
            ...step,
            signals: step.signals.map((signal) => ({
              ...signal,
              guid: btoa(
                `${accountId}|${atob(signal.guid)
                  .split('|')
                  .filter((_, idx) => idx)
                  .join('|')}`
              ),
            })),
          })),
        })),
      })),
    }),
    [flow, accountId]
  );

  const overlayStyle = (() => {
    if (step === 2) {
      return { left: 0, top: 0, width: '100%', height: '100%' };
    } else if (step === 3) {
      return spotlightElement(
        flowRef?.current?.querySelector('.stages')?.children?.[0]
      );
    } else if (step === 4) {
      return spotlightElement(
        flowRef?.current
          ?.querySelector('.stages')
          ?.children?.[0]?.querySelector('.step-groups')?.children?.[0]
      );
    } else if (step === 5) {
      return spotlightElement(
        flowRef?.current
          ?.querySelector('.stages')
          ?.children?.[0]?.querySelector('.step-groups')
          ?.children?.[0]?.querySelector('.steps')?.children?.[0]
      );
    } else if (step === 6) {
      return spotlightElement(
        flowRef?.current
          ?.querySelector('.stages')
          ?.children?.[0]?.querySelector('.signals')
          ?.children?.[0]?.querySelector('.icons-grid-container')?.children?.[0]
      );
    } else if (step === 7) {
      return spotlightElement(flowRef?.current?.querySelector('.kpi-bar'));
    } else if (step === 8) {
      return spotlightElement(flowRef?.current, true);
    }
    return {};
  })();

  return (
    <div className="product-tour">
      <Flow
        flowDoc={flowDoc}
        onUpdate={null}
        onClose={null}
        accountId={accountId}
        mode={mode}
        setMode={setMode}
        prevNonEditMode={mode}
        flows={[]}
        onSelectFlow={null}
        onTransition={null}
        isAuditLogShown={false}
        onAuditLogClose={null}
        editFlowSettings={false}
        setEditFlowSettings={null}
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
