import { StatusIcon } from '@newrelic/nr-labs-components';
import { latestStatusForAlertConditions, queriesGQL } from '../queries';

const {
  STATUSES: { UNKNOWN, CRITICAL, WARNING, SUCCESS },
} = StatusIcon;

export const ALERT_STATUSES = {
  NOT_ALERTING: 'NOT_ALERTING',
  WARNING: 'WARNING',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
};

export const alertStatus = ({ enabled, inferredPriority } = {}) => {
  if (!enabled) return UNKNOWN;
  switch (inferredPriority) {
    case ALERT_STATUSES.NOT_ALERTING: {
      return SUCCESS;
    }
    case ALERT_STATUSES.WARNING: {
      return WARNING;
    }
    case ALERT_STATUSES.HIGH: {
      return WARNING;
    }
    case ALERT_STATUSES.CRITICAL: {
      return CRITICAL;
    }
    default: {
      return SUCCESS;
    }
  }
};

export const alertsTree = (acc, guid) => {
  const [acctId, , , condId] = atob(guid).split('|');
  if (!acctId || !condId) return acc;
  let acctIdSuffix = 1,
    curAcctBlock = `${acctId}_${acctIdSuffix}`;
  if (!(curAcctBlock in acc)) {
    acc[curAcctBlock] = {};
  } else {
    while (Object.keys(acc[curAcctBlock]).length > 24) {
      acctIdSuffix += 1;
      curAcctBlock = `${acctId}_${acctIdSuffix}`;
      if (!(curAcctBlock in acc)) acc[curAcctBlock] = {};
    }
  }
  acc[curAcctBlock][condId] = guid;
  return acc;
};

export const alertConditionsStatusGQL = (alerts = {}) => {
  const queries = Object.keys(alerts).map((acctId) => ({
    accounts: acctId,
    alias: `q${acctId}`,
    query: latestStatusForAlertConditions(Object.keys(alerts[acctId])),
  }));

  return queries.length ? queriesGQL(queries) : null;
};

export const alertsStatusFromQueryResults = (alerts = {}, queryResult = {}) => {
  const statuses = Object.keys(alerts).reduce((acc, acctId) => {
    const { [`q${acctId}`]: { results: acctIncidents = [] } = {} } =
      queryResult;
    acctIncidents.forEach((incident) => {
      const condition = acc[alerts[acctId][incident.conditionId]];
      if (
        !condition ||
        (condition.priority !== CRITICAL &&
          condition.priority !== incident.priority)
      ) {
        return (acc[alerts[acctId][incident.conditionId]] = incident);
      }
    });
    return acc;
  }, {});

  return statuses;
};

const incidentIdsArray = (incidentIds = [], maxGuids) => {
  if (!incidentIds.length) return [];
  let arr = [];
  for (let i = 0; i < incidentIds.length; i += maxGuids) {
    const iids = incidentIds.slice(i, i + maxGuids);
    if (iids.length) arr.push(iids);
  }
  return arr;
};

export const conditionsAndIncidentsFromResponse = (resp = {}, maxGuids) =>
  Object.keys(resp).reduce(
    (acc, acct) => {
      const { alerts, id, incidentIds } = resp[acct] || {};
      if (id) {
        if (!(id in acc.conditionsLookup)) acc.conditionsLookup[id] = {};
        acc.conditionsLookup[id] = Object.keys(alerts).reduce((conds, cond) => {
          const { enabled, entityGuid, id, name } = alerts[cond] || {};
          return id ? { ...conds, [id]: { enabled, entityGuid, name } } : conds;
        }, {});
        const iia = incidentIdsArray(incidentIds, maxGuids);
        if (iia.length) {
          acc.acctIncidentIds[id] = iia;
        }
      }
      return acc;
    },
    { conditionsLookup: {}, acctIncidentIds: {} }
  );

export const incidentsByAccountsConditions = (resp) =>
  Object.keys(resp).reduce((acc, key) => {
    const { __typename, id: acctId, ...indexes } = resp[key]; // eslint-disable-line no-unused-vars
    Object.keys(indexes).forEach((idx) => {
      indexes[idx].incidents?.incidents?.forEach(
        // eslint-disable-next-line no-unused-vars
        ({ __typename, conditionFamilyId, ...incident }) => {
          if (conditionFamilyId) {
            if (!(acctId in acc)) acc[acctId] = {};
            if (!(conditionFamilyId in acc[acctId]))
              acc[acctId][conditionFamilyId] = {
                conditionId: conditionFamilyId,
                incidents: [],
                inferredPriority: ALERT_STATUSES.NOT_ALERTING,
              };
            acc[acctId][conditionFamilyId].incidents.push(incident);
            if (!incident.closedAt) {
              if (incident.priority === ALERT_STATUSES.CRITICAL) {
                acc[acctId][conditionFamilyId].inferredPriority =
                  ALERT_STATUSES.CRITICAL;
              } else if (
                acc[acctId][conditionFamilyId].inferredPriority !==
                ALERT_STATUSES.CRITICAL
              ) {
                acc[acctId][conditionFamilyId].inferredPriority =
                  incident.priority;
              }
            }
          }
        }
      );
    });
    return acc;
  }, {});

export const alertStatusesObject = (conditionsLookup, incidentsLookup) =>
  Object.keys(conditionsLookup).reduce(
    (accts, acctId) => ({
      ...accts,
      ...Object.keys(conditionsLookup[acctId]).reduce(
        (conds, condId) => ({
          ...conds,
          [conditionsLookup[acctId][condId].entityGuid]: {
            ...conditionsLookup[acctId][condId],
            ...incidentsLookup?.[acctId]?.[condId],
          },
        }),
        accts
      ),
    }),
    {}
  );
