import { useEffect, useState } from 'react';

import { NerdGraphQuery } from 'nr1';

import { entityCountByAccountQuery } from '../../src/queries';

import typesList from './types.json';

const useEntitiesTypesList = ({ accountId }) => {
  const [entitiesCount, setEntitiesCount] = useState(0);
  const [entitiesTypesList, setEntitiesTypesList] = useState([]);

  useEffect(() => {
    const getEntityCount = async () => {
      const entityCountRes = await NerdGraphQuery.query({
        query: entityCountByAccountQuery(accountId),
        variables: { cursor: null },
      });
      const {
        data: { actor: { entitySearch: { types = [] } = {} } = {} } = {},
      } = entityCountRes || {};
      const { entityTypesWithCount, count } = typesList.reduce(
        (acc, { type, domain, displayName }) => {
          const { count } =
            types.find((et) => et.domain === domain && et.type === type) || {};
          const searchDisplayName = displayName.toLocaleUpperCase();
          return count
            ? {
                entityTypesWithCount: [
                  ...acc.entityTypesWithCount,
                  { type, domain, displayName, searchDisplayName, count },
                ],
                count: acc.count + count,
              }
            : acc;
        },
        { entityTypesWithCount: [], count: 0 }
      );
      setEntitiesCount(count);
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
    };

    getEntityCount();
  }, [accountId]);

  return { entitiesCount, entitiesTypesList };
};

export default useEntitiesTypesList;
