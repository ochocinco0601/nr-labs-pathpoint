import { SIGNAL_TYPES, STATUSES } from '../constants';
import { alertStatus } from './alerts';
import { entityStatus } from './entities';
import { serviceLevelStatus } from './service-levels';

const statusesOrder = [
  STATUSES.UNKNOWN,
  STATUSES.CRITICAL,
  STATUSES.WARNING,
  STATUSES.SUCCESS,
];

const statusesOrderIndexLookup = statusesOrder.reduce(
  (acc, status, index) => ({
    ...acc,
    [status]: index,
  }),
  {}
);

export const signalStatus = (signal, entity) => {
  if (!signal?.type) return STATUSES.UNKNOWN;

  switch (signal.type) {
    case SIGNAL_TYPES.ENTITY: {
      return entityStatus(entity);
    }
    case SIGNAL_TYPES.ALERT: {
      return alertStatus(entity);
    }
    case SIGNAL_TYPES.SERVICE_LEVEL: {
      const { attainment, target } = signal;
      return serviceLevelStatus({ attainment, target });
    }
    default: {
      return STATUSES.UNKNOWN;
    }
  }
};

export const statusFromStatuses = (statusesArray = []) => {
  const valuesArray = statusesArray.reduce(
    (acc, { status } = STATUSES.UNKNOWN) =>
      status !== STATUSES.UNKNOWN
        ? [...acc, statusesOrderIndexLookup[status]]
        : acc,
    []
  );
  const leastStatusValue = valuesArray.length ? Math.min(...valuesArray) : 0;
  return statusesOrder[leastStatusValue];
};

const signalDetailsFromStatuses = (statuses = {}) =>
  Object.keys(statuses).reduce(
    (acc, guid) => ({ ...acc, [guid]: statuses[guid].name }),
    {}
  );

export const signalDetailsObject = (statuses = {}) => {
  if (!statuses || !Object.keys(statuses).length) return;
  const {
    [SIGNAL_TYPES.ENTITY]: entitiesStatuses = {},
    [SIGNAL_TYPES.ALERT]: alertsStatuses = {},
  } = statuses;
  return {
    ...signalDetailsFromStatuses(entitiesStatuses),
    ...signalDetailsFromStatuses(alertsStatuses),
  };
};
