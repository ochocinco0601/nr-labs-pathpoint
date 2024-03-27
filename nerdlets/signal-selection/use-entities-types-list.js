import { useEffect, useState } from 'react';

import { useEntityCountQuery } from 'nr1';

import typesList from './types.json';

const useEntitiesTypesList = () => {
  const [entitiesCount, setEntitiesCount] = useState(0);
  const [entitiesTypesList, setEntitiesTypesList] = useState([]);
  const { data, error, loading } = useEntityCountQuery();

  useEffect(() => {
    if (data && !loading) {
      const entityTypesWithCount = data.types
        ? typesList.reduce((acc, { type, domain, displayName }) => {
            const { count } = data.types.find(
              (et) => et.domain === domain && et.type === type
            ) || { count: 0 };
            return count ? [...acc, { type, domain, displayName, count }] : acc;
          }, [])
        : [];

      setEntitiesCount(data.count || 0);
      setEntitiesTypesList((etl) =>
        etl.length === entityTypesWithCount.length &&
        entityTypesWithCount.every(
          (etc, i) =>
            etc.domain === etl[i].domain &&
            etc.type === etl[i].type &&
            etc.count === etl[i].count
        )
          ? etl
          : entityTypesWithCount
      );
    }
  }, [data, loading]);

  useEffect(() => {
    if (error) console.error('Error fetching entities counts', error);
  }, [error]);

  return { entitiesCount, entitiesTypesList };
};

export default useEntitiesTypesList;
