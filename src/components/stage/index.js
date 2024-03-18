import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { HeadingText, Icon, Tooltip } from 'nr1';

import Level from '../level';
import Signal from '../signal';
import StageHeader from './header';
import AddStep from '../add-step';
import StageNotifyModal from '../stage-notify-modal';
import {
  COMPONENTS,
  MODES,
  SIGNAL_EXPAND,
  SIGNAL_TYPES,
  STATUSES,
  UI_CONTENT,
} from '../../constants';

import {
  AppContext,
  FlowDispatchContext,
  SelectionsContext,
  SignalsClassificationsContext,
  SignalsContext,
  StagesContext,
} from '../../contexts';
import { FLOW_DISPATCH_COMPONENTS, FLOW_DISPATCH_TYPES } from '../../reducers';

const Stage = ({
  stageId,
  mode = MODES.INLINE,
  signalExpandOption = 0,
  stageIndex = -1,
  onDragStart,
  onDragOver,
  onDrop,
  saveFlow,
}) => {
  const stages = useContext(StagesContext);
  const signalsDetails = useContext(SignalsContext);
  const dispatch = useContext(FlowDispatchContext);
  const { selections: { [COMPONENTS.SIGNAL]: selectedSignal } = {} } =
    useContext(SelectionsContext);
  const {
    entitiesInStepCount = {},
    signalsWithNoAccess = {},
    signalsWithNoStatus = {},
  } = useContext(SignalsClassificationsContext);
  const { maxEntitiesInStep } = useContext(AppContext);
  const [name, setName] = useState('Stage');
  const [levels, setLevels] = useState([]);
  const [related, setRelated] = useState({});
  const [signals, setSignals] = useState({});
  const [status, setStatus] = useState(STATUSES.UNKNOWN);
  const [tooManyEntitiesInStep, setTooManyEntitiesInStep] = useState([]);
  const [missingSignals, setMissingSignals] = useState([]);
  const isDragHandleClicked = useRef(false);
  const dragItemIndex = useRef();
  const dragOverItemIndex = useRef();
  const missingSignalsModal = useRef();
  const tooManySignalsModal = useRef();

  useEffect(() => {
    const stage = (stages || []).find(({ id }) => id === stageId) || {};
    setName(stage.name || 'Stage');
    setLevels(stage.levels || []);
    setRelated(stage.related || {});
    setStatus(stage.status || STATUSES.UNKNOWN);
  }, [stageId, stages]);

  useEffect(() => {
    setTooManyEntitiesInStep(
      Object.keys(entitiesInStepCount[stageId]).reduce(
        (acc, levelId) =>
          Object.keys(entitiesInStepCount[stageId][levelId]).reduce(
            (acc, stepId) =>
              entitiesInStepCount[stageId][levelId][stepId] > maxEntitiesInStep
                ? [...acc, { stageId, levelId, stepId }]
                : acc,
            acc
          ),
        []
      )
    );
  }, [entitiesInStepCount]);

  useEffect(() => {
    setMissingSignals(
      Object.keys(signalsWithNoStatus[stageId]).reduce(
        (acc, levelId) =>
          Object.keys(signalsWithNoStatus[stageId][levelId]).reduce(
            (acc, stepId) =>
              Object.keys(signalsWithNoStatus[stageId][levelId][stepId]).reduce(
                (acc, guid) => [...acc, { stageId, levelId, stepId, guid }],
                acc
              ),
            acc
          ),
        []
      )
    );
  }, [signalsWithNoStatus]);

  useEffect(() => {
    setSignals(
      levels.reduce(
        (acc, { steps = [] }) => ({
          ...acc,
          ...steps.reduce(
            (acc, { signals = [] }) => ({
              ...acc,
              ...signals.reduce((acc, { guid, name, status, type }) => {
                return {
                  ...acc,
                  [guid]: {
                    name: signalsDetails[guid]?.name || name,
                    status,
                    guid,
                    type,
                  },
                };
              }, {}),
            }),
            {}
          ),
        }),
        {}
      )
    );
  }, [levels]);

  const SignalsList = memo(() => {
    // set statuses in order of most critical to least critical -> 0: critical, 1: warning, 2: success, 3: unknown
    const orderedStatuses = [
      STATUSES.CRITICAL,
      STATUSES.WARNING,
      STATUSES.SUCCESS,
      STATUSES.UNKNOWN,
    ];
    const signalTypes = [SIGNAL_TYPES.ENTITY, SIGNAL_TYPES.ALERT];

    const expandOption =
      mode === MODES.STACKED && signalExpandOption & SIGNAL_EXPAND.ALL
        ? signalExpandOption ^ SIGNAL_EXPAND.ALL
        : signalExpandOption;

    return Object.values(signals)
      .filter((s) => {
        switch (expandOption) {
          case SIGNAL_EXPAND.UNHEALTHY_ONLY:
            return (
              orderedStatuses.indexOf(s.status) <
              orderedStatuses.indexOf(STATUSES.SUCCESS)
            );

          case SIGNAL_EXPAND.CRITICAL_ONLY:
          case SIGNAL_EXPAND.UNHEALTHY_ONLY | SIGNAL_EXPAND.CRITICAL_ONLY:
            return (
              orderedStatuses.indexOf(s.status) ===
              orderedStatuses.indexOf(STATUSES.CRITICAL)
            );

          default:
            return true;
        }
      })
      .sort((a, b) => {
        const a1 =
          a.status === STATUSES.UNKNOWN && a.guid === selectedSignal
            ? 1.5 + signalTypes.indexOf(a.type) * 0.1
            : orderedStatuses.indexOf(a.status) +
              signalTypes.indexOf(a.type) * 0.1;

        const b1 =
          b.status === STATUSES.UNKNOWN && b.guid === selectedSignal
            ? 1.5 + signalTypes.indexOf(b.type) * 0.1
            : orderedStatuses.indexOf(b.status) +
              signalTypes.indexOf(b.type) * 0.1;

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
    <>
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
              {stageIndex === 0 ? (
                <>
                  <HeadingText type={HeadingText.TYPE.HEADING_5}>
                    Levels
                  </HeadingText>
                  <Tooltip text={UI_CONTENT.LEVEL.TOOLTIP}>
                    <Icon
                      className="info-icon"
                      type={Icon.TYPE.INTERFACE__INFO__INFO}
                    />
                  </Tooltip>
                </>
              ) : (
                <div className="empty-header"></div>
              )}
              {missingSignals.length ? (
                <Tooltip text={UI_CONTENT.STAGE.MISSING_SIGNALS}>
                  <span
                    className="notify missing-signals"
                    onClick={() => missingSignalsModal.current?.open?.()}
                  >
                    <Icon type={Icon.TYPE.INTERFACE__STATE__WARNING} />
                  </span>
                </Tooltip>
              ) : null}
              {tooManyEntitiesInStep.length ? (
                <Tooltip text={UI_CONTENT.STAGE.TOO_MANY_SIGNALS}>
                  <span
                    className="notify too-many-signals"
                    onClick={() => tooManySignalsModal.current?.open?.()}
                  >
                    <Icon type={Icon.TYPE.INTERFACE__STATE__CRITICAL} />
                  </span>
                </Tooltip>
              ) : null}
              {stageId in signalsWithNoAccess &&
              Object.keys(signalsWithNoAccess[stageId]).length ? (
                <Tooltip text={UI_CONTENT.STAGE.NO_ACCESS_SIGNALS}>
                  <span className="notify no-access">
                    <Icon type={Icon.TYPE.INTERFACE__STATE__UNAVAILABLE} />
                  </span>
                </Tooltip>
              ) : null}
              {mode === MODES.EDIT ? (
                <AddStep stageId={stageId} saveFlow={saveFlow} />
              ) : null}
            </div>
            <div className={`step-groups ${mode}`}>
              {levels
                .filter((level) =>
                  level.steps.reduce(
                    (acc, cur) =>
                      signalExpandOption === SIGNAL_EXPAND.NONE || // no expansion options selected
                      signalExpandOption === SIGNAL_EXPAND.ALL || // expand all signals
                      acc + cur.signals.length
                        ? { ...acc, ...cur }
                        : acc,
                    0
                  )
                )
                .map(({ id }, index) => (
                  <Level
                    key={id}
                    stageId={stageId}
                    levelId={id}
                    order={index + 1}
                    onDragStart={(e) => levelDragStartHandler(e, index)}
                    onDragOver={(e) => levelDragOverHandler(e, index)}
                    onDrop={(e) => levelDropHandler(e)}
                    mode={mode}
                    signalExpandOption={signalExpandOption}
                    saveFlow={saveFlow}
                  />
                ))}
            </div>
          </div>
          {mode === MODES.STACKED ? (
            <div className="signals stacked">
              <div className="section-title">
                {stageIndex === 0 ? (
                  <HeadingText type={HeadingText.TYPE.HEADING_5}>
                    Signals
                  </HeadingText>
                ) : (
                  <div className="empty-header"></div>
                )}
              </div>
              <div className="signals-listing">
                <SignalsList />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <StageNotifyModal
        heading={UI_CONTENT.SIGNAL.MISSING.HEADING}
        text={UI_CONTENT.SIGNAL.MISSING.DETAILS}
        icon={Icon.TYPE.INTERFACE__STATE__WARNING__WEIGHT_BOLD}
        iconColor="#F07A0E"
        itemsTitle="Signal name"
        items={missingSignals}
        ref={missingSignalsModal}
      />
      <StageNotifyModal
        heading={UI_CONTENT.SIGNAL.TOO_MANY.HEADING}
        text={UI_CONTENT.SIGNAL.TOO_MANY.DETAILS}
        icon={Icon.TYPE.INTERFACE__STATE__CRITICAL__WEIGHT_BOLD}
        iconColor="#df2d24"
        itemsTitle="Step name"
        items={tooManyEntitiesInStep}
        ref={tooManySignalsModal}
      />
    </>
  );
};

Stage.propTypes = {
  stageId: PropTypes.string,
  mode: PropTypes.oneOf(Object.values(MODES)),
  signalExpandOption: PropTypes.number,
  stageIndex: PropTypes.number,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  saveFlow: PropTypes.func,
};

export default Stage;
