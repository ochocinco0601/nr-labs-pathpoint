import React, { useCallback, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { EmptyState, PlatformStateContext, Button } from 'nr1';

import { KpiModal } from '../';
import { SimpleBillboard } from '@newrelic/nr-labs-components';

import { useFetchKpis } from '../../hooks';
import { MODES, KPI_MODES } from '../../constants';

const KpiBar = ({
  mode = MODES.KIOSK, // valid modes: kiosk, list, edit
  kpiArray = [],
  setKpiArray = setKpiArray ? setKpiArray : () => null,
}) => {
  const { accountId } = useContext(PlatformStateContext);

  const [showModal, setShowModal] = useState(false);
  const [currentKpi, setCurrentKpi] = useState({});
  const [kpiMode, setKpiMode] = useState(KPI_MODES.VIEW);
  const [kpiIndex, setKpiIndex] = useState(-1);

  useEffect(() => {
    if (kpiMode === KPI_MODES.VIEW) {
      updateKpis(kpiArray);
    }
  }, [kpiMode]);

  const [queryResults, setQueryResults] = useState([]);

  const hookData = useFetchKpis({ kpiData: kpiArray });

  useEffect(() => {
    if (hookData.kpis && hookData.kpis.length) {
      setQueryResults(hookData.kpis);
    }
  }, [hookData]);

  const updateKpis = useCallback((updatedKpiArray) => {
    setKpiIndex(-1);
    setShowModal(false);
    setKpiMode(KPI_MODES.VIEW);
    setKpiArray(updatedKpiArray);
  });

  const deleteKpi = useCallback((index) => {
    updateKpis(kpiArray.filter((_, i) => i !== index));
  });

  const updateKpi = useCallback((updatedKpi, kpiIndex) => {
    const newKpis = kpiArray.map((k, i) => {
      if (i === kpiIndex) {
        return { ...k, ...updatedKpi };
      } else {
        return k;
      }
    });
    updateKpis(newKpis);
  });

  const addNewKpi = useCallback(
    (currentKpi) => {
      currentKpi.accountIds = [Number(currentKpi.accountIds)];
      const newKpiArray = [...kpiArray, currentKpi];
      updateKpis(newKpiArray);
    },
    [kpiArray]
  );

  return (
    <div className="kpi-bar">
      <div className="kpi-bar-heading">
        {mode !== MODES.EDIT ? (
          <div className="kpi-bar-title buttonEditModeWidth">
            <label>Critical Measures</label>
          </div>
        ) : (
          <div>
            <div className="kpi-bar-edit-mode-title buttonEditModeWidth">
              <label>Critical Measures</label>
            </div>
            <div className="kpi-bar-add-button">
              <Button
                type={Button.TYPE.SECONDARY}
                iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS__V_ALTERNATE}
                sizeType={Button.SIZE_TYPE.LARGE}
                onClick={() => {
                  setKpiIndex(kpiArray.length); // new kpiArray bucket being added
                  setCurrentKpi({
                    id: kpiArray.length
                      ? kpiArray[kpiArray.length - 1].id + 1
                      : 0,
                    accountIds: [accountId],
                    name: '',
                    nrqlQuery: '',
                  });
                  setKpiMode(KPI_MODES.ADD);
                  setShowModal(true);
                }}
              >
                Create new KPI
              </Button>
            </div>
            <div id="kpi-modal">
              {kpiMode !== KPI_MODES.VIEW && (
                <KpiModal
                  kpi={currentKpi}
                  kpiIndex={kpiIndex}
                  kpiMode={kpiMode} // kpiMode = "view" / "add" kpi / "edit" existing kpi / "delete" existing kpi
                  showModal={showModal}
                  setShowModal={setShowModal}
                  updateKpiArray={
                    kpiMode === KPI_MODES.ADD
                      ? addNewKpi
                      : kpiMode === KPI_MODES.EDIT
                      ? updateKpi
                      : deleteKpi
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className={`kpi-containers ${
          mode === MODES.EDIT
            ? 'kpiBarEditModeMaxWidth'
            : 'kpiBarViewModeMaxWidth'
        }`}
      >
        {!kpiArray || !kpiArray.length ? (
          <div className="empty-state-component">
            <EmptyState
              fullWidth
              title="No KPIs available"
              type={EmptyState.TYPE.NORMAL}
            />
          </div>
        ) : (
          kpiArray.map((kpi, index) => (
            <div
              key={index}
              className={`kpi-container ${
                mode === MODES.EDIT
                  ? 'kpiContainerEditModeWidth'
                  : 'kpiContainerViewModeWidth'
              }`}
            >
              <div className="kpi-data">
                <SimpleBillboard
                  metric={{
                    value: ((queryResults || [])[index] || {}).value || 0,
                    previousValue:
                      ((queryResults || [])[index] || {}).previousValue || '',
                  }}
                  title={{
                    name: kpi.name,
                  }}
                />
              </div>
              {mode === MODES.EDIT && (
                <div className="kpi-buttons">
                  <Button
                    className="box-shadow"
                    type={Button.TYPE.SECONDARY}
                    iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__CLOSE}
                    sizeType={Button.SIZE_TYPE.SMALL}
                    onClick={() => {
                      setKpiIndex(index); // kpi array bucket being deleted
                      setCurrentKpi(kpi);
                      setKpiMode(KPI_MODES.DELETE);
                      setShowModal(true);
                    }}
                  />
                  <Button
                    className="box-shadow"
                    type={Button.TYPE.SECONDARY}
                    iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EDIT}
                    sizeType={Button.SIZE_TYPE.SMALL}
                    onClick={() => {
                      setKpiIndex(index); // kpiArray bucket being edited
                      setCurrentKpi(kpi);
                      setKpiMode(KPI_MODES.EDIT);
                      setShowModal(true);
                    }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

KpiBar.propTypes = {
  mode: PropTypes.oneOf(Object.values(MODES)),
  kpiArray: PropTypes.object,
  setKpiArray: PropTypes.func,
};

export default KpiBar;
