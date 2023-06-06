import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText, PlatformStateContext } from 'nr1';

import { SimpleBillboard } from '@newrelic/nr-labs-components';

import { KPI_MODES, MODES, SIGNAL_TYPES } from '../../constants';
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

  return (
    <div className="kpi-bar">
      <div className="kpi-bar-heading">
        <div className={`heading${modeClassText}ModeWidth`}>
          <HeadingText
            style={{
              ...(mode !== MODES.EDIT ? { lineHeight: '20px' } : {}),
            }}
            type={
              HeadingText.TYPE[mode === MODES.EDIT ? 'HEADING_4' : 'HEADING_3']
            }
          >
            Critical Measures
          </HeadingText>
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
      <div className={`kpi-containers kpiBar${modeClassText}ModeMaxWidth`}>
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`kpi-container kpiContainer${modeClassText}ModeWidth`}
          >
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
