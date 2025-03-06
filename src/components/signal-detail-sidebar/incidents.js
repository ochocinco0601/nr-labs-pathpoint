import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Card,
  CardBody,
  HeadingText,
  Link,
  SectionMessage,
  Spinner,
} from 'nr1';

import {
  durationStringForViolation,
  formatTimestamp,
  generateIncidentsList,
  isWorkload,
} from '../../utils';
import { SIGNAL_TYPES, UI_CONTENT } from '../../constants';

const Incidents = ({ type, data, timeWindow, isLoading }) => {
  const [bannerMessage, setBannerMessage] = useState('');
  const [incidentsList, setIncidentsList] = useState([]);
  const [maxIncidentsShown, setMaxIncidentsShown] = useState(1);
  const [shouldShowAllIncidents, setShouldShowAllIncidents] = useState(false);

  useEffect(() => {
    if (!data) return;

    const incids = generateIncidentsList({ type, data, timeWindow });
    const showAll = type === SIGNAL_TYPES.ALERT || isWorkload(data);
    let bnrMsg = '';
    if (isWorkload(data)) {
      bnrMsg = UI_CONTENT.SIGNAL.DETAILS.WORKLOAD_RULES_DISCLAIMER;
    }
    if (!incids.length) {
      bnrMsg = UI_CONTENT.SIGNAL.DETAILS.NO_RECENT_INCIDENTS;
    }

    setBannerMessage(bnrMsg);
    setShouldShowAllIncidents(showAll);
    setMaxIncidentsShown(() => (showAll ? incids.length || 0 : 1));
    setIncidentsList(incids);
  }, [type, data, timeWindow]);

  return (
    <div className="alert-incidents-wrapper">
      <HeadingText
        className="alert-incidents-header"
        type={HeadingText.TYPE.HEADING_4}
      >
        Open Incidents
      </HeadingText>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="alert-incidents">
            {bannerMessage && <SectionMessage description={bannerMessage} />}
            {data?.type === 'SERVICE_LEVEL' &&
            data?.alertSeverity !== 'NOT_ALERTING' &&
            !incidentsList?.length ? (
              <SectionMessage
                type={SectionMessage.TYPE.WARNING}
                description={UI_CONTENT.SIGNAL.DETAILS.ALERTING_SL_NO_INCIDENT}
              />
            ) : null}
            {incidentsList.reduce(
              (
                acc,
                { id, name, curStatus, state, classname, opened, closed, link },
                i
              ) =>
                i < maxIncidentsShown
                  ? [
                      ...acc,
                      <div key={id} className="alert-incident">
                        <Card>
                          <CardBody className="incident-card-body">
                            <div className="incident-header">
                              <div className={`square ${classname}`}></div>
                              <div className={`signal-status ${classname}`}>
                                <span>
                                  <span className="priority">{curStatus}</span>
                                  {' Issue '}
                                  <span className="event">{state}</span>
                                </span>
                              </div>
                            </div>
                            <HeadingText type={HeadingText.TYPE.HEADING_5}>
                              {name}
                            </HeadingText>
                            <div className="incident-links">
                              <Link
                                className="detail-link"
                                to={link}
                                onClick={(e) =>
                                  e.target.setAttribute('target', '_blank')
                                }
                              >
                                View issue
                              </Link>
                            </div>
                            <div>Started: {formatTimestamp(opened)}</div>
                            <div>
                              Duration:{' '}
                              {durationStringForViolation(closed, opened)}
                            </div>
                            {closed ? (
                              <div>Closed: {formatTimestamp(closed)}</div>
                            ) : null}
                          </CardBody>
                        </Card>
                      </div>,
                    ]
                  : acc,
              []
            )}
          </div>
          {type === !shouldShowAllIncidents && incidentsList?.length > 1 ? (
            <div className="incidents-footer">
              <Button
                variant={Button.VARIANT.SECONDARY}
                onClick={() => {
                  setMaxIncidentsShown((mis) =>
                    mis === 1 ? incidentsList.length : 1
                  );
                }}
              >
                {maxIncidentsShown === 1
                  ? `Show ${incidentsList.length - 1} more incidents`
                  : 'Show less incidents'}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

Incidents.propTypes = {
  type: PropTypes.oneOf(Object.values(SIGNAL_TYPES)),
  data: PropTypes.object,
  timeWindow: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default Incidents;
