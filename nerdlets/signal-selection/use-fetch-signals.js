import { useCallback } from 'react';

import { EntitiesByDomainTypeQuery, NerdGraphQuery } from 'nr1';
import {
  nrqlConditionsSearchQuery,
  policiesSearchQuery,
} from '../../src/queries';

const useFetchSignals = () => {
  const fetchEntities = useCallback(
    async ({ entityDomainType, filters, cursor }) => {
      const { data, error, loading } = await EntitiesByDomainTypeQuery.query({
        entityDomain: entityDomainType.domain,
        entityType: entityDomainType.type,
        filters,
        cursor,
      });

      if (error) throw error;
      if (data && !loading) return { data };
      return {};
    },
    []
  );

  const fetchAlerts = useCallback(async ({ id, searchQuery, countOnly }) => {
    if (id) {
      let nrqlConditions = [];
      let cursor = null;
      let totalCount = 0;
      let policyIds = new Set();
      let policies = {};

      do {
        const {
          data: {
            actor: {
              account: { alerts: { nrqlConditionsSearch = {} } = {} } = {},
            } = {},
          } = {},
          error,
        } = await NerdGraphQuery.query({
          query: nrqlConditionsSearchQuery(searchQuery, countOnly),
          variables: { id, cursor },
        });
        if (error) throw error;
        if (nrqlConditionsSearch?.nrqlConditions?.length) {
          nrqlConditions = nrqlConditionsSearch.nrqlConditions.reduce(
            (acc, { guid, id, name, policyId } = {}) => {
              policyIds.add(policyId);
              return [...acc, { guid, id, name, policyId }];
            },
            nrqlConditions
          );
        }
        cursor = nrqlConditionsSearch?.nextCursor;
        totalCount = nrqlConditionsSearch?.totalCount;
      } while (cursor);

      if (policyIds.size) {
        do {
          const {
            data: {
              actor: {
                account: { alerts: { policiesSearch = {} } = {} } = {},
              } = {},
            } = {},
            error,
          } = await NerdGraphQuery.query({
            query: policiesSearchQuery(`["${[...policyIds].join('", "')}"]`),
            variables: { id },
          });
          if (error) throw error;
          if (policiesSearch?.policies?.length) {
            policies = policiesSearch.policies.reduce(
              (acc, { id, name }) => ({
                ...acc,
                [id]: name,
              }),
              policies
            );
          }
          cursor = policiesSearch?.nextCursor;
        } while (cursor);

        nrqlConditions = nrqlConditions.map((condition) => ({
          ...condition,
          policyName: policies[condition.policyId] || '',
        }));
      }
      const data = countOnly ? { totalCount } : { nrqlConditions };
      return { data };
    }
    return {};
  }, []);

  return { fetchEntities, fetchAlerts };
};

export default useFetchSignals;
