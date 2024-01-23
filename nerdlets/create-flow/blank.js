import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText, TextField } from 'nr1';

import { Select } from '../../src/components';
import { REFRESH_INTERVALS } from '../../src/constants';

const BlankFlow = ({ accountId, accounts = [], onCreate, onCancel }) => {
  const [flowName, setFlowName] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState();
  const [selectedRefreshInterval, setSelectedRefreshInterval] = useState(
    REFRESH_INTERVALS[0]
  );

  useEffect(() => {
    if (!selectedAccountId) setSelectedAccountId(accountId);
  }, [accountId, selectedAccountId]);

  const accountsSelect = useMemo(
    () =>
      accounts.reduce(
        (acc, { id, name }) => {
          if (selectedAccountId === id) acc.selected = { id, name };

          acc.items.push({
            id,
            selected: selectedAccountId === id,
            option: (
              <div className="account-picker-option">
                <span>{name}</span>
                <span>{id}</span>
              </div>
            ),
          });

          return acc;
        },
        { items: [], selected: null }
      ),
    [accounts, selectedAccountId]
  );

  const createHandler = () => {
    if (!onCreate) return;
    const doc = {
      name: flowName,
      refreshInterval: selectedRefreshInterval.value,
      stages: [],
      kpis: [],
    };
    onCreate(selectedAccountId, doc);
  };

  const refreshIntervalItems = useMemo(
    () =>
      REFRESH_INTERVALS.map(({ value, label }) => ({
        value,
        label,
        selected: value === selectedRefreshInterval.value,
        option: label,
      })),
    [selectedRefreshInterval]
  );

  return (
    <div className="content details">
      <div>
        <div className="flow-subtitle">Create blank flow</div>
        <HeadingText type={HeadingText.TYPE.HEADING_4}>
          Flow information
        </HeadingText>
      </div>

      <div className="account-picker">
        <Select
          title={accountsSelect.selected?.name}
          label="Select your account"
          items={accountsSelect.items}
          onSelect={({ id }) => setSelectedAccountId(id)}
        />
      </div>
      <TextField
        label="Flow name"
        placeholder="Untitled"
        value={flowName}
        onChange={({ target: { value } = {} } = {}) => setFlowName(value)}
      />
      <div className="refresh-interval-picker">
        <Select
          title={selectedRefreshInterval.label}
          label="Refresh data every"
          items={refreshIntervalItems}
          onSelect={({ value, label }) =>
            setSelectedRefreshInterval({ value, label })
          }
        />
      </div>
      <div className="button-bar">
        <Button type={Button.TYPE.TERTIARY} onClick={onCancel}>
          Back
        </Button>
        <Button
          type={Button.TYPE.PRIMARY}
          disabled={!flowName}
          onClick={createHandler}
        >
          Create
        </Button>
      </div>
    </div>
  );
};

BlankFlow.propTypes = {
  accountId: PropTypes.number,
  accounts: PropTypes.array,
  onCreate: PropTypes.func,
  onCancel: PropTypes.func,
};

export default BlankFlow;
