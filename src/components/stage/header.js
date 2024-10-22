import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Icon, Popover, PopoverTrigger, PopoverBody } from 'nr1';
import { EditInPlace } from '@newrelic/nr-labs-components';

import IconsLib from '../icons-lib';
import DeleteConfirmModal from '../delete-confirm-modal';
import StageSettingsModal from '../stage-settings-modal';
import { MODES, STATUSES, UI_CONTENT } from '../../constants';
import { stageHeaderShapeClassName } from '../../utils';

const StageHeader = ({
  name,
  related = {},
  link,
  status = STATUSES.UNKNOWN,
  onUpdate,
  onDelete,
  mode = MODES.INLINE,
  onDragHandle,
}) => {
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);
  const [settingsModalHidden, setSettingsModalHidden] = useState(true);

  const shape = useMemo(() => stageHeaderShapeClassName(related), [related]);
  const linkClass = useMemo(() => (link === '' ? '' : 'link'), [link]);

  const linkClickHandler = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === 'delete') {
      setDeleteModalHidden(false);
    } else if (type === 'settings') {
      setSettingsModalHidden(false);
    }
  }, []);

  const updateStageNameHandler = useCallback(
    (newName) => {
      if (newName === name || newName === UI_CONTENT.STAGE.FALLBACK_NAME)
        return;
      onUpdate?.({ name: newName });
    },
    [name, onUpdate]
  );

  const handleStageClick = () => {
    if (link !== '') {
      window.open(link, '_blank');
    }
  };

  return mode === MODES.EDIT ? (
    <div className={`stage-header edit ${shape}`}>
      <span
        className="drag-handle"
        onMouseDown={() => (onDragHandle ? onDragHandle(true) : null)}
        onMouseUp={() => (onDragHandle ? onDragHandle(false) : null)}
      >
        <IconsLib type={IconsLib.TYPES.HANDLE} />
      </span>
      <HeadingText className="name">
        <EditInPlace
          value={name || UI_CONTENT.STAGE.FALLBACK_NAME}
          setValue={updateStageNameHandler}
        />
      </HeadingText>
      <span className="last-col">
        <Popover>
          <PopoverTrigger>
            <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__MORE} />
          </PopoverTrigger>
          <PopoverBody placementType={PopoverBody.PLACEMENT_TYPE.BOTTOM_END}>
            <div className="dropdown-links">
              <div className="dropdown-link">
                <a href="#" onClick={(e) => linkClickHandler(e, 'settings')}>
                  Settings
                </a>
              </div>
              <div className="dropdown-link destructive">
                <a href="#" onClick={(e) => linkClickHandler(e, 'delete')}>
                  Delete stage
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
      <StageSettingsModal
        name={name}
        link={link}
        related={related}
        hidden={settingsModalHidden}
        onChange={onUpdate}
        onConfirm={onDelete}
        onClose={() => setSettingsModalHidden(true)}
      />
    </div>
  ) : (
    <div
      onClick={handleStageClick}
      className={`stage-header ${status} ${shape} ${linkClass}`}
    >
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
  link: PropTypes.string,
  status: PropTypes.oneOf(Object.values(STATUSES)),
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
  onDragHandle: PropTypes.func,
};

export default StageHeader;
