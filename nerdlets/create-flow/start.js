import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { AutoSizer, HeadingText, Icon } from 'nr1';

import BlankFlowImg from './images/blank.svg';
import ImportImg from './images/import.svg';

const StartPage = ({ onSelect }) => {
  const [blankImgSize, setBlankImgSize] = useState({});

  return (
    <div className="content">
      <div className="create-flow-card" onClick={() => onSelect('blank')}>
        <div className="header">
          <div className="title">
            <Icon type={Icon.TYPE.INTERFACE__SIGN__PLUS} />
            <HeadingText type={HeadingText.TYPE.HEADING_2}>
              Blank flow
            </HeadingText>
          </div>
          <div className="sub-title">Create your flow from scratch</div>
        </div>
        <div className="main">
          <div className="create-flow-card-content">
            <AutoSizer onResize={setBlankImgSize}>
              {() => <img src={BlankFlowImg} alt="blank flow" />}
            </AutoSizer>
          </div>
        </div>
      </div>
      <div className="create-flow-card" onClick={() => onSelect('import')}>
        <div className="header">
          <div className="title">
            <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__IMPORT} />
            <HeadingText type={HeadingText.TYPE.HEADING_2}>Import</HeadingText>
          </div>
          <div className="sub-title">Import a file from your computer</div>
        </div>
        <div className="main">
          <div className="create-flow-card-content" style={blankImgSize}>
            <div>
              <img src={ImportImg} alt="import flow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

StartPage.propTypes = {
  onSelect: PropTypes.func,
};

export default StartPage;
