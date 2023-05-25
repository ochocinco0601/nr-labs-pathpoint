import { statusFromStatuses } from './signal';

export const annotateStageWithStatuses = (stage) => {
  const { stepGroups, stepGroupStatuses } = stage.stepGroups.reduce(
    ({ stepGroups, stepGroupStatuses }, stepGroup) => {
      const { steps, stepStatuses } = stepGroup.steps.reduce(
        ({ steps, stepStatuses }, step) => {
          const status = statusFromStatuses(
            step.signals.map(({ status }) => ({ status }))
          );
          return {
            steps: [...steps, { ...step, status }],
            stepStatuses: [...stepStatuses, { status }],
          };
        },
        { steps: [], stepStatuses: [] }
      );
      const status = statusFromStatuses(stepStatuses);
      return {
        stepGroups: [...stepGroups, { ...stepGroup, steps, status }],
        stepGroupStatuses: [...stepGroupStatuses, { status }],
      };
    },
    { stepGroups: [], stepGroupStatuses: [] }
  );
  const status = statusFromStatuses(stepGroupStatuses);
  return { ...stage, stepGroups, status };
};
