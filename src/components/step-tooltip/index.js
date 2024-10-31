import React, { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
  HeadingText,
  Link,
  Modal,
  Popover,
  PopoverBody,
  PopoverTrigger,
} from 'nr1';
import IconsLib from '../icons-lib';
import { SIGNAL_TYPES, STEP_STATUS_UNITS, UI_CONTENT } from '../../constants';

const StepToolTip = memo(
  ({
    stepTitle,
    stepStatus,
    stepStatusOption,
    stepStatusUnit,
    stepStatusValue,
    signals,
    triggerElement,
  }) => {
    const [includedSignals, setIncludedSignals] = useState([]);
    const [viewRuleModalHidden, setViewRuleModalHidden] = useState(true);

    useEffect(() => {
      if (signals.length > 0) {
        setIncludedSignals(() =>
          signals.filter((s) => {
            return s.included === true || s.included === undefined;
          })
        );
      }
    }, [signals]);

    const renderStatus = useMemo(() => {
      if (includedSignals.length === 0)
        return UI_CONTENT.STEP.CONFIG.TOOLTIPS.UNKNOWN;

      let defaultMessage = `${
        stepStatusOption.charAt(0).toUpperCase() + stepStatusOption.slice(1)
      } status of ${includedSignals.length} signals`;

      if (stepStatusValue !== '') {
        const unit = stepStatusUnit === STEP_STATUS_UNITS.PERCENT ? '%' : '';
        const weightAppliedMessage =
          stepStatusUnit === STEP_STATUS_UNITS.PERCENT
            ? `${stepStatusValue}${unit} of `
            : `${stepStatusValue}/`;

        defaultMessage = `${
          stepStatusOption.charAt(0).toUpperCase() + stepStatusOption.slice(1)
        } status - ${weightAppliedMessage}${includedSignals.length} signals`;

        return `${defaultMessage}`;
      }

      return defaultMessage;
    }, [
      stepTitle,
      stepStatusOption,
      stepStatusUnit,
      stepStatusValue,
      includedSignals,
    ]);

    const renderRuleModal = useMemo(() => {
      return (
        <Modal
          hidden={viewRuleModalHidden}
          onClose={() => setViewRuleModalHidden(true)}
        >
          <div className="view-rule-header">
            <span className={`status-indicator-large ${stepStatus}`}></span>
            <HeadingText type={HeadingText.TYPE.HEADING_2}>
              {stepTitle}
            </HeadingText>
          </div>
          <div className="view-rule-content">
            <HeadingText
              className="view-rule-content header"
              type={HeadingText.TYPE.HEADING_4}
            >
              {renderStatus}
            </HeadingText>
            {includedSignals.length > 0
              ? includedSignals.map((s, i) => {
                  return (
                    <div key={i} className="view-rule-content inclusion-list">
                      <p>
                        <IconsLib
                          className={`icons-lib ${s.status}`}
                          type={
                            s.type === SIGNAL_TYPES.ALERT
                              ? IconsLib.TYPES.ALERT
                              : IconsLib.TYPES.ENTITY
                          }
                          shouldShowTitle={false}
                        />
                        <span title={s.name}>{s.name}</span>
                      </p>
                    </div>
                  );
                })
              : ''}
          </div>
        </Modal>
      );
    }, [
      stepTitle,
      stepStatus,
      stepStatusOption,
      stepStatusUnit,
      stepStatusValue,
      includedSignals,
      viewRuleModalHidden,
    ]);

    return (
      <>
        <Popover openOnHover>
          <PopoverTrigger>{triggerElement}</PopoverTrigger>
          <PopoverBody placementType={PopoverBody.PLACEMENT_TYPE.TOP_START}>
            <div className="step-tooltip">
              <div className="step-tooltip-header">
                <span
                  className={`step-tooltip-header-status-indicator ${stepStatus}`}
                ></span>
                <HeadingText
                  type={HeadingText.TYPE.HEADING_4}
                  className="step-tooltip-header-title"
                >
                  {stepTitle}
                </HeadingText>
              </div>
              <div className="step-tooltip-content">
                <span className="step-tooltip-content-overview">
                  {renderStatus}
                </span>
                <Link
                  className="step-tooltip-content-view-rule"
                  onClick={() => setViewRuleModalHidden(false)}
                >
                  {UI_CONTENT.STEP.CONFIG.TOOLTIPS.VIEW_RULE}
                </Link>
              </div>
            </div>
          </PopoverBody>
        </Popover>
        {renderRuleModal}
      </>
    );
  }
);

StepToolTip.propTypes = {
  stepTitle: PropTypes.string,
  stepStatus: PropTypes.string,
  stepStatusOption: PropTypes.string,
  stepStatusUnit: PropTypes.string,
  stepStatusValue: PropTypes.string,
  signals: PropTypes.array,
  triggerElement: PropTypes.element,
};

StepToolTip.displayName = 'StepToolTip';

export default StepToolTip;
