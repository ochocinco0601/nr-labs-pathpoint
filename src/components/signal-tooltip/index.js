import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
  HeadingText,
  NerdGraphQuery,
  NrqlQuery,
  Popover,
  PopoverBody,
  PopoverTrigger,
} from 'nr1';

import { latestStatusForAlertConditions, statusFromGuid } from '../../queries';
import { ALERT_SEVERITY, UI_CONTENT, SIGNAL_TYPES } from '../../constants';

const SignalToolTip = ({ entityGuid, signalType, triggerElement }) => {
  const [data, setData] = useState(null);
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    const fetchAndSetSignalData = async (entityGuid) => {
      const query = statusFromGuid(entityGuid);

      const resp = await NerdGraphQuery.query({ query });
      if (resp.error) {
        console.error(`Error fetching entity: `, resp.error);
        return;
      }
      setData(resp.data?.actor?.entity);
    };

    const fetchAndSetAlertData = async () => {
      const guidDetail = atob(`${entityGuid}`).split('|');
      const query = latestStatusForAlertConditions([`${guidDetail[3]}`]);
      const resp = await NrqlQuery.query({
        query,
        accountIds: [parseInt(guidDetail[0])],
      });

      if (resp.error) {
        console.error(`Error fetching alert condition: `, resp.error);
        return;
      }

      if (resp.data.length > 0) {
        setAlertData(resp.data[0]?.data);
      }
    };

    if (entityGuid) {
      fetchAndSetSignalData(entityGuid);
    }
    if (signalType == SIGNAL_TYPES.ALERT) {
      fetchAndSetAlertData();
    }
  }, [entityGuid, signalType]);

  const renderStatus = useMemo(() => {
    if (signalType === SIGNAL_TYPES.ENTITY && data) {
      if (data.type === 'WORKLOAD') {
        if (data.alertSeverity === ALERT_SEVERITY.NOT_CONFIGURED) {
          return UI_CONTENT.SIGNAL.TOOLTIP.WORKLOAD_UNKNOWN;
        }

        if (
          data.alertSeverity === ALERT_SEVERITY.CRITICAL ||
          data.alertSeverity === ALERT_SEVERITY.WARNING
        ) {
          return UI_CONTENT.SIGNAL.TOOLTIP.WORKLOAD_DISRUPTED;
        }

        return UI_CONTENT.SIGNAL.TOOLTIP.WORKLOAD_OPERATIONAL;
      }

      if (data.alertSeverity == ALERT_SEVERITY.NOT_CONFIGURED) {
        return UI_CONTENT.SIGNAL.TOOLTIP.SIGNAL_UNKNOWN;
      }

      if (data.recentAlertViolations.length > 0) {
        let openOnlyViolations = data.recentAlertViolations.filter(
          (a) => a.closedAt == null
        );
        if (openOnlyViolations.length > 0) {
          return `${openOnlyViolations.length} ${UI_CONTENT.SIGNAL.TOOLTIP.SIGNAL_DISRUPTED}`;
        }
      }

      return UI_CONTENT.SIGNAL.TOOLTIP.DEFAULT;
    } else {
      if (alertData && alertData.length > 0) {
        return `${alertData.length} ${UI_CONTENT.SIGNAL.TOOLTIP.SIGNAL_DISRUPTED}`;
      }

      return UI_CONTENT.SIGNAL.TOOLTIP.DEFAULT;
    }
  }, [data, alertData]);

  return (
    <Popover openOnHover>
      <PopoverTrigger>{triggerElement}</PopoverTrigger>
      <PopoverBody>
        {data === null ? (
          ''
        ) : (
          <div className="EntityTooltip">
            <div className="EntityTooltipHeader">
              <div className="EntityTooltipHeader-titleBar">
                <HeadingText
                  tagType={HeadingText.TAG_TYPE.H4}
                  type={HeadingText.TYPE.HEADING_4}
                  className="EntityTooltipHeader-title"
                >
                  {data.name.length > 35
                    ? `${data.name.substring(0, 35)}...`
                    : data.name}
                </HeadingText>
              </div>
              <p className="EntityTypeAndAccountLabel">
                <span className="EntityTypeAndAccountLabel-type">
                  {data.type
                    .toLowerCase()
                    .split(/[\s_]+/)
                    .map((w, i) => {
                      if (i === 0)
                        return w.charAt(0).toUpperCase() + w.slice(1);
                      return w.charAt(0).toUpperCase() + w.slice(1);
                    })
                    .join(' ')}
                </span>
                <span className="EntityTypeAndAccountLabel-account">
                  {data.account.name}
                </span>
              </p>
            </div>
            <div className="EntityTooltipContent">{renderStatus}</div>
          </div>
        )}
      </PopoverBody>
    </Popover>
  );
};

SignalToolTip.propTypes = {
  entityGuid: PropTypes.string,
  signalType: PropTypes.string,
  triggerElement: PropTypes.element,
};

export default SignalToolTip;
