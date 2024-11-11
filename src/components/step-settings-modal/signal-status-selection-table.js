import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  AutoSizer,
  DataTable,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableRowCell,
} from 'nr1';

import { IconsLib } from '../';
import { SIGNAL_TYPES } from '../../constants';

const SignalStatusSelectionTable = ({ signals = [], onChange }) => {
  const [selection, setSelection] = useState({});

  useEffect(
    () =>
      setSelection(() =>
        (signals || []).reduce(
          (acc, { included }, i) => (included ? { ...acc, [i]: true } : acc),
          []
        )
      ),
    [signals]
  );

  return (
    <AutoSizer>
      {({ height }) => (
        <DataTable
          ariaLabel="Signals"
          items={signals}
          height={height}
          selectionType={DataTable.SELECTION_TYPE.MULTIPLE}
          selection={selection}
          onSelectionChange={onChange}
        >
          <DataTableHeader>
            <DataTableHeaderCell
              name="name"
              value={({ name, status, type }) => (
                <div className="included-signal">
                  <IconsLib
                    className={`icons-lib ${status}`}
                    type={
                      type === SIGNAL_TYPES.ALERT
                        ? IconsLib.TYPES.ALERT
                        : IconsLib.TYPES.ENTITY
                    }
                    shouldShowTitle={false}
                  />
                  <span title={name}>{name}</span>
                </div>
              )}
            >
              Signal
            </DataTableHeaderCell>
          </DataTableHeader>
          <DataTableBody>
            {() => (
              <DataTableRow>
                <DataTableRowCell />
              </DataTableRow>
            )}
          </DataTableBody>
        </DataTable>
      )}
    </AutoSizer>
  );
};

SignalStatusSelectionTable.propTypes = {
  signals: PropTypes.array,
  onChange: PropTypes.func,
};

export default SignalStatusSelectionTable;
