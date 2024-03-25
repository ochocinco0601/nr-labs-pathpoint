import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { DEFAULT_DATETIME_FORMATTER } from '../constants';

export const formatTimestamp = (timestamp) =>
  DEFAULT_DATETIME_FORMATTER.format(new Date(timestamp));

export const formatTimeRange = (timeRange) => {
  if (timeRange.includes('UNTIL')) {
    const timeRangeParts = timeRange.split(' ');
    return `${timeRangeParts[0]} ${formatTimestamp(
      Number(timeRangeParts[1])
    )} ${timeRangeParts[2]} ${formatTimestamp(Number(timeRangeParts[3]))}`;
  } else {
    return timeRange;
  }
};

export const formatForDisplay = (timeRange) => {
  const { begin_time, end_time, duration } = timeRange;

  if (duration) {
    dayjs.extend(relativeTime);
    const formatted = dayjs().to(dayjs().subtract(duration, 'ms'));
    return `Since ${formatted}`;
  } else if (begin_time && end_time) {
    return `Since ${dayjs(begin_time).format('MMM DD hh:mm')} Until ${dayjs(
      end_time
    ).format('MMM DD hh:mm')}`;
  }
  return '';
};

export const getIncidentDuration = ({ openTime, durationSeconds = 0 }) => {
  if (!openTime) return '';
  const incidentDuration = durationSeconds || (Date.now() - openTime) / 1000;
  return incidentDuration < 60
    ? `lestt then 1 m`
    : incidentDuration < 3600
    ? `${Number(incidentDuration / 60).toFixed()} m`
    : incidentDuration < 86400
    ? `${Number(incidentDuration / 3600).toFixed()} h ${Number(
        (incidentDuration % 3600) / 60
      ).toFixed()} m`
    : `${Number(incidentDuration / 86400).toFixed()} d ${Number(
        (incidentDuration % 86400) / 3600
      ).toFixed()} h ${Number((incidentDuration % 3600) / 60).toFixed()} m`;
};
