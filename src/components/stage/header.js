import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { HeadingText } from 'nr1';
import { EditInPlace } from '@newrelic/nr-labs-components';

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

  return (
    <div className={`stage-header ${status} ${shape}`}>
      <HeadingText className="name">
        {mode === MODES.EDIT ? (
          <EditInPlace
            value={name}
            setValue={(newName) =>
              newName !== name && onUpdate ? onUpdate(newName) : null
            }
          />
        ) : (
          name
        )}
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
