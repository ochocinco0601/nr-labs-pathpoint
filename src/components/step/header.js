import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  HeadingText,
  Icon,
  Popover,
  PopoverBody,
  PopoverTrigger,
} from 'nr1';
import { EditInPlace } from '@newrelic/nr-labs-components';

import { IconsLib, DeleteConfirmModal, StepSettingsModal } from '../';
import { MODES } from '../../constants';
import { FlowDispatchContext } from '../../contexts';
import { FLOW_DISPATCH_COMPONENTS, FLOW_DISPATCH_TYPES } from '../../reducers';

const StepHeader = ({
  stageId,
  levelId,
  stepId,
  step: {
    title,
    signals,
    link,
    config,
  } = {},
  onDragHandle,
  mode = MODES.INLINE,
  saveFlow,
  isStepExpanded,
  onStepExpandCollapse,
}) => {
  const dispatch = useContext(FlowDispatchContext);
  const [settingsModalHidden, setSettingsModalHidden] = useState(true);
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);

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

  const openDeleteModal = useCallback(() => {
    setDeleteModalHidden(false);
    setSettingsModalHidden(true);
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
        signals={signals}
        link={link}
        config={config}
        hidden={settingsModalHidden}
        onChange={updateStepHandler}
        onDelete={openDeleteModal}
        onClose={() => setSettingsModalHidden(true)}
      />
    </div>
  ) : (
    <div className="step-header" title={title}>
      <HeadingText type={HeadingText.TYPE.HEADING_6} className="title">
        {title}
      </HeadingText>
      {mode === MODES.INLINE ? (
        <Button
          className="expand-collapse-btn"
          iconType={
            isStepExpanded
              ? Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM
              : Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT
          }
          ariaLabel="Expand/collapse step"
          variant={Button.VARIANT.TERTIARY}
          onClick={onStepExpandCollapse}
        />
      ) : null}
    </div>
  );
};

StepHeader.propTypes = {
  stageId: PropTypes.string,
  levelId: PropTypes.string,
  stepId: PropTypes.string,
  step: PropTypes.object,
  onDragHandle: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
  saveFlow: PropTypes.func,
  isStepExpanded: PropTypes.bool,
  onStepExpandCollapse: PropTypes.func,
};

export default StepHeader;
