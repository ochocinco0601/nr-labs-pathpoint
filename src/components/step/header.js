import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Icon, Popover, PopoverBody, PopoverTrigger } from 'nr1';
import { EditInPlace } from '@newrelic/nr-labs-components';

import IconsLib from '../icons-lib';
import DeleteConfirmModal from '../delete-confirm-modal';
import StepSettingsModal from '../step-settings-modal';
import StepToolTip from '../step-tooltip';
import { MODES, STATUSES } from '../../constants';
import { FlowDispatchContext, StagesContext } from '../../contexts';
import { FLOW_DISPATCH_COMPONENTS, FLOW_DISPATCH_TYPES } from '../../reducers';

const StepHeader = ({
  stageId,
  levelId,
  stepId,
  onDragHandle,
  mode = MODES.INLINE,
  saveFlow,
  handleStepHeaderClick = () => null,
}) => {
  const { stages } = useContext(StagesContext);
  const dispatch = useContext(FlowDispatchContext);
  const [title, setTitle] = useState();
  const [status, setStatus] = useState(STATUSES.UNKNOWN);
  const [signals, setSignals] = useState([]);
  const [stepStatusValue, setStepStatusValue] = useState(null);
  const [stepStatusOption, setStepStatusOption] = useState(null);
  const [stepStatusUnit, setStepStatusUnit] = useState(null);
  const [settingsModalHidden, setSettingsModalHidden] = useState(true);
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);

  useEffect(() => {
    const { levels = [] } =
      (stages || []).find(({ id }) => id === stageId) || {};
    const { steps = [] } = levels.find(({ id }) => id === levelId) || {};
    const step = steps.find(({ id }) => id === stepId) || {};
    setTitle(step.title);
    setStatus(step.status || STATUSES.UNKNOWN);
    setSignals(step.signals || []);
    setStepStatusValue(step.statusWeightValue || '');
    setStepStatusOption(step.statusOption || 'worst');
    setStepStatusUnit(step.statusWeightUnit || 'percent');
  }, [stageId, levelId, stepId, stages]);

  const updateTitleHandler = (newTitle) => {
    if (newTitle === title) return;
    dispatch({
      type: FLOW_DISPATCH_TYPES.UPDATED,
      component: FLOW_DISPATCH_COMPONENTS.STEP,
      componentIds: { stageId, levelId, stepId },
      updates: { title: newTitle },
      saveFlow,
    });
  };

  const updateStepHandler = (updates = {}) => {
    dispatch({
      type: FLOW_DISPATCH_TYPES.UPDATED,
      component: FLOW_DISPATCH_COMPONENTS.STEP,
      componentIds: { stageId, levelId, stepId },
      updates,
      saveFlow,
    });
  };

  const deleteStepHandler = () =>
    dispatch({
      type: FLOW_DISPATCH_TYPES.DELETED,
      component: FLOW_DISPATCH_COMPONENTS.STEP,
      componentIds: { stageId, levelId, stepId },
      saveFlow,
    });

  const linkClickHandler = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === 'delete') {
      setDeleteModalHidden(false);
    } else if (type === 'settings') {
      setSettingsModalHidden(false);
    }
  }, []);

  return mode === MODES.EDIT ? (
    <div className="step-header edit">
      <span
        className="drag-handle"
        onMouseDown={() => (onDragHandle ? onDragHandle(true) : null)}
        onMouseUp={() => (onDragHandle ? onDragHandle(false) : null)}
      >
        <IconsLib type={IconsLib.TYPES.HANDLE} />
      </span>
      <HeadingText type={HeadingText.TYPE.HEADING_6} className="title">
        <EditInPlace value={title} setValue={updateTitleHandler} />
      </HeadingText>
      <span className="last-col">
        <Popover>
          <PopoverTrigger>
            <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__MORE} />
          </PopoverTrigger>
          <PopoverBody placementType={PopoverBody.PLACEMENT_TYPE.BOTTOM_END}>
            <div className="dropdown-links">
              <div className="dropdown-link">
                <a href="#" onClick={(e) => linkClickHandler(e, 'settings')}>
                  Settings
                </a>
              </div>
              <div className="dropdown-link destructive">
                <a href="#" onClick={(e) => linkClickHandler(e, 'delete')}>
                  Delete step
                </a>
              </div>
            </div>
          </PopoverBody>
        </Popover>
      </span>
      <DeleteConfirmModal
        name={title}
        type="step"
        hidden={deleteModalHidden}
        onConfirm={deleteStepHandler}
        onClose={() => setDeleteModalHidden(true)}
      />
      <StepSettingsModal
        title={title}
        stepStatusOption={stepStatusOption}
        stepStatusValue={stepStatusValue}
        stepStatusUnit={stepStatusUnit}
        signals={signals}
        hidden={settingsModalHidden}
        onConfirm={deleteStepHandler}
        onChange={updateStepHandler}
        onClose={() => setSettingsModalHidden(true)}
      />
    </div>
  ) : (
    <div className="step-header" onClick={handleStepHeaderClick}>
      <StepToolTip
        stepTitle={title}
        stepStatus={status}
        stepStatusOption={stepStatusOption}
        stepStatusValue={stepStatusValue}
        stepStatusUnit={stepStatusUnit}
        signals={signals}
        triggerElement={
          <HeadingText type={HeadingText.TYPE.HEADING_6} className="title">
            {title}
          </HeadingText>
        }
      />
    </div>
  );
};

StepHeader.propTypes = {
  stageId: PropTypes.string,
  levelId: PropTypes.string,
  stepId: PropTypes.string,
  onDragHandle: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
  saveFlow: PropTypes.func,
  handleStepHeaderClick: PropTypes.func,
};

export default StepHeader;
