export const SIGNAL_TYPES = {
  SERVICE_LEVEL: 'service_level',
  NRQL_QUERY: 'nrql_query',
  ENTITY: 'entity',
  ALERT: 'alert',
  NO_ACCESS: 'no_access',
};

export const SIGNAL_EXPAND = {
  NONE: 0,
  UNHEALTHY_ONLY: 1,
  CRITICAL_ONLY: 2,
  ALL: 4,
};

export const ALERT_SEVERITY = {
  CRITICAL: 'CRITICAL',
  NOT_ALERTING: 'NOT_ALERTING',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  WARNING: 'WARNING',
};

export const SIGNAL_TOOLTIP = {
  WORKLOAD_UNKNOWN: 'The status of this workload is unknown',
  WORKLOAD_DISRUPTED: 'The workload is disrupted',
  WORKLOAD_OPERATIONAL: 'The workload is operational',
  SIGNAL_UNKNOWN: 'No alert conditions set up',
  SIGNAL_DISRUPTED: ' incident(s) in progress',
  DEFAULT: 'No alerts in progress',
};
