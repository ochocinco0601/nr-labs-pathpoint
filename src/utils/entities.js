import { StatusIcon } from '@newrelic/nr-labs-components';

const {
  STATUSES: { UNKNOWN, CRITICAL, WARNING, SUCCESS },
} = StatusIcon;

export const entityStatus = ({ alertSeverity } = {}) => {
  switch (alertSeverity) {
    case 'NOT_ALERTING': {
      return SUCCESS;
    }
    case 'WARNING': {
      return WARNING;
    }
    case 'CRITICAL': {
      return CRITICAL;
    }
    default: {
      return UNKNOWN;
    }
  }
};
