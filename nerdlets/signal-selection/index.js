import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  navigation,
  nerdlet,
  useEntitiesByDomainTypeQuery,
  useEntitySearchQuery,
  useNerdletState,
  usePlatformState,
} from 'nr1';

import Listing from './listing';
import Header from './header';
import TabBar from './tab-bar';
import Filters from './filters';
import Footer from './footer';
import useEntitiesTypesList from './use-entities-types-list';
import { MODES, SIGNAL_TYPES, UI_CONTENT } from '../../src/constants';

const CONDITION_DOMAIN_TYPE = {
  domain: 'AIOPS',
  type: 'CONDITION',
};

const POLICY_DOMAIN_TYPE = {
  entityDomain: 'AIOPS',
  entityType: 'POLICY',
};

const uniqueGuidsArray = (arr = [], item = {}, shouldRemove) => {
  const idx = arr.findIndex(({ guid }) => guid === item.guid);
  if (shouldRemove)
    return idx < 0 ? [...arr] : [...arr.slice(0, idx), ...arr.slice(idx + 1)];
  return idx < 0 ? [...arr, item] : [...arr];
};

const entitySearchFilters = (accountId, { domain, type } = {}, name, tag) => {
  let filters = accountId ? `accountId = ${accountId}` : '';
  if (domain) filters += `${filters.length ? ' AND ' : ''}domain = '${domain}'`;
  if (type) filters += `${filters.length ? ' AND ' : ''}type = '${type}'`;
  if (name) filters += `${filters.length ? ' AND ' : ''}name like '%${name}%'`;
  if (tag)
    filters += `${filters.length ? ' AND ' : ''}\`tags.${tag.key}\` = '${
      tag.value
    }'`;
  return filters;
};

const idFromGuid = (guid) => atob(guid).split('|')[3];

const SignalSelectionNerdlet = () => {
  const [currentTab, setCurrentTab] = useState(SIGNAL_TYPES.ENTITY);
  const [acctId, setAcctId] = useState();
  const [selectedEntityType, setSelectedEntityType] = useState();
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState();
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [entitySearchName, setEntitySearchName] = useState('');
  const [{ accountId }] = usePlatformState();
  const [{ flowId, levelId, levelOrder, stageId, stageName, step }] =
    useNerdletState();
  const { entitiesCount, entitiesTypesList } = useEntitiesTypesList({
    accountId: acctId,
  });
  const lastSelectedDomainType = useRef(null);
  const searchTimeoutId = useRef(null);
  const acctPolicies = useRef({});
  const {
    data: { count: rowCount = 0, entities = [] } = {},
    error: entitySearchError,
    fetchMore,
    loading: entitySearchLoading,
  } = useEntitySearchQuery({
    filters: entitySearchFilters(
      acctId,
      selectedEntityType,
      entitySearchName,
      currentTab === SIGNAL_TYPES.ALERT &&
        selectedPolicy && {
          key: 'policyId',
          value: idFromGuid(selectedPolicy.guid),
        }
    ),
    includeTags: true,
  });
  const { data: { count: alertCount = 0 } = {}, error: alertCountError } =
    useEntitySearchQuery({
      filters: entitySearchFilters(acctId, CONDITION_DOMAIN_TYPE),
      includeCount: true,
      includeResults: false,
    });
  const {
    data: { entities: policiesData = [] } = {},
    error: policiesError,
    fetchMore: policiesFetchMore,
  } = useEntitiesByDomainTypeQuery({
    ...POLICY_DOMAIN_TYPE,
    filters: acctId ? `accountId = ${acctId}` : '',
  });

  useEffect(() => {
    nerdlet.setConfig({
      timePicker: false,
    });
  }, []);

  useEffect(() => setAcctId(accountId), [accountId]);

  useEffect(() => {
    acctPolicies.current = policiesData.reduce(
      (acc, { guid, name }) => ({ ...acc, [idFromGuid(guid)]: name }),
      {}
    );
  }, [policiesData]);

  useEffect(() => policiesFetchMore?.(), [policiesFetchMore]);

  useEffect(() => {
    if (alertCountError)
      console.log('Error fetching alerts count', alertCountError);
  }, [alertCountError]);

  useEffect(() => {
    if (entitySearchError)
      console.error('Error fetching entities/conditions', entitySearchError);
  }, [entitySearchError]);

  useEffect(() => {
    if (policiesError)
      console.error('Error fetching policies list', policiesError);
  }, [policiesError]);

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
    if (currentTab === SIGNAL_TYPES.ENTITY) {
      setSelectedEntityType(
        lastSelectedDomainType.current || entitiesTypesList?.[0]
      );
    } else if (currentTab === SIGNAL_TYPES.ALERT) {
      setSelectedEntityType((et) => {
        lastSelectedDomainType.current = et;
        return CONDITION_DOMAIN_TYPE;
      });
    }
  }, [currentTab, entitiesTypesList]);

  useEffect(async () => {
    clearTimeout(searchTimeoutId.current);
    searchTimeoutId.current = setTimeout(
      async () => setEntitySearchName(searchText),
      1000
    );
  }, [searchText]);

  const accountChangeHandler = useCallback((_, ai) => setAcctId(ai), []);

  const entityTypeChangeHandler = useCallback(
    (e) => setSelectedEntityType(e),
    []
  );

  const policyChangeHandler = useCallback((e) => setSelectedPolicy(e), []);

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
          stepId: step?.id,
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

  const conditionsEntities = useCallback(
    (eee = []) =>
      eee.reduce((acc, e) => {
        const ee = {
          accountId: e.accountId,
          alertSeverity: e.alertSeverity,
          domain: e.domain,
          guid: e.guid,
          name: e.name,
          policyId: e.tags?.reduce(
            (acc, { key, values: [pi] = [] }) =>
              !acc || key === 'policyId' ? pi : acc,
            null
          ),
          reporting: e.reporting,
          type: e.type,
        };
        ee.policyName = acctPolicies.current?.[ee.policyId] || '';
        return [...acc, ee];
      }, []),
    []
  );

  return (
    <div className="container nerdlet">
      <div className="signal-select">
        <Header
          stageName={stageName}
          levelOrder={levelOrder}
          stepTitle={step?.title}
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
          selectedPolicyText={
            selectedPolicy
              ? `POLICY: ${selectedPolicy.name}`
              : '(showing all policies)'
          }
          policies={policiesData}
          onAccountChange={accountChangeHandler}
          onEntityTypeChange={entityTypeChangeHandler}
          onPolicyChange={policyChangeHandler}
          searchText={searchText}
          setSearchText={setSearchText}
        />
        <Listing
          currentTab={currentTab}
          entities={
            currentTab !== SIGNAL_TYPES.ALERT
              ? entities
              : conditionsEntities(entities)
          }
          selectedEntities={selectedEntities}
          selectedAlerts={selectedAlerts}
          isLoading={entitySearchLoading}
          onSelect={selectItemHandler}
          onDelete={deleteItemHandler}
          rowCount={rowCount}
          onLoadMore={fetchMore}
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
