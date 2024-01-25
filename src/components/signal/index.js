import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';
import { StatusIcon } from '@newrelic/nr-labs-components';

import IconsLib from '../icons-lib';
import { COMPONENTS, MODES, SIGNAL_TYPES, STATUSES } from '../../constants';
import { SelectionsContext } from '../../contexts';

const Signal = ({
  name,
  guid,
  type = SIGNAL_TYPES.ENTITY,
  onDelete,
  status = STATUSES.UNKNOWN,
  mode = MODES.INLINE,
}) => {
  const { selections, toggleSelection } = useContext(SelectionsContext);

  return (
    <div
      className={`signal ${mode === MODES.EDIT ? 'edit' : ''} ${
        [MODES.INLINE, MODES.STACKED].includes(mode) &&
        [STATUSES.CRITICAL, STATUSES.WARNING].includes(status)
          ? `detail ${status} ${
              selections[COMPONENTS.SIGNAL]?.[guid] ? 'selected' : ''
            }`
          : ''
      }`}
      onClick={() => {
        toggleSelection(COMPONENTS.SIGNAL, guid);
      }}
    >
      <div className="status">
        {type === SIGNAL_TYPES.ALERT ? (
          <IconsLib
            className={mode === MODES.EDIT ? STATUSES.UNKNOWN : status}
            type={IconsLib.TYPES.ALERT}
          />
        ) : (
          <StatusIcon
            style={{ margin: '0 3px' }}
            status={mode === MODES.EDIT ? STATUSES.UNKNOWN : status}
          />
        )}
      </div>
      {name ? (
        <span className={`name ${status}`}>{name}</span>
      ) : (
        <span className="name unknown">(unknown)</span>
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
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default Signal;
