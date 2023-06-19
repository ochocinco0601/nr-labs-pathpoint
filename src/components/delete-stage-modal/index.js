import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText, Modal } from 'nr1';

const DeleteStageModal = ({ name = '', hidden = true, onConfirm, onClose }) => {
  const deleteHandler = useCallback(() => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  }, []);

  const closeHandler = useCallback(() => {
    if (onClose) onClose();
  }, []);

  return (
    <Modal hidden={hidden} onClose={closeHandler}>
      <div className="delete-stage-modal">
        <div className="modal-content">
          <HeadingText type={HeadingText.TYPE.HEADING_3}>
            Are you sure you want to delete {name}?
          </HeadingText>
          <HeadingText type={HeadingText.TYPE.HEADING_6}>
            Deleting this stage will also remove everything nested inside.
          </HeadingText>
        </div>
        <div className="modal-footer">
          <Button type={Button.TYPE.DESTRUCTIVE} onClick={deleteHandler}>
            Delete
          </Button>
          <Button type={Button.TYPE.TERTIARY} onClick={closeHandler}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

DeleteStageModal.propTypes = {
  name: PropTypes.string,
  hidden: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default DeleteStageModal;
