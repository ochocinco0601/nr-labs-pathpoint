import React, { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardBody,
  HeadingText,
  InlineMessage,
  Link,
  NerdGraphQuery,
  SectionMessage,
  navigation,
} from 'nr1';

import { SIGNAL_TYPES, STATUSES } from '../../constants';

import Incidents from './incidents';
import GoldenMetrics from './golden-metrics';
import { AppContext } from '../../contexts';

import typesList from '../../../nerdlets/signal-selection/types.json';
import { formatTimestamp, isWorkload } from '../../utils';
import { statusesFromGuidsArray, workloadEntitiesQuery } from '../../queries';

const NO_ENTITY_TYPE = '(unknown entity type)';

const entityTypeFromData = (entityData) => {
  const { domain, type } = entityData || {};
  if (!domain || !type) return NO_ENTITY_TYPE;
  return (
    typesList.find((t) => t.domain === domain && t.type === type)
      ?.displayName || NO_ENTITY_TYPE
  );
};

const SignalDetailSidebar = ({ guid, name, type, data, timeWindow }) => {
  const { account = {}, accounts = [] } = useContext(AppContext);
  const [hasAccessToEntity, setHasAccessToEntity] = useState(false);
  const [signalAccount, setSignalAccount] = useState();
  const [detailLinkText, setDetailLinkText] = useState('View entity details');
  const [incidentsData, setIncidentsData] = useState(null);
  const prevTimeWindow = useRef({});

  useEffect(() => {
    const [acctId, condId] = ((atob(guid) || '').split('|') || []).reduce(
      (acc, cur, idx) => (idx === 0 || idx === 3 ? [...acc, Number(cur)] : acc),
      []
    );
    if (acctId === account.id) {
      setHasAccessToEntity(true);
      setSignalAccount(account);
    } else {
      const acct = accounts.find((a) => a.id === acctId);
      if (acct) {
        setHasAccessToEntity(true);
        setSignalAccount(acct);
      }
    }
    if (type === SIGNAL_TYPES.ALERT) {
      setDetailLinkText(condId ? 'View alert condition' : '');
    } else if (type === SIGNAL_TYPES.ENTITY) {
      setDetailLinkText('View entity details');
    }
  }, [guid, type, account, accounts]);

  useEffect(() => {
    if (
      type !== SIGNAL_TYPES.ENTITY ||
      !isWorkload(data) ||
      !(
        data.statusValueCode === 3 ||
        data.statusValueCode === 2 ||
        data.alertSeverity === STATUSES.CRITICAL ||
        data.alertSeverity === STATUSES.WARNING
      )
    ) {
      setIncidentsData(data);
      return;
    }

    let shouldClearData = false;
    const { start: prevStart, end: prevEnd } = prevTimeWindow.current || {};
    if (timeWindow.start !== prevStart || timeWindow.end !== prevEnd) {
      shouldClearData = true;
      prevTimeWindow.current = timeWindow;
    }

    const loadWorkloadIncidents = async (g) => {
      const {
        data: {
          actor: {
            entity: { relatedEntities: { results = [] } = {} } = {},
          } = {},
        } = {},
        error,
      } = await NerdGraphQuery.query({
        query: workloadEntitiesQuery,
        variables: { guid: g },
      });
      if (error) {
        console.error('Error listing workload entities', error);
        return;
      }
      const workloadEntitiesGuids = results?.reduce(
        (acc, { target: { guid: g } = {} }) => (g ? [...acc, g] : acc),
        []
      );
      const {
        data: { actor: { __typename, ...entitiesObj } = {} } = {}, // eslint-disable-line no-unused-vars
        error: error2,
      } = await NerdGraphQuery.query({
        query: statusesFromGuidsArray([workloadEntitiesGuids], timeWindow),
      });
      if (error2) {
        console.error('Error loading workload entities', error2);
        return;
      }
      const violationsKey =
        timeWindow?.start && timeWindow?.end
          ? 'alertViolations'
          : 'recentAlertViolations';
      Object.keys(entitiesObj).forEach((entitiesKey) => {
        entitiesObj[entitiesKey]?.forEach((entity) => {
          if (isWorkload(entity)) {
            loadWorkloadIncidents(entity.guid);
            return;
          }
          const violations = entity?.[violationsKey] || [];
          if (violations.length) {
            setIncidentsData((d) =>
              d && !shouldClearData
                ? {
                    ...d,
                    [violationsKey]: [
                      ...(d[violationsKey] || []),
                      ...violations,
                    ],
                  }
                : {
                    ...data,
                    [violationsKey]: [
                      ...(data[violationsKey] || []),
                      ...violations,
                    ],
                  }
            );
          }
        });
      });
    };
    loadWorkloadIncidents(guid);
  }, [guid, type, data, timeWindow]);

  return (
    <div className="signal-detail-sidebar">
      <div className="signal-header">
        <Card>
          <CardBody className="signal-header-card-body">
            <HeadingText type={HeadingText.TYPE.HEADING_6}>
              SIGNAL DETAILS
            </HeadingText>
            <HeadingText type={HeadingText.TYPE.HEADING_3}>{name}</HeadingText>
            <HeadingText type={HeadingText.TYPE.HEADING_5}>
              {`${signalAccount?.name || '(unknown account)'} | ${
                type === SIGNAL_TYPES.ENTITY
                  ? entityTypeFromData(data)
                  : 'Alert condition'
              }`}
            </HeadingText>
            {hasAccessToEntity ? (
              <Link
                className="detail-link"
                to={navigation.getOpenEntityLocation(guid)}
                onClick={(e) => e.target.setAttribute('target', '_blank')}
              >
                {detailLinkText}
              </Link>
            ) : null}
            {timeWindow ? (
              <InlineMessage
                className="detail-time-info"
                description="Showing data for the specified time period."
                label={`${formatTimestamp(
                  timeWindow.start
                )} - ${formatTimestamp(timeWindow.end)}`}
              />
            ) : null}
          </CardBody>
        </Card>
      </div>
      {hasAccessToEntity ? (
        <>
          <Incidents type={type} data={incidentsData} timeWindow={timeWindow} />
          {type === SIGNAL_TYPES.ENTITY ? (
            <GoldenMetrics guid={guid} data={data} timeWindow={timeWindow} />
          ) : null}
        </>
      ) : (
        <SectionMessage
          type={SectionMessage.TYPE.CRITICAL}
          description="You do not have access to view this signal!"
        />
      )}
    </div>
  );
};

SignalDetailSidebar.propTypes = {
  guid: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.oneOf(Object.values(SIGNAL_TYPES)),
  data: PropTypes.object,
  timeWindow: PropTypes.object,
};

export default SignalDetailSidebar;
