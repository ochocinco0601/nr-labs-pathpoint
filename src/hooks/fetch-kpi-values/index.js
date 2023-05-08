import { useEffect, useState } from 'react';
import { NerdGraphQuery, useNerdGraphQuery } from 'nr1';

const useFetchKpis = ({ kpis }) => {
  console.log('### useFetchKpis: kpis: ', kpis.length);
  const [skip, setSkip] = useState(true);
  const [queryResults, setQueryResults] = useState([]);
  const query = buildNrqlQuery(kpis);

  const { data, error, loading } = useNerdGraphQuery({
    skip,
    query,
  });

  useEffect(() => {
    if (kpis && kpis.length) setSkip(false);
  }, [kpis]);

  useEffect(() => {
    if (error) console.error('Error fetching service levels', error);
  }, [error]);

  useEffect(() => {
    if (data && !loading) {
      console.log('### useFetchKpis: data size: ', JSON.stringify(data));
      setQueryResults(
        kpis.map((kpi, index) => {
          return {
            ...kpi,
            ...mapQueryResult(data.actor[`nrql${index}`].results),
          };
        })
      );
    }
  }, [data, loading]);

  return queryResults;
};

const buildNrqlQuery = (kpis) => {
  return (
    `
    {
      actor {
        ` +
    kpis
      .map(
        (k, index) => `
        nrql${index}: nrql(accounts: [${k.accountIds[0]}], query: "${k.nrqlQuery}", timeout: 30) {
          results
        }`
      )
      .join('') +
    `
      }
    }`
  );
};

const nrqlQueries = async (inputObject, mapResult = false) => {
  const kpis = Array.isArray(inputObject)
    ? inputObject
    : typeof inputObject === 'object'
    ? [inputObject]
    : [];
  if (!kpis.length) return [];

  const query = buildNrqlQuery(kpis);
  try {
    const { data, error } = await NerdGraphQuery.query({ query });
    if (error) {
      return error;
    } else {
      return mapResult
        ? kpis.map((kpi, index) => {
            return {
              ...kpi,
              ...mapQueryResult(data.actor[`nrql${index}`].results),
            };
          })
        : data.actor;
    }
  } catch (e) {
    return false;
  }
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
    // can't be used in simple-billboard
    return null;
  }
};

export { useFetchKpis, nrqlQueries, mapQueryResult };
