import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { AccountPicker, Dropdown, DropdownItem, TextField } from 'nr1';

import { SIGNAL_TYPES } from '../../src/constants';

const Filters = ({
  currentTab,
  accountId,
  entityTypeTitle,
  entityTypes,
  selectedPolicyText,
  policies,
  onAccountChange,
  onEntityTypeChange,
  onPolicyChange,
  searchText,
  setSearchText,
}) => {
  const [entityTypeSearchText, setEntityTypeSearchText] = useState('');
  const [policyNameSearchText, setPolicyNameSearchText] = useState('');

  const filteredEntityTypes = useMemo(() => {
    if (!entityTypeSearchText.trim()) return entityTypes;
    const est = entityTypeSearchText.toLocaleUpperCase();
    return entityTypes.filter(
      ({ domain, type, searchDisplayName }) =>
        domain.includes(est) ||
        type.includes(est) ||
        searchDisplayName.includes(est)
    );
  }, [entityTypes, entityTypeSearchText]);

  const filteredPolicies = useMemo(() => {
    if (!policyNameSearchText.trim()) return policies;
    return policies.filter(({ name = '' }) =>
      name
        .toLocaleLowerCase()
        .includes(policyNameSearchText.toLocaleLowerCase())
    );
  }, [policies, policyNameSearchText]);

  const entityTypeChangeHandler = useCallback((e) => {
    setEntityTypeSearchText('');
    if (onEntityTypeChange) onEntityTypeChange(e);
  }, []);

  return (
    <div className="filters">
      <AccountPicker value={accountId} onChange={onAccountChange} />
      <TextField
        type={TextField.TYPE.SEARCH}
        placeholder={`Search by ${
          currentTab === SIGNAL_TYPES.ENTITY ? 'entity' : 'condition'
        } name`}
        value={searchText}
        onChange={({ target: { value } = {} } = {}) =>
          setSearchText(value || '')
        }
      />
      {currentTab === SIGNAL_TYPES.ALERT ? (
        <Dropdown
          className="entity-type-filter"
          title={selectedPolicyText}
          items={filteredPolicies}
          search={policyNameSearchText}
          onSearch={({ target: { value = '' } = {} } = {}) =>
            setPolicyNameSearchText(value)
          }
        >
          {({ item }) => (
            <DropdownItem key={item.guid} onClick={() => onPolicyChange(item)}>
              {item.name}
            </DropdownItem>
          )}
        </Dropdown>
      ) : (
        <Dropdown
          className="entity-type-filter"
          title={entityTypeTitle}
          items={filteredEntityTypes}
          search={entityTypeSearchText}
          onSearch={({ target: { value = '' } = {} } = {}) =>
            setEntityTypeSearchText(value)
          }
        >
          {({ item }) => (
            <DropdownItem
              key={`${item.domain}_${item.type}`}
              onClick={() => entityTypeChangeHandler(item)}
            >
              {`${item.displayName} (${item.count})`}
            </DropdownItem>
          )}
        </Dropdown>
      )}
    </div>
  );
};

Filters.propTypes = {
  currentTab: PropTypes.string,
  accountId: PropTypes.any,
  entityTypeTitle: PropTypes.string,
  entityTypes: PropTypes.array,
  selectedPolicyText: PropTypes.string,
  policies: PropTypes.array,
  onAccountChange: PropTypes.func,
  onEntityTypeChange: PropTypes.func,
  onPolicyChange: PropTypes.func,
  searchText: PropTypes.string,
  setSearchText: PropTypes.func,
};

export default Filters;
