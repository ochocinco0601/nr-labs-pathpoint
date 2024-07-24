import { REFRESH_INTERVALS } from '../constants';

export const flowDocument = (flows = [], flowId) =>
  flows.find(({ id }) => id === flowId)?.document;

export const exportFlowDoc = (flows, flowId) => {
  const { _, ...flow } = flowDocument(flows, flowId) || {}; // eslint-disable-line no-unused-vars
  const exportBtn = document.createElement('a');
  exportBtn.download = `${(flow?.name || 'flow')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()}.json`;
  exportBtn.href = URL.createObjectURL(
    new Blob([JSON.stringify(flow)], { type: 'application/json' })
  );
  exportBtn.click();
  exportBtn.remove();
};

export const validRefreshInterval = (interval) =>
  interval && REFRESH_INTERVALS.some(({ value }) => interval === value)
    ? interval
    : REFRESH_INTERVALS[0].value;
