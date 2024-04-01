import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

import IconsLib from '../icons-lib';
import {
  COMPONENTS,
  MODES,
  SIGNAL_TYPES,
  STATUSES,
  UI_CONTENT,
} from '../../constants';
import { SelectionsContext } from '../../contexts';

const Signal = ({
  name,
  guid,
  type = SIGNAL_TYPES.ENTITY,
  onDelete,
  status = STATUSES.UNKNOWN,
  isInSelectedStep,
  mode = MODES.INLINE,
}) => {
  const { selections, markSelection } = useContext(SelectionsContext);

  return (
    <div
      className={`signal ${mode === MODES.EDIT ? 'edit' : ''} ${
        [MODES.INLINE, MODES.STACKED].includes(mode)
          ? `detail ${status} ${
              selections?.type === COMPONENTS.SIGNAL && selections?.id === guid
                ? 'selected'
                : ''
            }`
          : ''
      } ${
        mode !== MODES.EDIT &&
        ((selections?.type === COMPONENTS.STEP && !isInSelectedStep) ||
          (selections?.type === COMPONENTS.SIGNAL && selections.id !== guid))
          ? 'faded'
          : ''
      }`}
      onClick={
        mode !== MODES.EDIT
          ? (e) => {
              e.stopPropagation();
              if (markSelection)
                markSelection(COMPONENTS.SIGNAL, guid, { name, type, status });
            }
          : null
      }
    >
      <div className="status">
        <IconsLib
          className={mode === MODES.EDIT ? STATUSES.UNKNOWN : status}
          type={
            type === SIGNAL_TYPES.ALERT
              ? IconsLib.TYPES.ALERT
              : IconsLib.TYPES.ENTITY
          }
          shouldShowTitle={false}
        />
      </div>
      {name ? (
        <span className={`name`} title={name}>
          {name}
        </span>
      ) : (
        <span className="name unknown">{UI_CONTENT.SIGNAL.DEFAULT_NAME}</span>
      )}
      {mode === MODES.EDIT ? (
        <span
          className="delete-signal"
          onClick={() => (onDelete ? onDelete() : null)}
        >
          <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__CLOSE} />
        </span>
      ) : null}
    </div>
  );
};

Signal.propTypes = {
  name: PropTypes.string,
  guid: PropTypes.string,
  type: PropTypes.oneOf(Object.values(SIGNAL_TYPES)),
  onDelete: PropTypes.func,
  status: PropTypes.oneOf(Object.values(STATUSES)),
  isInSelectedStep: PropTypes.bool,
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Signal;
