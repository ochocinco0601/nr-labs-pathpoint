import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Icon, Popover, PopoverTrigger, PopoverBody } from 'nr1';
import { EditInPlace } from '@newrelic/nr-labs-components';

import IconsLib from '../icons-lib';
import ImageUploadModal from '../image-upload-modal';
import { MODES } from '../../constants';

const FlowHeader = ({
  name = 'Flow',
  imageUrl,
  onUpdate,
  onClose,
  mode = MODES.KIOSK,
}) => {
  const [imageModalHidden, setImageModalHidden] = useState(true);

  return mode === MODES.EDIT ? (
    <div className="flow-header">
      <div className="back" onClick={onClose}>
        <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT} />
      </div>
      <div
        className="logo-image edit"
        onClick={() => setImageModalHidden(false)}
      >
        <IconsLib type={IconsLib.TYPES.CAMERA} />
      </div>
      <HeadingText type={HeadingText.TYPE.HEADING_4}>
        <EditInPlace
          value={name}
          setValue={(newName) =>
            name !== newName && onUpdate ? onUpdate({ name: newName }) : null
          }
        />
      </HeadingText>
      <ImageUploadModal
        imageUrl={imageUrl}
        hidden={imageModalHidden}
        onChange={(newImageUrl) =>
          newImageUrl !== imageUrl && onUpdate
            ? onUpdate({ imageUrl: newImageUrl })
            : null
        }
        onClose={() => setImageModalHidden(true)}
      />
    </div>
  ) : (
    <div className="flow-header">
      <div className="back" onClick={onClose}>
        <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT} />
      </div>
      <Popover openOnHover={true}>
        <PopoverTrigger>
          <div className="flow-heading">
            {imageUrl ? (
              <div className="logo-image">
                <img src={imageUrl} />
              </div>
            ) : null}
            <HeadingText type={HeadingText.TYPE.HEADING_4}>{name}</HeadingText>
            <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM} />
          </div>
        </PopoverTrigger>
        <PopoverBody>
          <div className="flow-listing-dropdown">
            {/* TODO: flow list drop down goes here */}
          </div>
        </PopoverBody>
      </Popover>
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
