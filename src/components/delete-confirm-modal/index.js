import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { BlockText, Button, HeadingText, Modal } from 'nr1';

const DeleteConfirmModal = ({
  name = '',
  type = '',
  hidden = true,
  onConfirm,
  onClose,
}) => {
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
            Are you sure you want to delete{' '}
            <span className="heading-name">{name}</span>?
          </HeadingText>
          <BlockText>
            Deleting this <strong>{type}</strong> will also remove everything
            nested inside.
          </BlockText>
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

DeleteConfirmModal.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  hidden: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default DeleteConfirmModal;
