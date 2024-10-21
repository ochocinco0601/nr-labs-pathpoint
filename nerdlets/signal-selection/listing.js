import React from 'react';
import PropTypes from 'prop-types';

import { Badge, HeadingText } from 'nr1';

import ListingTable from './listing-table';
import { Signal } from '../../src/components';
import { MODES, SIGNAL_TYPES, STATUSES } from '../../src/constants';
import { signalStatus } from '../../src/utils';

const Listing = ({
  currentTab,
  entities = [],
  selectedEntities = [],
  selectedAlerts = [],
  rowCount,
  isLoading,
  onLoadMore,
  onSelect,
  onDelete,
}) => {
  return (
    <div className="listing">
      <ListingTable
        type={currentTab}
        entities={entities}
        selectedItems={
          currentTab === SIGNAL_TYPES.ALERT ? selectedAlerts : selectedEntities
        }
        rowCount={rowCount}
        onLoadMore={onLoadMore}
        onSelect={onSelect}
        isLoading={isLoading}
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
          </div>
          <div className="list">
            {selectedEntities.map(({ name, guid, alertSeverity }) => (
              <Signal
                key={guid}
                name={name}
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
                name={name}
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
  selectedEntities: PropTypes.array,
  selectedAlerts: PropTypes.array,
  rowCount: PropTypes.number,
  isLoading: PropTypes.bool,
  onLoadMore: PropTypes.func,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
};

export default Listing;
