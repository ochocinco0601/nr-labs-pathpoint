import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { TextField } from 'nr1';

const FlowList = ({ flows = [], onClick = () => null }) => {
  const [searchPattern, setSearchPattern] = useState('');
  const [filteredFlows, setFilteredFlows] = useState([]);

  useEffect(() => {
    console.log('### useEffect().flows: ', flows);
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

  const shape = useCallback((stage) => {
    switch (stage.source + stage.target * 2) {
      case 1: return 'has-source';
      case 2: return 'has-target';
      case 3: return 'has-source has-target';
      default: return 'has-none';
    }
  }, []);

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
        <div className="flowlist-content">
          {filteredFlows.map((flow, flowIndex) => (
            <div
              key={`flow-${flowIndex}`}
              className="row"
              onClick={() => {
                console.log('FlowList: ', flowIndex, ' >>> ', flows[flowIndex].id)
                onClick(flows[flowIndex].id)
              }}
            >
              <div className="cell cell col-1-format flow-name">
                {flow.document.name}
              </div>
              <div className="cell col-2-format stage-names">
                {flow.document.stages.map((stage, index) => {
                  // let shape = '';
                  // switch (stage.source + stage.target * 2) {
                  //   case 1:
                  //     shape = 'has-source';
                  //     break;
                  //   case 2:
                  //     shape = 'has-target';
                  //     break;
                  //   case 3:
                  //     shape = 'has-source has-target';
                  //     break;
                  //   default:
                  //     shape = 'has-none';
                  // }
                  return (
                    <div key={`stage-${index}`} className={`stage-name ${shape(stage)}`} title={stage.name}>
                      <div className="name-text">{stage.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

FlowList.propTypes = {
  flows: PropTypes.array,
  onClick: PropTypes.func,
};

export default FlowList;
