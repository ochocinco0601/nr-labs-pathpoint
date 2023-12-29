import { ngql } from 'nr1';

const nrqlConditions = `nrqlConditions {
  guid: entityGuid
  name
  id
  policyId
}`;

const nrqlConditionsSearchQuery = (searchCriteria = '', countOnly) => ngql`
query($id: Int!) {
  actor {
    account(id: $id) {
      alerts {
        nrqlConditionsSearch(searchCriteria: {${searchCriteria}}) {
          ${countOnly ? 'totalCount' : nrqlConditions}
        }
      }
    }
  }
}`;

export { nrqlConditionsSearchQuery };
