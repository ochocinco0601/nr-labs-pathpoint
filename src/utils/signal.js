import {
  SIGNAL_TYPES,
  STATUSES,
  STEP_STATUS_OPTIONS,
  STEP_STATUS_UNITS,
} from '../constants';
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

const countUniqueSignalStatus = (signals) => {
  const statusCounts = {};

  signals.map((s) => {
    const { status } = s;
    if (statusCounts[status]) {
      statusCounts[status] += 1;
    } else {
      statusCounts[status] = 1;
    }
  });

  return statusCounts;
};

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

export const calculateStepStatus = (step) => {
  if (step.signals.length === 0) return STATUSES.UNKNOWN;

  const {
    status: {
      option: statusOption,
      weight: {
        unit: stepWeightUnit = STEP_STATUS_UNITS.PERCENT,
        value: stepWeightValue = '',
      } = {},
    } = {},
  } = step?.config || {};

  const includedSignals = step.signals.filter((s) => {
    return s.included === true || s.included === undefined;
  });
  const stepStatusCounts = countUniqueSignalStatus(includedSignals);
  if (statusOption) {
    const {
      [STATUSES.CRITICAL]: criticalCount = 0,
      [STATUSES.WARNING]: warningCount = 0,
      [STATUSES.SUCCESS]: successCount = 0,
    } = stepStatusCounts || {};

    if (statusOption === STEP_STATUS_OPTIONS.BEST) {
      if (successCount > 0) {
        return STATUSES.SUCCESS;
      } else if (warningCount > 0) {
        return STATUSES.WARNING;
      }
      return STATUSES.CRITICAL;
    }

    if (statusOption === STEP_STATUS_OPTIONS.WORST) {
      if (stepWeightValue === '') {
        return statusFromStatuses(
          (includedSignals || []).map(({ status }) => ({ status }))
        );
      } else {
        let actualWeightValue;

        if (stepWeightUnit === STEP_STATUS_UNITS.COUNT) {
          actualWeightValue = warningCount + criticalCount;
        } else {
          actualWeightValue = Math.round(
            ((warningCount + criticalCount) / includedSignals.length) * 100,
            2
          );
        }

        if (actualWeightValue >= Number(stepWeightValue)) {
          if (criticalCount === 0 && warningCount > 0) {
            return STATUSES.WARNING;
          }

          if (criticalCount > warningCount) {
            return STATUSES.CRITICAL;
          }
        } else {
          return STATUSES.SUCCESS;
        }
      }
    }
  }

  return statusFromStatuses(
    (includedSignals || []).map(({ status }) => ({ status }))
  );
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
