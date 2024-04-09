import { UI_CONTENT } from '../../constants';
import { uuid } from '../../utils';
import { reorderComponent } from './reorder';

export const addLevel = ({ flow, saveFlow, componentIds }) => {
  const { stageId } = componentIds;
  if (!stageId) return flow;
  const updatedFlow = {
    ...flow,
    stages: flow.stages.map((stage) =>
      stage.id === stageId
        ? {
            ...stage,
            levels: [
              ...stage.levels,
              {
                id: uuid(),
                steps: [
                  {
                    id: uuid(),
                    signals: [],
                    title: UI_CONTENT.STEP.DEFAULT_TITLE,
                  },
                ],
              },
            ],
          }
        : stage
    ),
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};

export const deleteLevel = ({ flow, saveFlow, componentIds }) => {
  const { stageId, levelId } = componentIds;
  if (!stageId || !levelId) return flow;

  const updatedFlow = {
    ...flow,
    stages: flow.stages.map((stage) =>
      stage.id === stageId
        ? {
            ...stage,
            levels: stage.levels.filter(({ id }) => id !== levelId),
          }
        : stage
    ),
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};

export const reorderLevels = ({ flow, saveFlow, componentIds, updates }) => {
  const { stageId } = componentIds;
  if (!stageId) return flow;
  const { sourceIndex, targetIndex } = updates;
  const updatedFlow = {
    ...flow,
    stages: flow.stages.map((stage) =>
      stage.id === stageId
        ? {
            ...stage,
            levels: reorderComponent(stage.levels, sourceIndex, targetIndex),
          }
        : stage
    ),
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};
