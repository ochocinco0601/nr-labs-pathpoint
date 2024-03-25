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
} from 'nr1';

import { timeRangeToNrql } from '@newrelic/nr-labs-components';

import { incidentsQuery } from '../../queries';
import { formatTimestamp, getIncidentDuration } from '../../utils';
import { SIGNAL_TYPES, UI_CONTENT } from '../../constants';

const Incidents = ({ guid, type, conditionId, accountId }) => {
  const [bannerMessage, setBannerMessage] = useState();
  const [incidentsList, setIncidentsList] = useState([]);
  const [maxIncidentsShown, setMaxIncidentsShown] = useState(1);
  const { timeRange } = useContext(PlatformStateContext);

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
    fetchIncidents({ accountId, whereClause, timeClause, limitStatement });
  }, [guid, type, accountId, conditionId, timeRange, fetchIncidents]);

  const fetchIncidents = useCallback(
    async ({
      accountId,
      whereClause,
      timeClause = 'SINCE 30 DAYS AGO',
      limitStatement = 'LIMIT 1',
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
          fetchIncidents({ accountId, whereClause, secondAttempt: true });
        } else {
          setBannerMessage(UI_CONTENT.SIGNAL.DETAILS.NO_INCIDENTS);
        }
      } else {
        setIncidentsList(events);
        setMaxIncidentsShown(1);
        if (secondAttempt)
          setBannerMessage(UI_CONTENT.SIGNAL.DETAILS.FOUND_RECENT);
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

  return (
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
              ? `Show ${incidentsList.length - 1} more incidents`
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
};

export default Incidents;
