import { ngql } from 'nr1';

const nrqlConditions = `
  nextCursor
  nrqlConditions {
    guid: entityGuid
    name
    id
    policyId
  }
  totalCount`;

const nrqlConditionsSearchQuery = (searchCriteria = '', countOnly) => ngql`
query($id: Int!, $cursor: String) {
  actor {
    account(id: $id) {
      alerts {
        nrqlConditionsSearch(
          cursor: $cursor
          searchCriteria: {${searchCriteria}}
        ) {
          ${countOnly ? 'totalCount' : nrqlConditions}
        }
      }
    }
  }
}`;

const policiesSearchQuery = (policyIds = '""') => ngql`
query($id: Int!) {
  actor {
    account(id: $id) {
      alerts {
        policiesSearch(searchCriteria: {ids: ${policyIds}}) {
          nextCursor
          policies {
            id
            name
          }
        }
      }
    }
  }
}`;

const latestStatusForAlertConditions = (conditionIds = []) => {
  const query = `SELECT 
      event, 
      priority, 
      name,
      conditionId
    FROM (
      SELECT 
        latest(event) AS event, 
        latest(priority) AS priority, 
        latest(conditionName) as name,
        latest(conditionId) as conditionId
      FROM NrAiIncident 
      WHERE event IN ('open', 'close') and conditionId IN (${conditionIds.join(
        ', '
      )}) FACET incidentId LIMIT MAX) 
    WHERE event = 'open' 
    SINCE 10 DAYS AGO
    LIMIT MAX`.replace(/\s+/g, ' ');
  return query;
};

const incidentsQuery = (whereClause, timeClause, limitStatement) =>
  `
SELECT 
  accountId, 
  conditionId, 
  priority, 
  latestEvent, 
  title, 
  incidentId, 
  incidentLink,
  openTime, 
  durationSeconds  
FROM 
(SELECT latest(account.id) AS accountId, 
latest(conditionId) as conditionId, 
latest(priority) as priority, 
latest(event) as latestEvent, 
latest(title) as title, 
latest(incidentId) as incidentId, 
latest(incidentLink) as incidentLink,
latest(openTime) as openTime, 
latest(durationSeconds) as durationSeconds FROM NrAiIncident where event in ('open', 'close') and ${whereClause} facet incidentId LIMIT MAX)
where latestEvent = 'open'
  ${timeClause} order by openTime desc ${limitStatement}`.replace(/\s+/g, ' ');

export {
  nrqlConditionsSearchQuery,
  policiesSearchQuery,
  latestStatusForAlertConditions,
  incidentsQuery,
};
