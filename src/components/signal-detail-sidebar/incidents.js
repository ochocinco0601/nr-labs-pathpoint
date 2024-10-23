import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, Card, CardBody, HeadingText, Link, SectionMessage } from 'nr1';

import { durationStringForViolation, formatTimestamp } from '../../utils';
import { ALERT_STATUSES, SIGNAL_TYPES, UI_CONTENT } from '../../constants';

const parseIncidentName = (name = '') => {
  try {
    return JSON.parse(name);
  } catch (_) {
    return name;
  }
};

const incidentFromViolation = ({
  alertSeverity = '',
  closedAt,
  label,
  openedAt,
  violationId,
  violationUrl,
} = {}) => ({
  id: violationId,
  name: label,
  closed: closedAt,
  opened: openedAt,
  link: violationUrl,
  state: closedAt ? 'closed' : 'open',
  curStatus: alertSeverity,
  classname: alertSeverity.toLowerCase(),
});

const incidentFromIncident = ({
  priority = '',
  closedAt,
  title,
  createdAt,
  incidentId,
  accountIds,
} = {}) => ({
  id: incidentId,
  name: parseIncidentName(title),
  closed: closedAt,
  opened: createdAt,
  link: `https://aiops.service.newrelic.com/accounts/${accountIds}/incidents/${incidentId}/redirect`,
  state: closedAt ? 'closed' : 'open',
  curStatus: priority,
  classname: priority.toLowerCase(),
});

const filterListForOpenOnly = ({ closedAt }) => !closedAt;

const Incidents = ({ type, data, timeWindow }) => {
  const [bannerMessage, setBannerMessage] = useState('');
  const [incidentsList, setIncidentsList] = useState([]);
  const [maxIncidentsShown, setMaxIncidentsShown] = useState(1);

  useEffect(() => {
    if (!data) return;

    let issuesToDisplay = [],
      maxIssuesDisplayed = 1;
    if (type === SIGNAL_TYPES.ENTITY) {
      const issuesArr = timeWindow
        ? data.alertViolations || []
        : data.recentAlertViolations || [];
      if (issuesArr.length) {
        issuesToDisplay = issuesArr.reduce((acc, issue) => {
          if (!timeWindow && issue.closedAt) return acc;
          return issue.alertSeverity === ALERT_STATUSES.CRITICAL
            ? [incidentFromViolation(issue), ...acc]
            : [...acc, incidentFromViolation(issue)];
        }, []);
      }
    } else if (type === SIGNAL_TYPES.ALERT) {
      const issuesArr = data.incidents || [];
      if (issuesArr.length) {
        issuesToDisplay = issuesArr
          .filter(filterListForOpenOnly)
          .map(incidentFromIncident);
      }
      maxIssuesDisplayed = issuesToDisplay.length;
    }
    if (!issuesToDisplay.length) {
      setBannerMessage(UI_CONTENT.SIGNAL.DETAILS.NO_RECENT_INCIDENTS);
    } else {
      setBannerMessage('');
    }
    setIncidentsList(issuesToDisplay);
    setMaxIncidentsShown(maxIssuesDisplayed);
  }, [type, data, timeWindow]);

  return (
    <div className="alert-incidents-wrapper">
      <HeadingText
        className="alert-incidents-header"
        type={HeadingText.TYPE.HEADING_4}
      >
        Open Incidents
      </HeadingText>
      <div className="alert-incidents">
        {bannerMessage && <SectionMessage description={bannerMessage} />}
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
                            View incident
                          </Link>
                          {/* {type === SIGNAL_TYPES.ENTITY && (
                                <Link
                                  className="detail-link"
                                  to={navigation.getOpenEntityLocation(guid)}
                                  onClick={(e) =>
                                    e.target.setAttribute('target', '_blank')
                                  }
                                >
                                  View condition
                                </Link>
                              )} */}
                        </div>
                        <div>Started: {formatTimestamp(opened)}</div>
                        <div>
                          Duration: {durationStringForViolation(closed, opened)}
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
      {type === SIGNAL_TYPES.ENTITY && incidentsList?.length > 1 ? (
        <div className="incidents-footer">
          <Button
            type={Button.TYPE.PLAIN_NEUTRAL}
            onClick={() => {
              setMaxIncidentsShown((mis) =>
                mis === 1 ? incidentsList.length : 1
              );
            }}
          >
            {maxIncidentsShown === 1
              ? `Show ${incidentsList.length - 1} more open incidents`
              : 'Show less incidents'}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

Incidents.propTypes = {
  type: PropTypes.oneOf(Object.values(SIGNAL_TYPES)),
  data: PropTypes.object,
  timeWindow: PropTypes.object,
};

export default Incidents;
