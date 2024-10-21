import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { AutoSizer, EmptyState } from 'nr1';
import { SIGNAL_TYPES, UI_CONTENT } from '../../src/constants';
import TableWrapper from './table-wrapper';

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
  selectedItems = [],
  rowCount,
  onLoadMore,
  onSelect,
  isLoading,
}) => {
  const [selection, setSelection] = useState({});
  const selectionsSet = useRef();

  useEffect(() => {
    const selectionLookup = selectedItems.reduce(
      (acc, { guid }) => ({ ...acc, [guid]: true }),
      {}
    );
    const sel = entities.reduce(
      (acc, { guid }, idx) =>
        selectionLookup[guid] ? { ...acc, [idx]: true } : acc,
      {}
    );
    if (sel) {
      setSelection(sel);
      selectionsSet.current = new Set(Object.keys(sel));
    }
  }, [entities, selectedItems]);

  const itemSelectionHandler = useCallback(
    (sel) => {
      const curSelectionsSet = new Set(Object.keys(sel));
      const added = curSelectionsSet.difference(selectionsSet.current);
      const removed = selectionsSet.current.difference(curSelectionsSet);
      selectionsSet.current = curSelectionsSet;
      const items = entities;
      if (added.size === 1) {
        onSelect?.(type, true, items[added.keys().next().value]);
      } else if (removed.size === 1) {
        onSelect?.(type, false, items[removed.keys().next().value]);
      }
      if (added.size > 1) {
        items.map((i) => {
          onSelect?.(type, true, i);
        });
      } else if (removed.size > 1) {
        items.map((i) => {
          onSelect?.(type, false, i);
        });
      }
    },
    [type, entities, onSelect]
  );

  return !entities.length && !isLoading ? (
    emptyState(true)
  ) : (
    <div className="data-table">
      <AutoSizer>
        {({ height }) => (
          <TableWrapper
            entities={entities}
            rowCount={rowCount}
            onLoadMore={onLoadMore}
            height={height}
            selection={selection}
            itemSelectionHandler={itemSelectionHandler}
          />
        )}
      </AutoSizer>
    </div>
  );
};

ListingTable.propTypes = {
  type: PropTypes.oneOf([SIGNAL_TYPES.ALERT, SIGNAL_TYPES.ENTITY]),
  entities: PropTypes.array,
  selectedItems: PropTypes.array,
  rowCount: PropTypes.number,
  onLoadMore: PropTypes.func,
  onSelect: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default ListingTable;
