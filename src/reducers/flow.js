import { updateFlow } from './helpers/flows';
import {
  addStage,
  deleteStage,
  reorderStages,
  updateStage,
} from './helpers/stages';
import { deleteLevel, reorderLevels } from './helpers/levels';
import { addStep, deleteStep, reorderSteps, updateStep } from './helpers/steps';
import { deleteSignal } from './helpers/signals';

export const FLOW_DISPATCH_TYPES = {
  ADDED: 'added',
  UPDATED: 'updated',
  DELETED: 'deleted',
  REORDERED: 'reordered',
};

export const FLOW_DISPATCH_COMPONENTS = {
  FLOW: 'flow',
  STAGE: 'stage',
  LEVEL: 'level',
  STEP: 'step',
  SIGNAL: 'signal',
};

export const flowReducer = (flow, action) => {
  const { component, componentIds = {}, updates, saveFlow } = action;

  switch (action.type) {
    case FLOW_DISPATCH_TYPES.ADDED: {
      if (component === FLOW_DISPATCH_COMPONENTS.STAGE)
        return addStage({ flow, saveFlow });
      if (component === FLOW_DISPATCH_COMPONENTS.STEP)
        return addStep({ flow, saveFlow, componentIds, updates });
      return flow;
    }
    case FLOW_DISPATCH_TYPES.UPDATED: {
      if (component === FLOW_DISPATCH_COMPONENTS.FLOW)
        return updateFlow({ flow, saveFlow, updates });
      if (component === FLOW_DISPATCH_COMPONENTS.STAGE)
        return updateStage({ flow, saveFlow, componentIds, updates });
      if (component === FLOW_DISPATCH_COMPONENTS.STEP)
        return updateStep({ flow, saveFlow, componentIds, updates });
      return flow;
    }
    case FLOW_DISPATCH_TYPES.DELETED: {
      if (component === FLOW_DISPATCH_COMPONENTS.STAGE)
        return deleteStage({ flow, saveFlow, componentIds });
      if (component === FLOW_DISPATCH_COMPONENTS.LEVEL)
        return deleteLevel({ flow, saveFlow, componentIds });
      if (component === FLOW_DISPATCH_COMPONENTS.STEP)
        return deleteStep({ flow, saveFlow, componentIds });
      if (component === FLOW_DISPATCH_COMPONENTS.SIGNAL)
        return deleteSignal({ flow, saveFlow, componentIds });
      return flow;
    }
    case FLOW_DISPATCH_TYPES.REORDERED: {
      if (component === FLOW_DISPATCH_COMPONENTS.STAGE)
        return reorderStages({ flow, saveFlow, updates });
      if (component === FLOW_DISPATCH_COMPONENTS.LEVEL)
        return reorderLevels({ flow, saveFlow, componentIds, updates });
      if (component === FLOW_DISPATCH_COMPONENTS.STEP)
        return reorderSteps({ flow, saveFlow, componentIds, updates });
      return flow;
    }
    default: {
      return flow;
    }
  }
};
