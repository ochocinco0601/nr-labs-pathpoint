import React from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Icon } from 'nr1';
import { EditInPlace } from '@newrelic/nr-labs-components';

import { MODES } from '../../constants';

const FlowHeader = ({
  name = 'Flow',
  imageUrl,
  onUpdate,
  onClose,
  mode = MODES.KIOSK,
}) => {
  return (
    <div className="flow-header">
      <div className="back" onClick={onClose}>
        <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT} />
      </div>
      {imageUrl ? (
        <div className="image"><img src={imageUrl} /></div>
      ) : null}
      <HeadingText type={HeadingText.TYPE.HEADING_4}>
        {mode === MODES.EDIT ? (
          <EditInPlace value={name} setValue={null} />
        ) : (
          name
        )}
      </HeadingText>
    </div>
  );
};

FlowHeader.propTypes = {
  name: PropTypes.string,
  imageUrl: PropTypes.string,
  onUpdate: PropTypes.func,
  onClose: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default FlowHeader;
