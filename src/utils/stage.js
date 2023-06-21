import { STAGE_SHAPES_CLASSNAME_ARRAY } from '../constants';
import { signalStatus, statusFromStatuses } from './signal';

export const addSignalStatuses = (stages = [], serviceLevelsData = {}) =>
  stages.map(({ name, stepGroups }) => ({
    name,
    stepGroups: stepGroups.map(({ order, steps }) => ({
      order,
      steps: steps.map(({ title, signals }) => ({
        title,
        signals: signals.map(({ type, guid }) => {
          const { name, attainment, target } = serviceLevelsData[guid];
          return {
            type,
            guid,
            name,
            attainment,
            target,
            status: signalStatus({ type, attainment, target }),
          };
        }),
      })),
    })),
  }));

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

export const uniqueSignalGuidsInStages = (stages = []) => {
  const guidsSet = new Set();
  stages.map(({ stepGroups }) =>
    stepGroups.map(({ steps }) =>
      steps.map(({ signals }) => signals.map(({ guid }) => guidsSet.add(guid)))
    )
  );
  return [...guidsSet];
};

export const getStageHeaderShape = (stage = {}) => {
  const classNames = [
    'has-none',
    'has-source',
    'has-target',
    'has-source has-target',
  ];
  return classNames[
    ((stage.related || {}).source || 0) +
      ((stage.related || {}).target || 0) * 2
  ];
};

export const stageShapeIndexFromData = ({ target, source } = {}) => {
  if (target && source) return 2;
  if (source) return 1;
  if (target) return 3;
  return 0;
};

export const stageShapeDataFromIndex = (index) => {
  const target = index === 1 || index === 2;
  const source = index > 1;
  return { target, source };
};

export const stageHeaderShapeClassName = (related = {}) =>
  STAGE_SHAPES_CLASSNAME_ARRAY[stageShapeIndexFromData(related)];
