import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  HeadingText,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverBody,
} from 'nr1';
import { EditInPlace } from '@newrelic/nr-labs-components';

import IconsLib from '../icons-lib';
import { FlowListDropdown } from '../';
import ImageUploadModal from '../image-upload-modal';
import { MODES, UI_CONTENT } from '../../constants';

const FlowHeader = ({
  name = 'Flow',
  imageUrl,
  onUpdate,
  onClose,
  mode = MODES.INLINE,
  setMode = () => null,
  flows = [],
  onSelectFlow = () => null,
  onDeleteFlow = () => null,
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
        {imageUrl ? (
          <img src={imageUrl} />
        ) : (
          <IconsLib type={IconsLib.TYPES.CAMERA} />
        )}
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
      <Button
        type={Button.TYPE.PRIMARY}
        iconType={Icon.TYPE.INTERFACE__SIGN__CHECKMARK}
        sizeType={Button.SIZE_TYPE.SMALL}
        onClick={() => setMode(MODES.INLINE)}
      >
        {UI_CONTENT.GLOBAL.BUTTON_LABEL_EXIT_EDIT_MODE}
      </Button>
            <Button
        type={Button.TYPE.DESTRUCTIVE}
        iconType={Icon.TYPE.INTERFACE__OPERATIONS__TRASH}
        sizeType={Button.SIZE_TYPE.SMALL}
        onClick={() => onDeleteFlow()}
      >
        {UI_CONTENT.GLOBAL.BUTTON_LABEL_DELETE_FLOW}
      </Button>
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
            <FlowListDropdown flows={flows} onSelectFlow={onSelectFlow} />
          </div>
        </PopoverBody>
      </Popover>
      <Button
        type={Button.TYPE.PRIMARY}
        iconType={Icon.TYPE.INTERFACE__OPERATIONS__EDIT}
        sizeType={Button.SIZE_TYPE.SMALL}
        onClick={() => setMode(MODES.EDIT)}
      >
        {UI_CONTENT.GLOBAL.BUTTON_LABEL_EDIT_MODE}
      </Button>
    </div>
  );
};

FlowHeader.propTypes = {
  name: PropTypes.string,
  imageUrl: PropTypes.string,
  onUpdate: PropTypes.func,
  onClose: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
  setMode: PropTypes.func,
  flows: PropTypes.array,
  onSelectFlow: PropTypes.func,
  onDeleteFlow: PropTypes.func,
};

export default FlowHeader;
