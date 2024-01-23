import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Icon, Tooltip } from 'nr1';

import Level from '../level';
import Signal from '../signal';
import StageHeader from './header';
import AddStep from '../add-step';
import {
  COMPONENTS,
  MODES,
  SIGNAL_TYPES,
  STATUSES,
  UI_CONTENT,
} from '../../constants';

import {
  FlowDispatchContext,
  SelectionsContext,
  SignalsContext,
  StagesContext,
} from '../../contexts';
import { FLOW_DISPATCH_COMPONENTS, FLOW_DISPATCH_TYPES } from '../../reducers';

const Stage = ({
  stageId,
  mode = MODES.INLINE,
  signalExpandOption = 0,
  onDragStart,
  onDragOver,
  onDrop,
  saveFlow,
}) => {
  const stages = useContext(StagesContext);
  const signalsDetails = useContext(SignalsContext);
  const dispatch = useContext(FlowDispatchContext);
  const { selections } = useContext(SelectionsContext);
  const [name, setName] = useState('Stage');
  const [levels, setLevels] = useState([]);
  const [related, setRelated] = useState({});
  const [signals, setSignals] = useState({});
  const [status, setStatus] = useState(STATUSES.UNKNOWN);
  const isDragHandleClicked = useRef(false);
  const dragItemIndex = useRef();
  const dragOverItemIndex = useRef();

  useEffect(() => {
    const stage = (stages || []).find(({ id }) => id === stageId) || {};
    setName(stage.name || 'Stage');
    setLevels(stage.levels || []);
    setRelated(stage.related || {});
    setStatus(stage.status || STATUSES.UNKNOWN);
  }, [stageId, stages]);

  useEffect(
    () =>
      setSignals(
        levels.reduce(
          (acc, { steps = [] }) => ({
            ...acc,
            ...steps.reduce(
              (acc, { signals = [] }) => ({
                ...acc,
                ...signals.reduce(
                  (acc, { guid, name, status, type }) => ({
                    ...acc,
                    [guid]: {
                      name: signalsDetails[guid]?.name || name,
                      status,
                      guid,
                      type,
                    },
                  }),
                  {}
                ),
              }),
              {}
            ),
          }),
          {}
        )
      ),
    [levels]
  );

  const SignalsList = memo(() => {
    // set statuses in order of most critical to least critical -> 0: critical, 1: warning, 2: success, 3: unknown
    const statuses = [
      STATUSES.CRITICAL,
      STATUSES.WARNING,
      STATUSES.SUCCESS,
      STATUSES.UNKNOWN,
    ];
    const signalTypes = [SIGNAL_TYPES.ENTITY, SIGNAL_TYPES.ALERT];

    return Object.values(signals)
      .filter((s) => {
        // filter out signals based on "signalExpandOption"
        switch (signalExpandOption) {
          case 1: // expand unhealthy only
            return statuses.indexOf(s.status) < 2;

          case 2: // expand critical only
          case 3: // expand unhealthy & critical === only show critical
            return statuses.indexOf(s.status) === 0;

          case 0: // case 0: no signal expansion options selected
            return true;

          default:
            return false;
        }
      })
      .sort((a, b) => {
        const a1 =
          a.status === STATUSES.UNKNOWN &&
          a.guid === selections[COMPONENTS.SIGNAL]?.[a.guid]
            ? 1.5 + signalTypes.indexOf(a.type) * 0.1
            : statuses.indexOf(a.status) + signalTypes.indexOf(a.type) * 0.1;

        const b1 =
          b.status === STATUSES.UNKNOWN &&
          b.guid === selections[COMPONENTS.SIGNAL]?.[b.guid]
            ? 1.5 + signalTypes.indexOf(b.type) * 0.1
            : statuses.indexOf(b.status) + signalTypes.indexOf(b.type) * 0.1;

        return a1 - b1;
      })
      .map((signal) => (
        <Signal
          key={signal.guid}
          name={signal.name}
          guid={signal.guid}
          type={signal.type}
          status={signal.status}
          mode={mode}
        />
      ));
  }, [signals]);
  SignalsList.displayName = 'SignalsList';

  const updateStageHandler = (updates = {}) =>
    dispatch({
      type: FLOW_DISPATCH_TYPES.UPDATED,
      component: FLOW_DISPATCH_COMPONENTS.STAGE,
      componentIds: { stageId },
      updates,
      saveFlow,
    });

  const deleteStageHandler = () =>
    dispatch({
      type: FLOW_DISPATCH_TYPES.DELETED,
      component: FLOW_DISPATCH_COMPONENTS.STAGE,
      componentIds: { stageId },
      saveFlow,
    });

  const dragHandleHandler = (b) => (isDragHandleClicked.current = b);

  const dragStartHandler = (e) => {
    if (isDragHandleClicked.current) {
      if (onDragStart) onDragStart(e);
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onDropHandler = (e) => {
    if (onDrop) onDrop(e);
    isDragHandleClicked.current = false;
  };

  const dragEndHandler = () => {
    isDragHandleClicked.current = false;
  };

  const levelDragStartHandler = (e, index) => {
    e.stopPropagation();
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const levelDragOverHandler = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    dragOverItemIndex.current = index;
  };

  const levelDropHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceIndex = dragItemIndex.current;
    const targetIndex = dragOverItemIndex.current;
    dispatch({
      type: FLOW_DISPATCH_TYPES.REORDERED,
      component: FLOW_DISPATCH_COMPONENTS.LEVEL,
      componentIds: { stageId },
      updates: { sourceIndex, targetIndex },
      saveFlow,
    });
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  return (
    <div
      className="stage"
      draggable={mode === MODES.EDIT}
      onDragStart={dragStartHandler}
      onDragOver={onDragOver}
      onDrop={onDropHandler}
      onDragEnd={dragEndHandler}
    >
      <StageHeader
        name={name}
        related={related}
        status={status}
        onUpdate={updateStageHandler}
        onDelete={deleteStageHandler}
        mode={mode}
        onDragHandle={dragHandleHandler}
      />
      <div className="body">
        <div className={`levels ${mode}`}>
          <div className="section-title">
            <HeadingText type={HeadingText.TYPE.HEADING_5}>Levels</HeadingText>
            <Tooltip text={UI_CONTENT.LEVEL.TOOLTIP}>
              <Icon
                className="info-icon"
                type={Icon.TYPE.INTERFACE__INFO__INFO}
              />
            </Tooltip>
            {mode === MODES.EDIT ? (
              <AddStep stageId={stageId} saveFlow={saveFlow} />
            ) : null}
          </div>
          <div className={`step-groups ${mode}`}>
            {levels.map(({ id }, index) => (
              <Level
                key={id}
                stageId={stageId}
                levelId={id}
                order={index + 1}
                onDragStart={(e) => levelDragStartHandler(e, index)}
                onDragOver={(e) => levelDragOverHandler(e, index)}
                onDrop={(e) => levelDropHandler(e)}
                mode={mode}
                saveFlow={saveFlow}
              />
            ))}
          </div>
        </div>
        {mode === MODES.STACKED ? (
          <div className="signals stacked">
            <div className="section-title">
              <HeadingText type={HeadingText.TYPE.HEADING_5}>
                Signals
              </HeadingText>
            </div>
            <div className="signals-listing">
              <SignalsList />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

Stage.propTypes = {
  stageId: PropTypes.string,
  mode: PropTypes.oneOf(Object.values(MODES)),
  signalExpandOption: PropTypes.number,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  saveFlow: PropTypes.func,
};

export default Stage;
