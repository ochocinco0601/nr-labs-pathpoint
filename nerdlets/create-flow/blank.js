import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText, InlineMessage, TextField } from 'nr1';

import { Select } from '../../src/components';
import { REFRESH_INTERVALS } from '../../src/constants';

const BlankFlow = ({ accountId, accountName, onCreate, onCancel }) => {
  const [flowName, setFlowName] = useState('');
  const [selectedRefreshInterval, setSelectedRefreshInterval] = useState(
    REFRESH_INTERVALS[0]
  );

  const createHandler = () => {
    if (!onCreate) return;
    const doc = {
      name: flowName,
      refreshInterval: selectedRefreshInterval.value,
      stages: [],
      kpis: [],
    };
    onCreate(accountId, doc);
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
    <div className="content details slim">
      <div>
        <div className="flow-subtitle">Create blank flow</div>
        <HeadingText type={HeadingText.TYPE.HEADING_4}>
          Flow information
        </HeadingText>
      </div>
      <InlineMessage
        className="account-inline-message"
        label={
          <>
            This flow will be created in <strong>{accountName}</strong>. To
            change the account, close this overlay and change the account
            selected in the account dropdown.
          </>
        }
      />
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
  accountName: PropTypes.string,
  onCreate: PropTypes.func,
  onCancel: PropTypes.func,
};

export default BlankFlow;
