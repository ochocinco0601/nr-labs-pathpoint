import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  DataTable,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableRowCell,
  EmptyState,
} from 'nr1';
import { SIGNAL_TYPES, UI_CONTENT } from '../../src/constants';

const emptyState = (hasNoSignals) =>
  hasNoSignals ? (
    <EmptyState
      fullHeight
      fullWidth
      iconType={EmptyState.ICON_TYPE.INTERFACE__STATE__CRITICAL}
      title={UI_CONTENT.SIGNAL_SELECTION.SIGNALS_NOT_FOUND.TITLE}
      description={UI_CONTENT.SIGNAL_SELECTION.SIGNALS_NOT_FOUND.DESCRIPTION}
    />
  ) : (
    <EmptyState
      fullHeight
      fullWidth
      title={UI_CONTENT.SIGNAL_SELECTION.SIGNALS_LOADING}
      type={EmptyState.TYPE.LOADING}
    />
  );

const ListingTable = ({
  type,
  entities = [],
  alerts = [],
  selectedEntities = [],
  selectedAlerts = [],
  rowCount,
  onLoadMore,
  onSelect,
}) => {
  const [selection, setSelection] = useState({});
  const selectionsSet = useRef();

  useEffect(() => {
    let selectedItems, sel;
    if (type === SIGNAL_TYPES.ENTITY) selectedItems = selectedEntities;
    if (type === SIGNAL_TYPES.ALERT) selectedItems = selectedAlerts;
    const selectionLookup = selectedItems.reduce(
      (acc, { guid }) => ({ ...acc, [guid]: true }),
      {}
    );
    const selectionReducer = (acc, { guid }, idx) =>
      selectionLookup[guid] ? { ...acc, [idx]: true } : acc;
    if (type === SIGNAL_TYPES.ENTITY)
      sel = entities.reduce(selectionReducer, {});
    if (type === SIGNAL_TYPES.ALERT) sel = alerts.reduce(selectionReducer, {});
    if (sel) {
      setSelection(sel);
      selectionsSet.current = new Set(Object.keys(sel));
    }
  }, [type, entities, alerts, selectedEntities, selectedAlerts]);

  const itemSelectionHandler = useCallback(
    (sel) => {
      const curSelectionsSet = new Set(Object.keys(sel));
      const added = curSelectionsSet.difference(selectionsSet.current);
      const removed = selectionsSet.current.difference(curSelectionsSet);
      selectionsSet.current = curSelectionsSet;
      let items = [];
      if (type === SIGNAL_TYPES.ENTITY) items = entities;
      if (type === SIGNAL_TYPES.ALERT) items = alerts;
      if (added.size === 1) {
        onSelect?.(type, true, items[added.keys().next().value]);
      } else if (removed.size === 1) {
        onSelect?.(type, false, items[removed.keys().next().value]);
      }
    },
    [type, entities, alerts, onSelect]
  );

  if (
    (type === SIGNAL_TYPES.ALERT && !alerts.length) ||
    (type === SIGNAL_TYPES.ENTITY && !entities.length)
  )
    return emptyState();

  if (type === SIGNAL_TYPES.ENTITY)
    return (
      <div className="data-table">
        <DataTable
          ariaLabel="Entities"
          items={entities}
          height={`${entities.length}rows`}
          itemCount={rowCount}
          onLoadMoreItems={onLoadMore}
          selectionType={DataTable.SELECTION_TYPE.MULTIPLE}
          selection={selection}
          onSelectionChange={itemSelectionHandler}
        >
          <DataTableHeader>
            <DataTableHeaderCell name="name" value="name">
              Name
            </DataTableHeaderCell>
            <DataTableHeaderCell name="type" value="type">
              Entity type
            </DataTableHeaderCell>
          </DataTableHeader>
          <DataTableBody>
            {() => (
              <DataTableRow>
                <DataTableRowCell />
                <DataTableRowCell />
              </DataTableRow>
            )}
          </DataTableBody>
        </DataTable>
      </div>
    );

  if (type === SIGNAL_TYPES.ALERT)
    return (
      <div className="data-table">
        <DataTable
          ariaLabel="Alert conditions"
          items={alerts}
          height={`${alerts.length}rows`}
          selectionType={DataTable.SELECTION_TYPE.MULTIPLE}
          selection={selection}
          onSelectionChange={itemSelectionHandler}
        >
          <DataTableHeader>
            <DataTableHeaderCell name="condition" value="name">
              Condition
            </DataTableHeaderCell>
            <DataTableHeaderCell name="policy" value="policyName">
              Policy
            </DataTableHeaderCell>
          </DataTableHeader>
          <DataTableBody>
            {() => (
              <DataTableRow>
                <DataTableRowCell />
                <DataTableRowCell />
              </DataTableRow>
            )}
          </DataTableBody>
        </DataTable>
      </div>
    );

  return emptyState();
};

ListingTable.propTypes = {
  type: PropTypes.oneOf([SIGNAL_TYPES.ALERT, SIGNAL_TYPES.ENTITY]),
  entities: PropTypes.array,
  alerts: PropTypes.array,
  selectedEntities: PropTypes.array,
  selectedAlerts: PropTypes.array,
  rowCount: PropTypes.number,
  onLoadMore: PropTypes.func,
  onSelect: PropTypes.func,
};

export default ListingTable;
