import React, { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { TextField } from 'nr1';

import { getStageHeaderShape } from '../../utils';

const FlowList = forwardRef(({ flows = [], onClick = () => null }, ref) => {
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
    <div className="flows-container">
      <div id="search-bar">
        <TextField
          className="search-bar"
          type={TextField.TYPE.SEARCH}
          placeholder={'Search for Flow'}
          onChange={(evt) => {
            setSearchPattern(evt.target.value);
          }}
        />
      </div>

      <div className="flowlist-container">
        <div className="flowlist-header">
          <div className="row">
            <div className="cell col-1-format">Flow</div>
            <div className="cell col-2-format">Stages</div>
          </div>
        </div>
        <div className="flowlist-content" ref={ref}>
          {filteredFlows.map((flow, flowIndex) => (
            <div
              key={`flow-${flowIndex}`}
              className="row body"
              onClick={() => {
                onClick(flow.id);
              }}
            >
              <div className="cell cell col-1-format flow-name">
                {flow.document.name}
              </div>
              <div className="cell col-2-format stage-names">
                {flow.document.stages.map((stage, index) => (
                  <div
                    key={`stage-${index}`}
                    className={`stage-name ${getStageHeaderShape(stage)}`}
                    title={stage.name}
                  >
                    <div className="name-text">{stage.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

FlowList.propTypes = {
  flows: PropTypes.array,
  onClick: PropTypes.func,
};

FlowList.displayName = 'FlowList';

export default FlowList;
