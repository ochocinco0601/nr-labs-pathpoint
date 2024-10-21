import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  DataTable,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableRowCell,
} from 'nr1';

const TableWrapper = ({
  entities = [],
  rowCount,
  onLoadMore,
  height,
  selection,
  itemSelectionHandler,
}) => {
  const itemDetailsValue = useCallback(
    ({ domain, type: itemType, policyName }) => {
      if (domain === 'AIOPS' && itemType === 'CONDITION') return policyName;
      return `${domain} / ${itemType}`;
    },
    []
  );

  return (
    <DataTable
      ariaLabel="Signals"
      items={entities}
      itemCount={rowCount}
      onLoadMoreItems={onLoadMore}
      height={height}
      selectionType={DataTable.SELECTION_TYPE.MULTIPLE}
      selection={selection}
      onSelectionChange={itemSelectionHandler}
    >
      <DataTableHeader>
        <DataTableHeaderCell name="name" value="name">
          Name
        </DataTableHeaderCell>
        <DataTableHeaderCell name="details" value={itemDetailsValue}>
          Entity type or Policy name
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
  );
};

TableWrapper.propTypes = {
  entities: PropTypes.array,
  rowCount: PropTypes.number,
  onLoadMore: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selection: PropTypes.object,
  itemSelectionHandler: PropTypes.func,
};

export default TableWrapper;
