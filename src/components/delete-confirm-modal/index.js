import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { BlockText, Button, HeadingText } from 'nr1';

import Modal from '../modal';

const DeleteConfirmModal = ({
  name = '',
  type = '',
  hidden = true,
  onConfirm,
  onClose,
  isDeletingFlow,
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
          {type ? (
            <BlockText>
              Deleting this <strong>{type}</strong> will also remove everything
              nested inside.
            </BlockText>
          ) : null}
        </div>
        <div className="modal-footer">
          <Button
            loading={isDeletingFlow}
            type={Button.TYPE.DESTRUCTIVE}
            onClick={deleteHandler}
          >
            Delete
          </Button>
          <Button
            disabled={isDeletingFlow}
            type={Button.TYPE.TERTIARY}
            onClick={closeHandler}
          >
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
  isDeletingFlow: PropTypes.bool,
};

export default DeleteConfirmModal;
