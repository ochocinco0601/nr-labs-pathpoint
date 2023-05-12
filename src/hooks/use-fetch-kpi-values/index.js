import { useEffect, useState } from 'react';
import { ngql, useNerdGraphQuery } from 'nr1';

const gqlFromKpiArray = (kpiData = []) => {
  const fragment =
    kpiData && kpiData.length
      ? kpiData
          .map((kpi, index) => {
            return kpi.nrqlQuery && kpi.accountIds.length
              ? `q${index}: nrql(accounts: [${kpi.accountIds.join(
                  ', '
                )}], query: "${kpi.nrqlQuery}", timeout: 100) {
                  results
                }`
              : 'user { id }';
          })
          .join(' ')
      : 'user { id }';
  return ngql`{ actor { ${fragment} } }`;
};

const mapQueryResult = (result) => {
  if (
    result.length === 2 &&
    result[0].comparison === 'current' &&
    result[1].comparison === 'previous'
  ) {
    return {
      value: result[0][Object.keys(result[0])[1]],
      previousValue: result[1][Object.keys(result[1])[1]],
    };
  } else if (result.length === 1) {
    return {
      value: result[0][Object.keys(result[0])[0]],
      previousValue: '',
    };
  } else {
    // more than 2 values can't be rendered in simple-billboard
    return null;
  }
};

const kpisFromData = ({ actor = {} } = {}) => {
  return Object.keys(actor)
    .filter((q) => q[0] === 'q')
    .map((q) => {
      return actor[q]
        ? {
            ...mapQueryResult(actor[q].results),
          }
        : [];
    });
};

const useFetchKpiValues = ({ kpiData }) => {
  const [kpis, setKpis] = useState([]);
  const [query, setQuery] = useState(gqlFromKpiArray(kpiData));
  const { data, error, loading } = useNerdGraphQuery({
    query,
  });

  useEffect(() => {
    kpiData?.length && setQuery(gqlFromKpiArray(kpiData));
  }, [kpiData]);

  useEffect(() => {
    if (data && !loading) {
      setKpis(kpisFromData(data));
    }
  }, [data, loading]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching Kpi values', error);
    }
  }, [error]);

  return { kpis, error };
};

export default useFetchKpiValues;
