import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Icon, Popover, PopoverTrigger, PopoverBody } from 'nr1';
import { EditInPlace } from '@newrelic/nr-labs-components';

import IconsLib from '../icons-lib';
import DeleteConfirmModal from '../delete-confirm-modal';
import ChangeShapeModal from '../change-shape-modal';
import { MODES, STATUSES } from '../../constants';
import { stageHeaderShapeClassName } from '../../utils';

const StageHeader = ({
  name = 'Stage',
  related = {},
  status = STATUSES.UNKNOWN,
  onUpdate,
  onDelete,
  mode = MODES.KIOSK,
}) => {
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);
  const [shapeModalHidden, setShapeModalHidden] = useState(true);

  const shape = useMemo(() => stageHeaderShapeClassName(related), [related]);

  const linkClickHandler = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === 'delete') {
      setDeleteModalHidden(false);
    } else if (type === 'shape') {
      setShapeModalHidden(false);
    }
  }, []);

  return mode === MODES.EDIT ? (
    <div className={`stage-header edit ${shape}`}>
      <span className="drag-handle">
        <IconsLib type={IconsLib.TYPES.HANDLE} />
      </span>
      <HeadingText className="name">
        <EditInPlace
          value={name}
          setValue={(newName) =>
            newName !== name && onUpdate ? onUpdate({ name: newName }) : null
          }
        />
      </HeadingText>
      <span className="last-col">
        <Popover>
          <PopoverTrigger>
            <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__MORE} />
          </PopoverTrigger>
          <PopoverBody placementType={PopoverBody.PLACEMENT_TYPE.BOTTOM_END}>
            <div className="dropdown-links">
              <div className="dropdown-link destructive">
                <a href="#" onClick={(e) => linkClickHandler(e, 'delete')}>
                  Delete stage
                </a>
              </div>
              <div className="dropdown-link">
                <a href="#" onClick={(e) => linkClickHandler(e, 'shape')}>
                  Change shape
                </a>
              </div>
            </div>
          </PopoverBody>
        </Popover>
      </span>
      <DeleteConfirmModal
        name={name}
        type="stage"
        hidden={deleteModalHidden}
        onConfirm={onDelete}
        onClose={() => setDeleteModalHidden(true)}
      />
      <ChangeShapeModal
        related={related}
        hidden={shapeModalHidden}
        onChange={onUpdate}
        onClose={() => setShapeModalHidden(true)}
      />
    </div>
  ) : (
    <div className={`stage-header ${status} ${shape}`}>
      <HeadingText className="name">{name}</HeadingText>
    </div>
  );
};

StageHeader.propTypes = {
  name: PropTypes.string,
  related: PropTypes.shape({
    target: PropTypes.bool,
    source: PropTypes.bool,
  }),
  status: PropTypes.oneOf(Object.values(STATUSES)),
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default StageHeader;
