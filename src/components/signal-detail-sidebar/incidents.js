import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Card,
  CardBody,
  HeadingText,
  Link,
  navigation,
  NrqlQuery,
  PlatformStateContext,
  SectionMessage,
  Spinner,
} from 'nr1';

import { timeRangeToNrql } from '@newrelic/nr-labs-components';

import { incidentsQuery } from '../../queries';
import { formatTimestamp, getIncidentDuration } from '../../utils';
import { SIGNAL_TYPES, STATUSES, UI_CONTENT } from '../../constants';

const Incidents = ({ guid, type, conditionId, accountId, status }) => {
  const [bannerMessage, setBannerMessage] = useState('');
  const [incidentsList, setIncidentsList] = useState([]);
  const [maxIncidentsShown, setMaxIncidentsShown] = useState(1);
  const [loading, setLoading] = useState(true);
  const { timeRange } = useContext(PlatformStateContext);

  useEffect(() => {
    setBannerMessage('');
    setIncidentsList([]);
    setMaxIncidentsShown(1);
    setLoading(true);
  }, [guid]);

  useEffect(() => {
    if (
      !guid ||
      !accountId ||
      (type === SIGNAL_TYPES.ALERT && !conditionId) ||
      !timeRange ||
      !fetchIncidents
    )
      return;

    const whereClause =
      type === SIGNAL_TYPES.ALERT
        ? `conditionId = ${conditionId}`
        : `entity.guid = '${guid}'`;
    const timeClause = timeRangeToNrql({ timeRange });
    const limitStatement = 'LIMIT MAX';
    const isAlert = type === SIGNAL_TYPES.ALERT;
    setLoading(true);
    setBannerMessage('');
    fetchIncidents({
      accountId,
      status,
      whereClause,
      timeClause,
      limitStatement,
      isAlert,
    });
  }, [guid, type, accountId, conditionId, status, timeRange, fetchIncidents]);

  const fetchIncidents = useCallback(
    async ({
      accountId,
      status,
      whereClause,
      timeClause = 'SINCE 10 DAYS AGO',
      limitStatement = 'LIMIT 1',
      isAlert,
      secondAttempt = false,
    }) => {
      const query = incidentsQuery(whereClause, timeClause, limitStatement);
      const { data: { results: [{ events = [] }] = [{}] } = {} } =
        await NrqlQuery.query({
          accountIds: [accountId],
          query,
          formatType: NrqlQuery.FORMAT_TYPE.RAW,
        });

      if (!events?.length) {
        if (!secondAttempt) {
          if ([STATUSES.CRITICAL, STATUSES.WARNING].includes(status)) {
            fetchIncidents({
              accountId,
              whereClause,
              isAlert,
              secondAttempt: true,
            });
          } else {
            setLoading(false);
            setBannerMessage(UI_CONTENT.SIGNAL.DETAILS.NOT_FOUND_IN_TIMERANGE); // signal with success or unknown status -- make only one attempt to fetch incidents
          }
        } else {
          setLoading(false);
          setBannerMessage(UI_CONTENT.SIGNAL.DETAILS.NO_INCIDENTS); // nothing found after secondAttempt
        }
      } else {
        setIncidentsList(events);
        setMaxIncidentsShown(isAlert ? events.length : 1);
        setLoading(false);
        if (secondAttempt) {
          setBannerMessage(
            `${UI_CONTENT.SIGNAL.DETAILS.NOT_FOUND_IN_TIMERANGE} ${UI_CONTENT.SIGNAL.DETAILS.FOUND_RECENT}` // most recent incident fiund outside of selected timerange
          );
        }
      }
    },
    []
  );

  const openIncidentNerdlet = useCallback(({ accountId, incidentId }) => {
    if (accountId && incidentId)
      navigation.openStackedNerdlet({
        id: 'incident-analysis.home',
        urlState: { accountId, incidentId },
      });
  }, []);

  const openConditionNerdlet = useCallback(({ accountId, conditionId }) => {
    if (!accountId || !conditionId) return;
    const entityGuid = btoa(
      `${accountId}|AIOPS|CONDITION|${conditionId}`
    ).replace(/=+$/, '');
    navigation.openStackedEntity(entityGuid);
  }, []);

  if (loading)
    return (
      <div className="alert-incidents-wrapper">
        <Spinner type={Spinner.TYPE.DOT} />
      </div>
    );

  return (
    <div className="alert-incidents-wrapper">
      <HeadingText
        className="alert-incidents-header"
        type={HeadingText.TYPE.HEADING_4}
      >
        Activity stream
      </HeadingText>
      <div className="alert-incidents">
        {bannerMessage && <SectionMessage description={bannerMessage} />}
        {incidentsList.reduce(
          (acc, incident, i) =>
            i < maxIncidentsShown
              ? [
                  ...acc,
                  <div key={incident.incidentId} className="alert-incident">
                    <Card>
                      <CardBody className="incident-card-body">
                        <div className="incident-header">
                          <div className={`square ${incident.priority}`}></div>
                          <div className={`signal-status ${incident.priority}`}>
                            <span>
                              <span className="priority">
                                {incident.priority}
                              </span>
                              {' Issue '}
                              <span className="event">{incident.event}</span>
                            </span>
                          </div>
                        </div>
                        <HeadingText type={HeadingText.TYPE.HEADING_5}>
                          {incident.title}
                        </HeadingText>
                        <div className="incident-links">
                          <Link
                            className="detail-link"
                            onClick={() => openIncidentNerdlet(incident)}
                          >
                            View incident
                          </Link>
                          {type === SIGNAL_TYPES.ENTITY && (
                            <Link
                              className="detail-link"
                              onClick={() => openConditionNerdlet(incident)}
                            >
                              View condition
                            </Link>
                          )}
                        </div>
                        <div>Started: {formatTimestamp(incident.openTime)}</div>
                        <div>Duration: {getIncidentDuration(incident)}</div>
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
  guid: PropTypes.string,
  type: PropTypes.oneOf(Object.values(SIGNAL_TYPES)),
  conditionId: PropTypes.number,
  accountId: PropTypes.number,
  status: PropTypes.oneOf(Object.values(SIGNAL_TYPES)),
};

export default Incidents;
