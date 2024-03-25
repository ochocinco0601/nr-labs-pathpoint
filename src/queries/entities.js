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

export { queryFromGuidsArray, goldenMetricsForEntityQuery };
