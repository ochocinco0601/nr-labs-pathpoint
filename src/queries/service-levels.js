import { ngql } from 'nr1';

const serviceLevelsSearchQuery = ngql`{
    actor {
      entitySearch(query: "type = 'SERVICE_LEVEL'") {
        results {
          entities {
            accountId
            guid
            name
            serviceLevel {
              indicators {
                resultQueries {
                  indicator {
                    nrql
                  }
                }
                objectives {
                  resultQueries {
                    attainment {
                      nrql
                    }
                  }
                  target
                }
              }
            }
          }
          nextCursor
        }
      }
    }
  }`;

const serviceLevelEntityFragment = ngql`
  fragment EntityFragmentExtension on ExternalEntityOutline {
    serviceLevel {
      indicators {
        objectives {
          resultQueries {
            attainment {
              nrql
            }
          }
          target
          timeWindow {
            rolling {
              count
              unit
            }
          }
        }
      }
    }
  }
`;

const attainmentGQL = (entities = []) => ngql`{
  actor {
    ${
      entities.length
        ? entities
            .reduce(
              (acc, { accountId, guid, nrql }) => [
                ...acc,
                `
      ${guid}: nrql(accounts: [${accountId}], query: "${nrql}") {
        results
      }`,
              ],
              []
            )
            .join(' ')
        : 'user { id }'
    }
  }
}`;

export { serviceLevelsSearchQuery, serviceLevelEntityFragment, attainmentGQL };
