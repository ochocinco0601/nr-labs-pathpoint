import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  NerdGraphQuery,
  navigation,
  nerdlet,
  useNerdletState,
  usePlatformState,
} from 'nr1';

import Listing from './listing';
import Header from './header';
import TabBar from './tab-bar';
import Filters from './filters';
import Footer from './footer';
import useFetchSignals from './use-fetch-signals';
import useEntitiesTypesList from './use-entities-types-list';
import { entitiesByDomainTypeAccountQuery } from '../../src/queries';
import { MODES, SIGNAL_TYPES, UI_CONTENT } from '../../src/constants';

const uniqueGuidsArray = (arr = [], item = {}, shouldRemove) => {
  const idx = arr.findIndex(({ guid }) => guid === item.guid);
  if (shouldRemove)
    return idx < 0 ? [...arr] : [...arr.slice(0, idx), ...arr.slice(idx + 1)];
  return idx < 0 ? [...arr, item] : [...arr];
};

const nameFilter = (items, searchText) =>
  items.filter(({ name = '' }) =>
    name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
  );

const SignalSelectionNerdlet = () => {
  const [currentTab, setCurrentTab] = useState(SIGNAL_TYPES.ENTITY);
  const [acctId, setAcctId] = useState();
  const [selectedEntityType, setSelectedEntityType] = useState();
  const [entities, setEntities] = useState([]);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [filteredEntities, setFilteredEntities] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [fetchEntitiesNextCursor, setFetchEntitiesNextCursor] = useState();
  const [searchText, setSearchText] = useState('');
  const [lazyLoadingProps, setLazyLoadingProps] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [{ accountId }] = usePlatformState();
  const [
    {
      flowId,
      levelId,
      levelOrder,
      stageId,
      stageName,
      stepId,
      stepTitle,
      step,
    },
  ] = useNerdletState();
  const { entitiesCount, entitiesTypesList } = useEntitiesTypesList({
    accountId: acctId,
  });
  const { fetchAlerts } = useFetchSignals();

  useEffect(() => {
    nerdlet.setConfig({
      timePicker: false,
    });
  }, []);

  useEffect(() => setAcctId(accountId), [accountId]);

  useEffect(() => {
    if (!step?.signals?.length) return;
    const { ents, alts } = step.signals.reduce(
      (acc, sig) => {
        if (sig.type === SIGNAL_TYPES.ENTITY)
          return {
            ...acc,
            ents: [...acc.ents, sig],
          };
        if (sig.type === SIGNAL_TYPES.ALERT)
          return {
            ...acc,
            alts: [...acc.alts, sig],
          };
        return acc;
      },
      { ents: [], alts: [] }
    );
    setSelectedEntities(ents);
    setSelectedAlerts(alts);
  }, [step]);

  useEffect(() => {
    const getAlertsCount = async (id, searchQuery, countOnly) => {
      const { data } = await fetchAlerts({ id, searchQuery, countOnly });
      setAlertCount(data?.totalCount || 0);
    };

    if (acctId) getAlertsCount(acctId, '', true).catch(console.error);
  }, [acctId, fetchAlerts]);

  useEffect(() => {
    const getEntities = async (id) => {
      setIsLoading(true);
      const {
        data: {
          actor: {
            entitySearch: {
              results: { entities: e = [], nextCursor } = {},
            } = {},
          } = {},
        } = {},
      } = await NerdGraphQuery.query({
        query: entitiesByDomainTypeAccountQuery(selectedEntityType, id),
        variables: { cursor: null },
      });
      setIsLoading(false);
      setEntities(() => (e && e.length ? e : []));
      setFetchEntitiesNextCursor(nextCursor);
    };

    const getAlerts = async (id, searchQuery) => {
      setIsLoading(true);
      const { data: { nrqlConditions = [] } = {} } = await fetchAlerts({
        id,
        searchQuery,
      });
      setIsLoading(false);
      setAlerts(() =>
        nrqlConditions && nrqlConditions.length ? nrqlConditions : []
      );
    };

    if (currentTab === SIGNAL_TYPES.ENTITY) {
      if (entitiesCount && selectedEntityType) {
        getEntities(acctId).catch(console.error);
      } else {
        setEntities(() => []);
      }
    } else if (currentTab === SIGNAL_TYPES.ALERT) {
      if (acctId && alertCount) {
        getAlerts(acctId).catch(console.error);
      } else {
        setAlerts(() => []);
      }
    }
  }, [currentTab, acctId, selectedEntityType, alertCount, fetchAlerts]);

  useEffect(() => {
    setSelectedEntityType((et) =>
      entitiesTypesList?.length ? entitiesTypesList[0] : et
    );
    setEntities([]);
    setAlerts([]);
  }, [entitiesTypesList]);

  useEffect(() => {
    if (searchText) {
      setFilteredAlerts(nameFilter(alerts, searchText));
      setFilteredEntities(nameFilter(entities, searchText));
      setLazyLoadingProps({});
    } else {
      setFilteredAlerts(alerts);
      setFilteredEntities(entities);
      setLazyLoadingProps({
        rowCount: selectedEntityType?.count,
        onLoadMore,
      });
    }
  }, [
    currentTab,
    alerts,
    entities,
    searchText,
    selectedEntityType,
    onLoadMore,
  ]);

  const onLoadMore = useCallback(async () => {
    const {
      data: {
        actor: {
          entitySearch: { results: { entities: e = [], nextCursor } = {} } = {},
        } = {},
      } = {},
    } = await NerdGraphQuery.query({
      query: entitiesByDomainTypeAccountQuery(selectedEntityType, acctId),
      variables: { cursor: fetchEntitiesNextCursor },
    });
    setEntities((ent) =>
      e && e.length
        ? [
            ...ent,
            ...e.filter(({ guid }) => !ent.some((en) => en.guid === guid)),
          ]
        : ent
    );
    setFetchEntitiesNextCursor(nextCursor);
  }, [acctId, selectedEntityType, fetchEntitiesNextCursor]);

  const accountChangeHandler = useCallback((_, ai) => {
    setAcctId(ai);
    setEntities([]);
    setAlerts([]);
  }, []);

  const entityTypeChangeHandler = useCallback((e) => {
    setSelectedEntityType(e);
    setEntities([]);
    setAlerts([]);
  }, []);

  const entityTypeTitle = useMemo(
    () =>
      selectedEntityType
        ? selectedEntityType.displayName ||
          `${selectedEntityType.domain}/${selectedEntityType.type}`
        : UI_CONTENT.SIGNAL_SELECTION.ENTITY_TYPE_DROPDOWN_PLACEHOLDER,
    [selectedEntityType]
  );

  const selectItemHandler = useCallback((type, checked, item) => {
    if (type === SIGNAL_TYPES.ENTITY)
      setSelectedEntities((se) => uniqueGuidsArray(se, item, !checked));
    if (type === SIGNAL_TYPES.ALERT)
      setSelectedAlerts((sa) => uniqueGuidsArray(sa, item, !checked));
  }, []);

  const deleteItemHandler = useCallback(
    (type, guid) => selectItemHandler(type, false, { guid }),
    [selectItemHandler]
  );

  const cancelHandler = useCallback(() => navigation.closeNerdlet(), []);

  const saveHandler = () =>
    navigation.openNerdlet({
      id: 'home',
      urlState: {
        flow: { id: flowId },
        mode: MODES.EDIT,
        staging: {
          stageId,
          levelId,
          stepId,
          signals: [
            ...(selectedEntities || []).map(({ guid, name }) => ({
              guid,
              name,
              type: SIGNAL_TYPES.ENTITY,
            })),
            ...(selectedAlerts || []).map(({ guid, name }) => ({
              guid,
              name,
              type: SIGNAL_TYPES.ALERT,
            })),
          ],
        },
      },
    });

  return (
    <div className="container nerdlet">
      <div className="signal-select">
        <Header
          stageName={stageName}
          levelOrder={levelOrder}
          stepTitle={stepTitle}
        />
        <TabBar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          labels={{
            [SIGNAL_TYPES.ENTITY]: `Entities (${entitiesCount})`,
            [SIGNAL_TYPES.ALERT]: `Alerts (${alertCount})`,
          }}
        />
        <Filters
          currentTab={currentTab}
          accountId={acctId}
          entityTypeTitle={entityTypeTitle}
          entityTypes={entitiesTypesList}
          onAccountChange={accountChangeHandler}
          onEntityTypeChange={entityTypeChangeHandler}
          searchText={searchText}
          setSearchText={setSearchText}
        />
        <Listing
          currentTab={currentTab}
          entities={filteredEntities}
          alerts={filteredAlerts}
          selectedEntities={selectedEntities}
          selectedAlerts={selectedAlerts}
          isLoading={isLoading}
          onSelect={selectItemHandler}
          onDelete={deleteItemHandler}
          {...lazyLoadingProps}
        />
        <Footer
          entitiesCount={selectedEntities.length}
          alertsCount={selectedAlerts.length}
          saveHandler={saveHandler}
          cancelHandler={cancelHandler}
        />
      </div>
    </div>
  );
};

export default SignalSelectionNerdlet;
