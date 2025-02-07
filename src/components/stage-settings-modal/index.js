import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText, Radio, TextField } from 'nr1';

import Modal from '../modal';
import IconsLib from '../icons-lib';
import DeleteConfirmModal from '../delete-confirm-modal';
import { STAGE_SHAPES_ARRAY, STAGE_SHAPES_ICON } from '../../constants';
import { stageShapeDataFromIndex, stageShapeIndexFromData } from '../../utils';

const shapeId = (shape) => shape.replace(/\s+/g, '_').toLowerCase();

const StageSettingsModal = ({
  name,
  link,
  related = {},
  hidden = true,
  onChange,
  onConfirm,
  onClose,
}) => {
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(0);
  const [url, setUrl] = useState('');
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);
  const [settingsModalHidden, setSettingsModalHidden] = useState(true);

  useEffect(
    () => setSelectedShapeIndex(stageShapeIndexFromData(related)),
    [related]
  );

  useEffect(() => setUrl(link), [link]);

  useEffect(() => setSettingsModalHidden(hidden), [hidden]);

  const closeHandler = useCallback(
    (action) => {
      switch (action) {
        case 'update':
          if (onChange) {
            onChange({
              related: stageShapeDataFromIndex(selectedShapeIndex),
              link: url,
            });
            if (onClose) onClose();
          }
          break;

        case 'delete':
          setDeleteModalHidden(false);
          setSettingsModalHidden(true);
      }

      if (onClose) onClose();
    },
    [url, selectedShapeIndex]
  );

  return (
    <Modal hidden={settingsModalHidden} onClose={closeHandler}>
      <HeadingText type={HeadingText.TYPE.HEADING_1}>
        Stage Settings
      </HeadingText>
      <div className="stage-form">
        <div className="header">
          <HeadingText type={HeadingText.TYPE.HEADING_4}>
            Stage Link
          </HeadingText>
        </div>
        <TextField
          description="Link to additional context for this stage (e.g. a dashboard or a document)"
          placeholder="https://one.newrelic.com"
          value={url || ''}
          onChange={(e) => setUrl(e.target.value)}
        />
        <br />
        <div className="header">
          <HeadingText type={HeadingText.TYPE.HEADING_4}>
            Stage Shape
          </HeadingText>
        </div>
        <div className="shape-options">
          {STAGE_SHAPES_ARRAY.map((shape, index) => (
            <label key={shapeId(shape)}>
              <Radio
                onChange={({ target: { checked } }) =>
                  checked ? setSelectedShapeIndex(index) : null
                }
                label=""
                checked={selectedShapeIndex === index}
              />
              <IconsLib
                type={IconsLib.TYPES[STAGE_SHAPES_ICON[shape.toUpperCase()]]}
              />
              {shape}
            </label>
          ))}
        </div>
        <div className="modal-footer">
          <Button
            type={Button.TYPE.DESTRUCTIVE}
            onClick={() => closeHandler('delete')}
          >
            Delete
          </Button>
          <div className="right">
            <Button
              type={Button.TYPE.TERTIARY}
              onClick={() => closeHandler('cancel')}
            >
              Cancel
            </Button>
            <Button
              type={Button.TYPE.PRIMARY}
              onClick={() => closeHandler('update')}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        name={name}
        type="stage"
        hidden={deleteModalHidden}
        onConfirm={onConfirm}
        onClose={() => setDeleteModalHidden(true)}
      />
    </Modal>
  );
};

StageSettingsModal.propTypes = {
  name: PropTypes.string,
  link: PropTypes.string,
  related: PropTypes.shape({
    target: PropTypes.bool,
    source: PropTypes.bool,
  }),
  hidden: PropTypes.bool,
  deleteHidden: PropTypes.bool,
  onChange: PropTypes.func,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default StageSettingsModal;
