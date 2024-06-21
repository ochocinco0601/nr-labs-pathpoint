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

export const durationStringForViolation = (closed = Date.now(), opened) => {
  if (!opened) return '';
  const duration = (closed - opened) / 1000;
  if (duration < 60) return 'less than 1 m';
  if (duration < 3600) {
    const mins = Number(duration / 60).toFixed();
    return `${mins} m`;
  }
  const mins = Number((duration % 3600) / 60).toFixed();
  if (duration < 86400) {
    const hours = Number(duration / 3600).toFixed();
    return `${hours} h ${mins} m`;
  }
  const days = Number(duration / 86400).toFixed();
  const hours = Number((duration % 86400) / 3600).toFixed();
  return `${days} d ${hours} h ${mins} m`;
};
