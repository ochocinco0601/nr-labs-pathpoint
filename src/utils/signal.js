import { StatusIcon } from '@newrelic/nr-labs-components';

const {
  STATUSES: { UNKNOWN, CRITICAL, SUCCESS },
} = StatusIcon;

const signalStatus = (signal) => {
  if (!signal) return UNKNOWN;

  const { attainment, target } = signal;

  if ((!attainment && attainment !== 0) || !target) return UNKNOWN;

  if (attainment >= target) return SUCCESS;
  return CRITICAL;
};

export { signalStatus };
