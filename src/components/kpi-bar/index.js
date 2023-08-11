import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import { Button, Icon, HeadingText, PlatformStateContext, Tooltip } from 'nr1';

import { SimpleBillboard } from '@newrelic/nr-labs-components';

import IconsLib from '../icons-lib';
import { KPI_MODES, MODES, SIGNAL_TYPES, UI_CONTENT } from '../../constants';
import { useFetchKpis } from '../../hooks';
import KpiEditButtons from './edit-buttons';
import KpiModal from '../kpi-modal';

const blankKpi = ({
  type = SIGNAL_TYPES.NRQL_QUERY,
  id = -1,
  name = '',
  accountIds = [],
  nrqlQuery = '',
}) => ({
  type,
  id,
  name,
  accountIds,
  nrqlQuery,
});

const metricFromQuery = (results, index) => ({
  value: ((results || [])[index] || {}).value || 0,
  previousValue: ((results || [])[index] || {}).previousValue || '',
});

const KpiBar = ({ kpis = [], onChange = () => null, mode = MODES.KIOSK }) => {
  const { accountId } = useContext(PlatformStateContext);
  const [showModal, setShowModal] = useState(false);
  const [queryResults, setQueryResults] = useState([]);
  const { kpis: qryResults = [] } = useFetchKpis({ kpiData: kpis });
  const selectedKpi = useRef({});
  const selectedKpiIndex = useRef(-1);
  const selectedKpiMode = useRef(KPI_MODES.VIEW);

  const kpisContainer = useRef();

  const dragItemIndex = useRef();
  const dragOverItemIndex = useRef();

  const dragStartHandler = (e, index) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const dragOverHandler = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverItemIndex.current = index;
  };

  const dropHandler = (e) => {
    e.preventDefault();
    const itemIndex = dragItemIndex.current;
    const overIndex = dragOverItemIndex.current;
    if (
      !Number.isInteger(itemIndex) ||
      !Number.isInteger(overIndex) ||
      itemIndex === overIndex
    )
      return;
    const updatedKpis = [...kpis];
    const item = updatedKpis[itemIndex];
    updatedKpis.splice(itemIndex, 1);
    updatedKpis.splice(overIndex, 0, item);
    onChange(updatedKpis);
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  useEffect(() => {
    selectedKpi.current = {};
    selectedKpiIndex.current = -1;
    selectedKpiMode.current = KPI_MODES.VIEW;
    setShowModal(false);
  }, [kpis]);

  useEffect(() => setQueryResults(qryResults), [qryResults]);

  const modeClassText = useMemo(
    () => (mode === MODES.EDIT ? 'Edit' : 'View'),
    [mode]
  );

  const createKpiHandler = useCallback(() => {
    selectedKpi.current = blankKpi({
      id: kpis.length,
      accountIds: [accountId],
    });
    selectedKpiIndex.current = kpis.length;
    selectedKpiMode.current = KPI_MODES.ADD;
    setShowModal(true);
  }, [kpis, accountId]);

  const updateKpiHandler = useCallback(
    (updatedKpi) => {
      if (!onChange) return;
      const kpiIndex = selectedKpiIndex.current;
      const kpiMode = selectedKpiMode.current;
      if (kpiMode === KPI_MODES.ADD) {
        const type = SIGNAL_TYPES.NRQL_QUERY;
        onChange([...kpis, { ...updatedKpi, type }]);
      } else if (kpiMode === KPI_MODES.EDIT) {
        onChange(kpis.map((k, i) => (i === kpiIndex ? updatedKpi : k)));
      } else if (kpiMode === KPI_MODES.DELETE) {
        onChange(kpis.filter((_, i) => i !== kpiIndex));
      }
    },
    [kpis, onChange]
  );

  const editButtonsClickHandler = useCallback(
    (index, editType) => {
      selectedKpi.current = kpis[index];
      selectedKpiIndex.current = index;
      selectedKpiMode.current = editType;
      setShowModal(true);
    },
    [kpis]
  );

  const [scrollPosition, setScrollPosition] = useState(0);

  const shouldHideSliderButton = useCallback(
    (direction) => {
      const { scrollWidth, offsetWidth } = kpisContainer.current || {};
      if (scrollWidth > offsetWidth) {
        switch (direction) {
          case 'left':
            return scrollPosition <= 0;
          case 'right':
            return (
              Math.round(scrollPosition + offsetWidth) >=
              Math.round(scrollWidth - 5)
            );
          default:
            return true;
        }
      }
      return true;
    },
    [scrollPosition]
  );

  const slideKpiBar = useCallback((direction) => {
    const {
      current: container,
      current: { offsetWidth },
    } = kpisContainer || {};
    const elements = Array.from(container.querySelectorAll('.kpi-container'));

    const partialKpiNode = elements.find((el) =>
      direction === 'left'
        ? container.getBoundingClientRect().left -
            el.getBoundingClientRect().left <=
          offsetWidth
        : el.getBoundingClientRect().right -
            container.getBoundingClientRect().left >
          offsetWidth
    );

    if (partialKpiNode) {
      container.scrollLeft +=
        partialKpiNode.getBoundingClientRect().left -
        container.getBoundingClientRect().left;
      setScrollPosition(container.scrollLeft);
    }
  }, []);

  return (
    <div className="kpi-bar">
      <div className="kpi-bar-heading">
        <div className={`heading-title heading${modeClassText}ModeWidth`}>
          <HeadingText type={HeadingText.TYPE.HEADING_4}>
            {UI_CONTENT.KPI_BAR.TITLE || 'Flow KPIs'}
          </HeadingText>
          <Tooltip text={UI_CONTENT.KPI_BAR.TITLE_TOOLTIP}>
            <Icon
              className="info-icon"
              type={Icon.TYPE.INTERFACE__INFO__INFO}
            />
          </Tooltip>
        </div>
        {mode === MODES.EDIT ? (
          <div className="kpi-bar-add-button">
            <Button
              type={Button.TYPE.SECONDARY}
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS__V_ALTERNATE}
              onClick={createKpiHandler}
            >
              Create new KPI
            </Button>
          </div>
        ) : null}
      </div>
      <div
        id="slider-button-left"
        className="slider-button"
        style={{
          visibility: shouldHideSliderButton('left') ? 'hidden' : 'visible',
        }}
        onClick={() => slideKpiBar('left')}
      >
        <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT} />
      </div>
      <div
        id="kpi-containers"
        ref={kpisContainer}
        className={`kpi-containers kpiBar${modeClassText}ModeMaxWidth`}
      >
        {kpis.map((kpi, index) => (
          <div
            id={`kpi-container-${index}`}
            key={index}
            className="kpi-container"
            draggable={mode === MODES.EDIT}
            onDragStart={(e) => dragStartHandler(e, index)}
            onDragOver={(e) => dragOverHandler(e, index)}
            onDrop={(e) => dropHandler(e)}
          >
            {mode === MODES.EDIT && (
              <span className="drag-handle">
                <IconsLib type={IconsLib.TYPES.HANDLE} />
              </span>
            )}
            <div className="kpi-data">
              <SimpleBillboard
                metric={metricFromQuery(queryResults, index)}
                title={{ name: kpi.name }}
              />
            </div>
            {mode === MODES.EDIT && (
              <KpiEditButtons index={index} onClick={editButtonsClickHandler} />
            )}
          </div>
        ))}
      </div>
      <div
        id="slider-button-right"
        className="slider-button"
        style={{
          visibility: shouldHideSliderButton('right') ? 'hidden' : 'visible',
        }}
        onClick={() => slideKpiBar('right')}
      >
        <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT} />
      </div>
      <KpiModal
        kpi={selectedKpi.current}
        kpiIndex={selectedKpiIndex.current}
        kpiMode={selectedKpiMode.current}
        showModal={showModal}
        setShowModal={setShowModal}
        updateKpiArray={updateKpiHandler}
      />
    </div>
  );
};

KpiBar.propTypes = {
  kpis: PropTypes.array,
  onChange: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(MODES)),
};

export default KpiBar;
