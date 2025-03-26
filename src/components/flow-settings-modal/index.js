import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { BlockText, Button, HeadingText, TextField } from 'nr1';

import Modal from '../modal';
import { AppContext } from '../../contexts';
import { validRefreshInterval } from '../../utils';
import { REFRESH_INTERVALS } from '../../constants';

const DEFAULT_REFRESH_INTERVAL_VALUE = REFRESH_INTERVALS[0].value;

const EditFlowSettingsModal = ({
  flow,
  onUpdate,
  onDeleteFlow,
  editFlowSettings = false,
  setEditFlowSettings,
}) => {
  const { account } = useContext(AppContext);
  const [updatedName, setupdatedName] = useState('');
  const [updatedRefreshInterval, setupdatedRefreshInterval] = useState(
    DEFAULT_REFRESH_INTERVAL_VALUE
  );

  useEffect(() => {
    if (!flow) return;
    const { name: flowName = '', refreshInterval: flowRefreshInterval } = flow;
    setupdatedName(flowName);
    setupdatedRefreshInterval(validRefreshInterval(flowRefreshInterval));
  }, [flow]);

  const closeHandler = (action) => {
    switch (action) {
      case 'update':
        if (
          (updatedName !== flow?.name ||
            updatedRefreshInterval !== flow?.refreshInterval) &&
          onUpdate
        ) {
          onUpdate({
            name: updatedName,
            refreshInterval: Number(updatedRefreshInterval),
          });
        }
        break;

      case 'delete':
        onDeleteFlow?.();
    }

    setEditFlowSettings?.(false);
  };

  return (
    <Modal hidden={!editFlowSettings} onClose={closeHandler}>
      <div>
        <HeadingText type={HeadingText.TYPE.HEADING_1}>Settings</HeadingText>
        <div className="entry-form">
          <div>
            <TextField
              className="flow-name"
              label="Flow name"
              value={updatedName}
              onChange={(e) => setupdatedName(e?.target?.value)}
            />
          </div>
          <div>
            <label>Created by</label>
            <BlockText className="attribute">
              {flow.created.user.email}
            </BlockText>
          </div>
          <div>
            <label>Account</label>
            <BlockText className="attribute">{`${account.id || ''} - ${
              account.name || ''
            }`}</BlockText>
          </div>
          <div>
            <label>Flow ID</label>
            <BlockText className="attribute">{flow.id || 'unknown'}</BlockText>
          </div>
          <div>
            <label htmlFor="refresh-interval-select">Refresh data every</label>
            <div>
              <select
                className="refresh-interval"
                id="refresh-interval-select"
                value={updatedRefreshInterval}
                onChange={(e) =>
                  setupdatedRefreshInterval(
                    e?.target?.value || DEFAULT_REFRESH_INTERVAL_VALUE
                  )
                }
              >
                {REFRESH_INTERVALS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="buttons-bar">
          <Button
            type={Button.TYPE.DESTRUCTIVE}
            onClick={() => closeHandler('delete')}
          >
            Delete
          </Button>
          <div className="right">
            <Button onClick={() => closeHandler('cancel')}> Cancel </Button>
            <Button
              type={Button.TYPE.PRIMARY}
              onClick={() => closeHandler('update')}
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

EditFlowSettingsModal.propTypes = {
  flow: PropTypes.object,
  onUpdate: PropTypes.func,
  onDeleteFlow: PropTypes.func,
  editFlowSettings: PropTypes.bool,
  setEditFlowSettings: PropTypes.func,
};

export default EditFlowSettingsModal;
