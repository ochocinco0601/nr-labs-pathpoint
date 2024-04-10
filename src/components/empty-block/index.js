import React from 'react';
import PropTypes from 'prop-types';

import { BlockText, Button, HeadingText, Icon } from 'nr1';

const EmptyBlock = ({
  title = '',
  description = '',
  actionButtonText = '',
  onAdd,
  fullWidth,
}) => (
  <div className={`empty-block ${fullWidth ? 'full-width' : ''}`}>
    <Icon
      className="icon"
      type={Icon.TYPE.INTERFACE__PLACEHOLDERS__ICON_PLACEHOLDER}
    />
    <HeadingText className="title">{title}</HeadingText>
    <BlockText className="description">{description}</BlockText>
    <div className="action">
      <Button
        className="button-tertiary-border"
        variant={Button.VARIANT.TERTIARY}
        sizeType={Button.SIZE_TYPE.SMALL}
        iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS__V_ALTERNATE}
        onClick={onAdd}
      >
        {actionButtonText}
      </Button>
    </div>
  </div>
);

EmptyBlock.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  actionButtonText: PropTypes.string,
  onAdd: PropTypes.func,
  fullWidth: PropTypes.bool,
};

export default EmptyBlock;
