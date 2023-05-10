import { useEffect, useRef, useState } from 'react';
import { useEntitiesByGuidsQuery, useNerdGraphQuery } from 'nr1';

import {
  attainmentGQL,
  serviceLevelEntityFragment as entityFragmentExtension,
} from '../../queries';

const MAX_ITEMS_IN_BATCH = 25;

const useFetchServiceLevels = ({ guids = [] }) => {
  const [data, setData] = useState({});
  const [entityGuids, setEntityGuids] = useState([]);
  const [query, setQuery] = useState(attainmentGQL());
  const guidsSet = useRef(new Set([]));
  const guidsIndexMarker = useRef(0);
  const serviceLevels = useRef({});
  const serviceLevelsSet = useRef(new Set([]));
  const serviceLevelsIndexMarker = useRef(0);
  const {
    data: { entities } = {},
    error: slError,
    loading: slLoading,
  } = useEntitiesByGuidsQuery({
    entityGuids,
    entityFragmentExtension,
  });
  const {
    data: { actor: aqData },
    error: aqError,
    loading: aqLoading,
  } = useNerdGraphQuery({ query });

  useEffect(() => {
    guidsSet.current = new Set([...guidsSet.current, ...guids]);
    batchGuids();
  }, [guids]);

  useEffect(() => {
    if (!slLoading && entities?.length) {
      serviceLevels.current = serviceLevelsFromEntities(
        entities,
        serviceLevels.current
      );
      serviceLevelsSet.current = new Set([
        ...serviceLevelsSet.current,
        ...Object.keys(serviceLevels.current),
      ]);
      batchQueries();
      batchGuids();
    }
  }, [entities, slLoading]);

  useEffect(() => {
    if (!aqLoading && aqData) {
      const serviceLevelsWithAttainments = Object.keys(aqData).reduce(
        (acc, guid) => {
          if (!(guid in serviceLevels.current)) return acc;
          const {
            results: [res],
          } = aqData[guid];
          return {
            ...acc,
            [guid]: {
              ...serviceLevels.current[guid],
              attainment:
                Object.values(res).length === 1 ? Object.values(res)[0] : 0,
            },
          };
        },
        {}
      );

      setData((d) => ({
        ...d,
        ...serviceLevelsWithAttainments,
      }));
    }
  }, [aqData, aqLoading]);

  /* eslint-disable no-console */
  useEffect(() => {
    if (slError) console.error('Error fetching service levels', slError);
    if (aqError)
      console.error('Error fetching service level attainments', aqError);
  }, [slError, aqError]);
  /* eslint-enable no-console */

  const batchGuids = () => {
    const index = guidsIndexMarker.current;
    if (index < guidsSet.current.size) {
      const slicedGuids = [...guidsSet.current].slice(
        index,
        index + MAX_ITEMS_IN_BATCH
      );
      guidsIndexMarker.current = index + slicedGuids.length;
      setEntityGuids(() => [...slicedGuids]);
    }
  };

  const batchQueries = () => {
    const index = serviceLevelsIndexMarker.current;
    if (index < serviceLevelsSet.current.size) {
      const slicedQueries = (
        [...serviceLevelsSet.current].slice(
          index,
          index + MAX_ITEMS_IN_BATCH
        ) || []
      ).map((guid) => {
        const { accountId, nrql } = serviceLevels.current[guid];
        return { accountId, guid, nrql };
      });
      serviceLevelsIndexMarker.current = index + slicedQueries.length;
      setQuery(attainmentGQL(slicedQueries));
    }
  };

  const refetch = () => {
    guidsIndexMarker.current = 0;
    qryIndexMarker.current = 0;
    batchGuids();
  };

  return { data };
};

const serviceLevelsFromEntities = (entities, existing) =>
  entities.reduce(
    (
      acc,
      {
        accountId,
        guid,
        name,
        serviceLevel: {
          indicators: [
            {
              objectives: [
                {
                  resultQueries: { attainment: { nrql } = {} } = {},
                  target = 0,
                  timeWindow: { rolling: { count = 0, unit = '' } = {} } = {},
                } = {},
              ] = [],
            } = {},
          ] = [],
        } = {},
      }
    ) => ({
      ...acc,
      [guid]: {
        accountId,
        name,
        nrql,
        target,
        timeWindow: {
          count,
          unit,
        },
      },
    }),
    existing || {}
  );

export default useFetchServiceLevels;
