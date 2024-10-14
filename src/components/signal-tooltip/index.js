import React, { useEffect, useState } from 'react';
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
import { ALERT_SEVERITY, SIGNAL_TOOLTIP, SIGNAL_TYPES } from '../../constants';

const SignalToolTip = ({ entityGuid, signalType, triggerElement }) => {
  const [data, setData] = useState(null);
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    if (entityGuid) {
      fetchAndSetSignalData(entityGuid);
    }
    if (signalType == SIGNAL_TYPES.ALERT) {
      fetchAndSetAlertData();
    }
  }, [entityGuid]);

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

  const renderEntityStatus = () => {
    if (data.type === 'WORKLOAD') {
      if (data.alertSeverity === ALERT_SEVERITY.NOT_CONFIGURED) {
        return SIGNAL_TOOLTIP.WORKLOAD_UNKNOWN;
      }

      if (
        data.alertSeverity === ALERT_SEVERITY.CRITICAL ||
        data.alertSeverity === ALERT_SEVERITY.WARNING
      ) {
        return SIGNAL_TOOLTIP.WORKLOAD_DISRUPTED;
      }

      return SIGNAL_TOOLTIP.WORKLOAD_OPERATIONAL;
    }

    if (data.alertSeverity == ALERT_SEVERITY.NOT_CONFIGURED) {
      return SIGNAL_TOOLTIP.SIGNAL_UNKNOWN;
    }

    if (data.recentAlertViolations.length > 0) {
      let openOnlyViolations = data.recentAlertViolations.filter(
        (a) => a.closedAt == null
      );
      if (openOnlyViolations.length > 0) {
        return `${openOnlyViolations.length} ${SIGNAL_TOOLTIP.SIGNAL_DISRUPTED}`;
      }
    }

    return SIGNAL_TOOLTIP.DEFAULT;
  };

  const renderAlertStatus = () => {
    if (alertData && alertData.length > 0) {
      return `${alertData.length} ${SIGNAL_TOOLTIP.SIGNAL_DISRUPTED}`;
    }

    return SIGNAL_TOOLTIP.DEFAULT;
  };

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
            <div className="EntityTooltipContent">
              {signalType === SIGNAL_TYPES.ENTITY
                ? renderEntityStatus()
                : renderAlertStatus()}
            </div>
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
