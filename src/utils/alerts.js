import { StatusIcon } from '@newrelic/nr-labs-components';
import { latestStatusForAlertConditions, queriesGQL } from '../queries';

const {
  STATUSES: { UNKNOWN, CRITICAL, WARNING, SUCCESS },
} = StatusIcon;

export const alertStatus = ({ event, priority } = {}) => {
  if (event === 'open') {
    switch (priority) {
      case 'warning': {
        return WARNING;
      }
      case 'critical': {
        return CRITICAL;
      }
      default: {
        return UNKNOWN;
      }
    }
  }
  return SUCCESS;
};

export const alertsTree = (acc, guid) => {
  const guidParts = atob(guid).split('|');
  if (!guidParts?.length === 4) return acc;
  const { 0: acctId, 3: condId } = guidParts;
  if (!(acctId in acc)) acc[acctId] = {};
  acc[acctId][condId] = guid;
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
