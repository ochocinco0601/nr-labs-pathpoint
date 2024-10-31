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
import { SIGNAL_TYPES, UI_CONTENT } from '../../constants';

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
        const includedSignals = signals.filter((s) => {
          return s.included === true || s.included === undefined;
        });

        setIncludedSignals(includedSignals);
      }
    }, [signals]);

    const renderStatus = useMemo(() => {
      if (includedSignals.length === 0) return 'No signals';

      let defaultMessage = `${
        stepStatusOption.charAt(0).toUpperCase() + stepStatusOption.slice(1)
      } status of ${includedSignals.length} signals`;

      if (stepStatusValue !== '') {
        const unit = stepStatusUnit === 'percent' ? '%' : '';
        const weightAppliedMessage =
          stepStatusUnit === 'percent'
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
            <span className={`statusIndicatorLarge ${stepStatus}`}></span>
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
                    <div key={i} className="view-rule-content inclusionList">
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
            <div className="StepTooltip">
              <div className="StepTooltipHeader">
                <span
                  className={`StepTooltipHeader-statusIndicator ${stepStatus}`}
                ></span>
                <HeadingText
                  type={HeadingText.TYPE.HEADING_4}
                  className="StepTooltipHeader-title"
                >
                  {stepTitle}
                </HeadingText>
              </div>
              <div className="StepTooltipContent">
                <span className="StepTooltipContent-overview">
                  {renderStatus}
                </span>
                <Link
                  className="StepTooltipContent-viewRule"
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
