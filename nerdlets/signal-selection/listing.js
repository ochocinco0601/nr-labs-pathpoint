import React from 'react';
import PropTypes from 'prop-types';

import { Badge, Button, HeadingText } from 'nr1';

import ListingTable from './listing-table';
import { Signal } from '../../src/components';
import { MODES, SIGNAL_TYPES, STATUSES } from '../../src/constants';
import { signalStatus } from '../../src/utils';

const Listing = ({
  currentTab,
  entities = [],
  alerts = [],
  selectedEntities = [],
  selectedAlerts = [],
  signalsDetails = {},
  rowCount,
  onLoadMore,
  onSelect,
  onDelete,
}) => {
  return (
    <div className="listing">
      <ListingTable
        type={currentTab}
        entities={entities}
        alerts={alerts}
        selectedEntities={selectedEntities}
        selectedAlerts={selectedAlerts}
        rowCount={rowCount}
        onLoadMore={onLoadMore}
        onSelect={onSelect}
      />
      <div className="selection">
        <HeadingText type={HeadingText.TYPE.HEADING_4}>
          Selected signals
        </HeadingText>
        <div className="selected">
          <div className="title">
            <HeadingText type={HeadingText.TYPE.HEADING_6}>
              Entities
            </HeadingText>
            <Badge>{`${selectedEntities.length}/25`}</Badge>
            <Button
              type={Button.TYPE.SECONDARY}
              sizeType={Button.SIZE_TYPE.SMALL}
              iconType={
                Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__WORKLOADS
              }
              disabled={true}
            >
              Convert to workload
            </Button>
          </div>
          <div className="list">
            {selectedEntities.map(({ name, guid, alertSeverity }) => (
              <Signal
                key={guid}
                name={signalsDetails[guid]?.name || name}
                status={signalStatus({
                  type: SIGNAL_TYPES.ENTITY,
                  alertSeverity,
                })}
                mode={MODES.EDIT}
                onDelete={() => onDelete(SIGNAL_TYPES.ENTITY, guid)}
              />
            ))}
          </div>
          <hr className="rule" />
          <div className="title">
            <HeadingText type={HeadingText.TYPE.HEADING_6}>Alerts</HeadingText>
            <Badge>{`${selectedAlerts.length}/25`}</Badge>
          </div>
          <div className="list">
            {selectedAlerts.map(({ name, guid }) => (
              <Signal
                key={guid}
                name={signalsDetails[guid]?.name || name}
                type={SIGNAL_TYPES.ALERT}
                status={STATUSES.UNKNOWN}
                mode={MODES.EDIT}
                onDelete={() => onDelete(SIGNAL_TYPES.ALERT, guid)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Listing.propTypes = {
  currentTab: PropTypes.string,
  entities: PropTypes.array,
  alerts: PropTypes.array,
  selectedEntities: PropTypes.array,
  selectedAlerts: PropTypes.array,
  signalsDetails: PropTypes.object,
  rowCount: PropTypes.number,
  onLoadMore: PropTypes.func,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
};

export default Listing;
