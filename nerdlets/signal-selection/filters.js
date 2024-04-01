import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { AccountPicker, Dropdown, DropdownItem, TextField } from 'nr1';

import { SIGNAL_TYPES } from '../../src/constants';

const Filters = ({
  currentTab,
  accountId,
  entityTypeTitle,
  entityTypes,
  onAccountChange,
  onEntityTypeChange,
  searchText,
  setSearchText,
}) => {
  const [entityTypeSearchText, setEntityTypeSearchText] = useState('');

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
      {currentTab === SIGNAL_TYPES.ENTITY ? (
        <Dropdown
          className="entity-type-filter"
          title={entityTypeTitle}
          items={filteredEntityTypes}
          search={entityTypeSearchText}
          onSearch={({ target: { value } = {} } = {}) =>
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
      ) : null}
    </div>
  );
};

Filters.propTypes = {
  currentTab: PropTypes.string,
  accountId: PropTypes.any,
  entityTypeTitle: PropTypes.string,
  entityTypes: PropTypes.array,
  onAccountChange: PropTypes.func,
  onEntityTypeChange: PropTypes.func,
  searchText: PropTypes.string,
  setSearchText: PropTypes.func,
};

export default Filters;
