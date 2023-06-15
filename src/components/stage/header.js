import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Icon } from 'nr1';
import { EditInPlace } from '@newrelic/nr-labs-components';

import IconsLib from '../icons-lib';
import { MODES, STATUSES } from '../../constants';

const StageHeader = ({
  name = 'Stage',
  status = STATUSES.UNKNOWN,
  related = {},
  mode = MODES.KIOSK,
  onUpdate,
}) => {
  const shape = useMemo(() => {
    const { target, source } = related;
    if (!target && !source) return '';
    if (target && source) return 'has-target has-source';
    if (target) return 'has-target';
    if (source) return 'has-source';
    return '';
  }, [related]);

  return mode === MODES.EDIT ? (
    <div className={`stage-header edit ${shape}`}>
      <IconsLib type={IconsLib.TYPES.HANDLE} />
      <HeadingText className="name">
        <EditInPlace
          value={name}
          setValue={(newName) =>
            newName !== name && onUpdate ? onUpdate({name: newName}) : null
          }
        />
      </HeadingText>
      <span className="last-col" onClick={() => console.log('DELETE STAGE...')}>
        <Icon type={Icon.TYPE.INTERFACE__SIGN__TIMES} />
      </span>
    </div>
  ) : (
    <div className={`stage-header ${status} ${shape}`}>
      <HeadingText className="name">
        {name}
      </HeadingText>
    </div>
  );
};

StageHeader.propTypes = {
  name: PropTypes.string,
  status: PropTypes.oneOf(Object.values(STATUSES)),
  related: PropTypes.shape({
    target: PropTypes.bool,
    source: PropTypes.bool,
  }),
  mode: PropTypes.oneOf(Object.values(MODES)),
  onUpdate: PropTypes.func,
};

export default StageHeader;
