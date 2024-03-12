import {
  SIGNAL_TYPES,
  STAGE_SHAPES_CLASSNAME_ARRAY,
  UI_CONTENT,
} from '../constants';
import { uuid } from './crypto';
import { signalStatus, statusFromStatuses } from './signal';

export const sanitizeStages = (stages = [], shouldExcludeSignals) =>
  stages.map(({ levels = [], name = 'New Stage', related = {} }) => ({
    id: uuid(),
    name,
    related,
    levels: levels.map(({ steps = [] }) => ({
      id: uuid(),
      steps: steps.map(({ signals = [], title }) => ({
        id: uuid(),
        title,
        signals: shouldExcludeSignals
          ? []
          : signals.map(({ guid, name: signalName, type }) => ({
              type,
              guid,
              name: signalName,
            })),
      })),
    })),
  }));

export const addSignalStatuses = (stages = [], statuses = {}) =>
  stages.map(({ levels = [], ...stage }) => ({
    ...stage,
    levels: levels.map(({ steps = [], ...level }) => ({
      ...level,
      steps: steps.map(({ signals = [], ...step }) => ({
        ...step,
        signals: signals.map(({ guid, name, type }) => {
          const entity = statuses[type]?.[guid] || {};
          const status = signalStatus({ type }, entity);
          return {
            type,
            guid,
            name: name || entity.name || UI_CONTENT.SIGNAL.DEFAULT_NAME,
            status,
          };
        }),
      })),
    })),
  }));

export const annotateStageWithStatuses = (stage = {}) => {
  const { levels, levelStatuses } = (stage.levels || []).reduce(
    ({ levels, levelStatuses }, level = {}) => {
      const { steps, stepStatuses } = (level.steps || []).reduce(
        ({ steps, stepStatuses }, step = {}) => {
          const status = statusFromStatuses(
            (step.signals || []).map(({ status }) => ({ status }))
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
        levels: [...levels, { ...level, steps, status }],
        levelStatuses: [...levelStatuses, { status }],
      };
    },
    { levels: [], levelStatuses: [] }
  );
  const status = statusFromStatuses(levelStatuses);
  return { ...stage, levels, status };
};

export const uniqueSignalGuidsInStages = (stages = [], accounts = []) => {
  const guids = Object.values(SIGNAL_TYPES).reduce(
    (acc, type) => ({ ...acc, [type]: new Set() }),
    {}
  );
  stages.forEach(({ levels = [] }) =>
    levels.forEach(({ steps = [] }) =>
      steps.forEach(({ signals = [] }) =>
        signals.forEach(({ guid, type }) => {
          const [acctId] = atob(guid)?.split('|') || [];
          if (!acctId || !accounts.length) return;
          if (accounts.some(({ id }) => id === Number(acctId))) {
            if (type in guids) guids[type].add(guid);
          } else {
            guids[SIGNAL_TYPES.NO_ACCESS].add(guid);
          }
        })
      )
    )
  );
  return Object.keys(guids).reduce(
    (acc, type) =>
      guids[type] instanceof Set ? { ...acc, [type]: [...guids[type]] } : acc,
    {}
  );
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
  if (target) return 1;
  if (source) return 3;
  return 0;
};

export const stageShapeDataFromIndex = (index) => {
  const target = index === 1 || index === 2;
  const source = index > 1;
  return { target, source };
};

export const stageHeaderShapeClassName = (related = {}) =>
  STAGE_SHAPES_CLASSNAME_ARRAY[stageShapeIndexFromData(related)];
