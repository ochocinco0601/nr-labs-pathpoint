import React, { useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Popover, PopoverBody, PopoverTrigger } from 'nr1';

import { AppContext, SignalsContext } from '../../contexts';
import { generateIncidentsList } from '../../utils';
import { ALERT_SEVERITY, UI_CONTENT, SIGNAL_TYPES } from '../../constants';

import typesList from '../../../nerdlets/signal-selection/types.json';

const SignalTooltip = ({ entityGuid, signalType, triggerElement }) => {
  const { accounts } = useContext(AppContext);
  const signalsDetails = useContext(SignalsContext);
  const [data, setData] = useState(null);
  const [sigType, setSigType] = useState('');
  const [acctName, setAcctName] = useState('');

  useEffect(
    () => setData(() => signalsDetails[entityGuid]),
    [entityGuid, signalsDetails]
  );

  useEffect(() => {
    if (!data) return;
    const acctId =
      data.accountId ||
      Number((atob(data.entityGuid || '').split('|') || [])?.[0]);
    setAcctName(
      acctId ? accounts.find(({ id }) => id === acctId)?.name || '' : ''
    );
    setSigType(
      signalType === SIGNAL_TYPES.ALERT
        ? 'Alert condition'
        : typesList.find(
            ({ domain, type }) => domain === data.domain && type === data.type
          )?.displayName || ''
    );
  }, [accounts, data, signalType]);

  const incidentsStatus = useMemo(() => {
    if (!data) return UI_CONTENT.SIGNAL.TOOLTIP.DEFAULT;

    const incidentsList = generateIncidentsList({ type: signalType, data });
    if (signalType === SIGNAL_TYPES.ENTITY) {
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

      if (incidentsList.length) {
        return `${incidentsList.length} ${UI_CONTENT.SIGNAL.TOOLTIP.SIGNAL_DISRUPTED}`;
      }

      return UI_CONTENT.SIGNAL.TOOLTIP.DEFAULT;
    } else {
      if (incidentsList.length) {
        return `${incidentsList.length} ${UI_CONTENT.SIGNAL.TOOLTIP.SIGNAL_DISRUPTED}`;
      }

      return UI_CONTENT.SIGNAL.TOOLTIP.DEFAULT;
    }
  }, [data, signalType]);

  return (
    <Popover openOnHover>
      <PopoverTrigger>{triggerElement}</PopoverTrigger>
      <PopoverBody>
        {data ? (
          <div className="signal-tooltip">
            <div className="signal-tooltip-header">
              <div className="signal-tooltip-title-bar">
                <HeadingText
                  tagType={HeadingText.TAG_TYPE.H4}
                  type={HeadingText.TYPE.HEADING_4}
                  className="title"
                >
                  {data.name.length > 35
                    ? `${data.name.substring(0, 35)}...`
                    : data.name}
                </HeadingText>
              </div>
              <div className="signal-tooltip-label">
                <span className="type">{sigType}</span>
                <span className="account">{acctName}</span>
              </div>
            </div>
            <div className="signal-tooltip-content">{incidentsStatus}</div>
          </div>
        ) : null}
      </PopoverBody>
    </Popover>
  );
};

SignalTooltip.propTypes = {
  entityGuid: PropTypes.string,
  signalType: PropTypes.string,
  triggerElement: PropTypes.element,
};

export default SignalTooltip;
