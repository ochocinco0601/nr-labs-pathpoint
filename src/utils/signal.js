import { StatusIcon } from '@newrelic/nr-labs-components';

import { serviceLevelStatus } from './service-levels';

const {
  STATUSES: { UNKNOWN },
} = StatusIcon;

export const SIGNAL_TYPES = {
  SERVICE_LEVEL: 'service_level',
};

export const signalStatus = (signal) => {
  if (!signal) return UNKNOWN;

  const { type = '' } = signal;

  if (type === SIGNAL_TYPES.SERVICE_LEVEL) {
    const { attainment, target } = signal;
    return serviceLevelStatus({ attainment, target });
  }

  return UNKNOWN;
};
