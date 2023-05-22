import { StatusIcon } from '@newrelic/nr-labs-components';

import { serviceLevelStatus } from './service-levels';

const { STATUSES } = StatusIcon;

const statuses = [
  STATUSES.UNKNOWN,
  STATUSES.CRITICAL,
  STATUSES.WARNING,
  STATUSES.SUCCESS,
];

const statusValues = statuses.reduce(
  (acc, status, index) => ({
    ...acc,
    [status]: index,
  }),
  {}
);

export const SIGNAL_TYPES = {
  SERVICE_LEVEL: 'service_level',
};

export const signalStatus = (signal) => {
  if (!signal) return STATUSES.UNKNOWN;

  const { type = '' } = signal;

  if (type === SIGNAL_TYPES.SERVICE_LEVEL) {
    const { attainment, target } = signal;
    return serviceLevelStatus({ attainment, target });
  }

  return STATUSES.UNKNOWN;
};

export const statusFromStatuses = (statusesArray = []) => {
  const valuesArray = statusesArray.map(
    ({ status } = STATUSES.UNKNOWN) => statusValues[status] || 0
  );
  const leastStatusValue = valuesArray.length ? Math.min(...valuesArray) : 0;
  return statuses[leastStatusValue];
};
