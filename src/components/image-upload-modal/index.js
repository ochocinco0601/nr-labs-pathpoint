import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { BlockText, Button, HeadingText, Icon, Modal, TextField } from 'nr1';

const ImageUploadModal = ({ imageUrl, hidden = true, onChange, onClose }) => {
  const [urlText, setUrlText] = useState('');
  const [validImageUrl, setValidImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setUrlText(imageUrl);
    if (imageUrl) checkImageHandler(imageUrl);
  }, [imageUrl]);

  const checkImageHandler = useCallback((imgUrl) => {
    setImageError(false);
    if (imgUrl) {
      const image = new Image();
      image.onload = () => {
        setValidImageUrl(imgUrl);
      };
      image.onerror = () => {
        setValidImageUrl('');
        setImageError(true);
      };
      image.src = imgUrl;
    } else {
      setValidImageUrl('');
    }
  }, []);

  const saveImageHandler = useCallback(() => {
    if (onChange) onChange(validImageUrl);
    if (onClose) onClose();
  }, [validImageUrl]);

  const closeHandler = useCallback(() => {
    if (onClose) onClose();
  }, []);

  return (
    <Modal hidden={hidden} onClose={closeHandler}>
      <div className="image-upload-modal">
        <div className="modal-content">
          <HeadingText type={HeadingText.TYPE.HEADING_3}>
            Upload image
          </HeadingText>
          <HeadingText type={HeadingText.TYPE.HEADING_6}>
            Image preview
          </HeadingText>
          <div className="image-preview">
            {validImageUrl ? (
              <img src={validImageUrl} />
            ) : (
              <div className="no-image">
                <span className="blank-icon">
                  <Icon
                    type={Icon.TYPE.INTERFACE__PLACEHOLDERS__ICON_PLACEHOLDER}
                  />
                </span>
                {imageError ? (
                  <HeadingText
                    type={HeadingText.TYPE.HEADING_6}
                    style={{ color: '#DF2D24' }}
                  >
                    Image not found
                  </HeadingText>
                ) : (
                  <>
                    <HeadingText type={HeadingText.TYPE.HEADING_6}>
                      No image yet
                    </HeadingText>
                    <BlockText>Upload using a URL</BlockText>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="upload-image">
            <TextField
              placeholder="Paste image link"
              value={urlText}
              onChange={({ target: { value = '' } = {} }) => setUrlText(value)}
            />
            <Button
              type={Button.TYPE.PRIMARY}
              sizeType={Button.SIZE_TYPE.SMALL}
              onClick={() => checkImageHandler(urlText)}
            >
              Upload
            </Button>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            type={Button.TYPE.PRIMARY}
            disabled={!validImageUrl}
            onClick={saveImageHandler}
          >
            Save
          </Button>
          <Button type={Button.TYPE.TERTIARY} onClick={closeHandler}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ImageUploadModal.propTypes = {
  imageUrl: PropTypes.string,
  hidden: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
};

export default ImageUploadModal;
