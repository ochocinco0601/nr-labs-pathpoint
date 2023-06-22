import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

const FlowListDropdown = ({ flows = [], onClick = () => null }) => {
  const [searchPattern, setSearchPattern] = useState('');
  const [filteredFlows, setFilteredFlows] = useState([]);

  useEffect(() => {
    setFilteredFlows(
      flows.length && searchPattern
        ? flows.filter((item) =>
            `${item.document.name} ${item.document.stages
              .map((s) => s.name)
              .join(' ')}`
              .toLowerCase()
              .includes(searchPattern.toLowerCase())
          )
        : flows
    );
  }, [searchPattern]);

  return (
    <div className="flowlist-pulldown">
      <div className="flowlist-search-bar">
        <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__SEARCH} />
        <input
          style={{ backgroundColor: '#ffffff' }}
          placeholder={'Search for Flow'}
          onChange={(evt) => {
            setSearchPattern(evt.target.value);
          }}
        />
      </div>

      <div className="flowlist-pulldown-content">
        {filteredFlows.map((flow, flowIndex) => (
          <div
            key={`flow-${flowIndex}`}
            className="flowlist-row"
            onClick={() => {
              onClick(flow.id);
            }}
          >
            {flow.document.imageUrl ? (
              <img src={flow.document.imageUrl} />
            ) : (
              <img
                src={
                  'https://raw.githubusercontent.com/newrelic/nr1-pathpoint/main/icon.png'
                }
              />
            )}
            {flow.document.name}
          </div>
        ))}
      </div>
    </div>
  );
};

FlowListDropdown.propTypes = {
  flows: PropTypes.array,
  onClick: PropTypes.func,
};

export default FlowListDropdown;
