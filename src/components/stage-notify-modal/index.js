import React, {
  Fragment,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import { BlockText, Button, HeadingText, Icon, navigation } from 'nr1';

import Modal from '../modal';
import { FlowContext, StagesContext } from '../../contexts';

const StageNotifyModal = forwardRef(
  (
    {
      heading = '',
      text = '',
      icon,
      iconColor = '',
      itemsTitle = '',
      items = [],
    },
    ref
  ) => {
    const { id: flowId, stages = [] } = useContext(FlowContext);
    const { updateStagesDataRef } = useContext(StagesContext);
    const [hidden, setHidden] = useState(true);
    const [itemNames, setItemNames] = useState({});

    useImperativeHandle(ref, () => ({
      open: () => setHidden(false),
    }));

    useEffect(() => {
      setItemNames(
        items.reduce((acc, { stageId, levelId, stepId, guid }) => {
          const { levels = [], name: stageName } = (stages || []).find(
            ({ id }) => id === stageId
          );
          const levelIndex = levels.findIndex(({ id }) => id === levelId);
          const { title = '(untitled)', signals = [] } = (
            levels[levelIndex]?.steps || []
          ).find(({ id }) => id === stepId);
          const signal = guid
            ? signals.find((s) => s.guid === guid) || {}
            : null;
          return {
            ...acc,
            [stageId]: {
              ...acc[stageId],
              [levelId]: {
                ...acc[stageId]?.[levelId],
                [stepId]: {
                  stageName,
                  levelOrder: levelIndex + 1,
                  title,
                  signal,
                },
              },
            },
          };
        }, {})
      );
    }, [items]);

    const updateSignalsHandler = useCallback(
      (stageId, levelId, stepId) => {
        closeHandler();
        updateStagesDataRef?.();
        const { stageName, levelOrder } =
          itemNames[stageId]?.[levelId]?.[stepId] || {};
        const { levels } = stages?.find(({ id }) => id === stageId) || {};
        const { steps } = levels?.find(({ id }) => id === levelId) || {};
        const step = steps?.find(({ id }) => id === stepId);
        navigation.openStackedNerdlet({
          id: 'signal-selection',
          urlState: {
            flowId,
            stageId,
            stageName,
            levelId,
            levelOrder,
            step,
          },
        });
      },
      [flowId, itemNames, stages]
    );

    const displayName = useCallback(
      (stageId, levelId, stepId) => {
        const { signal, title } = itemNames[stageId]?.[levelId]?.[stepId] || {};
        if (signal) return signal.name || '(unknown)';
        return title;
      },
      [itemNames]
    );

    const closeHandler = useCallback(() => setHidden(true), []);

    return (
      <Modal hidden={hidden} onClose={closeHandler}>
        <div className="stage-notify-modal">
          <div className="modal-header">
            {icon ? <Icon type={icon} color={iconColor} /> : null}
            <HeadingText type={HeadingText.TYPE.HEADING_3}>
              {heading}
            </HeadingText>
          </div>
          <div className="modal-content">
            <BlockText>{text}</BlockText>
            {items.length ? (
              <div className="items-table">
                {itemsTitle ? (
                  <>
                    <HeadingText
                      className="items-table-cell heading"
                      type={HeadingText.TYPE.HEADING_6}
                    >
                      {itemsTitle}
                    </HeadingText>
                    <div className="items-table-cell rule" />
                  </>
                ) : null}
                {items.map(({ stageId, levelId, stepId }, i) => (
                  <Fragment key={i}>
                    <div
                      title={displayName(stageId, levelId, stepId)}
                      className="items-table-cell item-name"
                    >
                      {displayName(stageId, levelId, stepId)}
                    </div>
                    <Button
                      className="items-table-cell"
                      variant={Button.VARIANT.PRIMARY}
                      sizeType={Button.SIZE_TYPE.SMALL}
                      onClick={() =>
                        updateSignalsHandler(stageId, levelId, stepId)
                      }
                    >
                      Update signals
                    </Button>
                    <div className="items-table-cell rule" />
                  </Fragment>
                ))}
              </div>
            ) : null}
          </div>
          <div className="modal-footer">
            <Button type={Button.TYPE.TERTIARY} onClick={closeHandler}>
              Back
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
);

StageNotifyModal.propTypes = {
  heading: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  itemsTitle: PropTypes.string,
  items: PropTypes.array,
};

StageNotifyModal.displayName = 'StageNotifyModal';

export default StageNotifyModal;
