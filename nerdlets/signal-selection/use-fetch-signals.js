import { useCallback, useRef } from 'react';

import { EntitiesByDomainTypeQuery, EntitySearchQuery } from 'nr1';

const idFromGuid = (guid) => atob(guid).split('|')[3];

const useFetchSignals = () => {
  const policiesStore = useRef(new Map());
  const alertsAccountId = useRef(0);

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

  const fetchAlerts = useCallback(async ({ id, cursor, countOnly }) => {
    const policiesMap = policiesStore.current;

    if (id !== alertsAccountId.current) {
      policiesMap.clear();
      let policiesCursor = null;

      do {
        const {
          data: {
            entities: policiesEntities = [],
            nextCursor: policiesNextCursor = null,
          } = {},
        } = await EntitySearchQuery.query({
          entityDomain: 'AIOPS',
          entityType: 'POLICY',
          filters: `accountId = ${id}`,
          cursor: policiesCursor,
        });
        policiesEntities.map(({ guid, name = '' }) =>
          policiesMap.set(idFromGuid(guid), name)
        );
        policiesCursor = policiesNextCursor;
      } while (policiesCursor);
      alertsAccountId.current = id;
    }

    if (countOnly) {
      const { data: { count: totalCount = 0 } = {} } =
        await EntitySearchQuery.query({
          entityDomain: 'AIOPS',
          entityType: 'CONDITION',
          filters: `accountId = ${id}`,
          includeCount: true,
          includeResults: false,
        });
      return { data: { totalCount } };
    }

    let alertConditions = [];
    const { data: { entities = [], nextCursor } = {} } =
      await EntitySearchQuery.query({
        entityDomain: 'AIOPS',
        entityType: 'CONDITION',
        filters: `accountId = ${id}`,
        cursor,
        includeTags: true,
      });
    alertConditions = entities.map(({ guid, name, reporting, tags }) => {
      const policyId = (tags || []).reduce(
        (acc, { key, values }) => (acc || key !== 'policyId' ? acc : values[0]),
        null
      );
      return {
        guid,
        id: Number(idFromGuid(guid)),
        name,
        reporting,
        policyId,
        policyName: policiesMap?.get(policyId) || '',
      };
    });
    return { data: { alertConditions, nextCursor } };
  }, []);

  return { fetchEntities, fetchAlerts };
};

export default useFetchSignals;
