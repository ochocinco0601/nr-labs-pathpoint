import { ngql } from 'nr1';

const queryFromGuidsArray = (arrayOfGuids = []) => ngql`{
  actor {
    ${arrayOfGuids.map(
      (arr, idx) =>
        `e${idx}: entities(guids: ["${arr.join('", "')}"]) { guid name }`
    )}
  }
}`;

const goldenMetricsForEntityQuery = (guid = '') => ngql`{
  actor {
    entity(guid: "${guid}") {
      accountId
      goldenMetrics {
        metrics {
          query
          title
        }
      }
    }
  }
}`;

const statusesFromGuidsArray = (arrayOfGuids = [], timeWindow) => `{
  actor {
    ${arrayOfGuids.map(
      (arr, idx) => `
      e${idx}: entities(
        guids: ["${arr.join('", "')}"]
      ) {
        accountId
        ${
          timeWindow?.start && timeWindow?.end
            ? `alertViolations(startTime: ${timeWindow.start}, endTime: ${timeWindow.end}) {
                alertSeverity
                closedAt
                label
                openedAt
                violationId
                violationUrl
              }`
            : `alertSeverity
              recentAlertViolations {
                alertSeverity
                closedAt
                label
                openedAt
                violationId
                violationUrl
              }`
        }
        domain
        guid
        goldenMetrics {
          metrics {
            query
            title
          }
        }
        name
        reporting
        type
        ... on WorkloadEntity {
          relatedEntities(
            filter: {direction: OUTBOUND, relationshipTypes: {include: CONTAINS}}
          ) {
            results {
              target {
                entity {
                  guid
                }
              }
            }
          }
        }
      }
    `
    )}
  }
}`;

const entitiesByDomainTypeAccountQuery = ({ type, domain }, accountId) => ngql`
query($cursor: String){
  actor {
    entitySearch(
      query: "domain = '${domain}' AND type = '${type}' AND accountId = ${accountId}"
    ) {
      results(cursor: $cursor) {
        entities {
          account {
            name
          }
          alertSeverity
          domain
          entityType
          guid
          name
          type
          reporting
        }
        nextCursor
      }
    }
  }
}`;

const entityCountByAccountQuery = (accountId) => `
query($cursor: String){
  actor {
    entitySearch(query: "accountId = ${accountId}") {
      results(cursor: $cursor) {
        nextCursor
      }
      count
      types {
        count
        domain
        type
      }
    }
  }
}`;

export {
  entitiesByDomainTypeAccountQuery,
  entityCountByAccountQuery,
  queryFromGuidsArray,
  goldenMetricsForEntityQuery,
  statusesFromGuidsArray,
};
