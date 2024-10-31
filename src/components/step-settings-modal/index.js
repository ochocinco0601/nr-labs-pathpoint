import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  DataTable,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableRowCell,
  EmptyState,
  HeadingText,
  Icon,
  Modal,
  RadioGroup,
  Radio,
  Select,
  SelectItem,
  Switch,
  TextField,
  Tooltip,
} from 'nr1';

import DeleteConfirmModal from '../delete-confirm-modal';
import {
  STEP_STATUS_OPTIONS,
  STEP_STATUS_UNITS,
  UI_CONTENT,
} from '../../constants';

const signalTableHeader = (
  <DataTableHeader>
    <DataTableHeaderCell name="name" value="name">
      Name
    </DataTableHeaderCell>
    <DataTableHeaderCell name="type" value="type">
      Type
    </DataTableHeaderCell>
  </DataTableHeader>
);

const calculateTableHeight = (selectedCount, signalCount) => {
  if (signalCount >= 10) {
    return '10rows';
  }

  if (selectedCount === 0 || signalCount < 10) {
    return `${signalCount}rows`;
  }

  return `${selectedCount}rows`;
};

const StepSettingsModal = ({
  title,
  stepStatusOption,
  stepStatusValue,
  stepStatusUnit,
  signals,
  hidden = true,
  onConfirm,
  onChange,
  onClose,
}) => {
  const [deleteModalHidden, setDeleteModalHidden] = useState(true);
  const [settingsModalHidden, setSettingsModalHidden] = useState(true);
  const [statusWeightValue, setStatusWeightValue] = useState('');
  const [statusOption, setStatusOption] = useState(STEP_STATUS_OPTIONS.WORST);
  const [statusWeightUnit, setStatusWeightUnit] = useState(
    STEP_STATUS_UNITS.PERCENT
  );
  const [checked, setChecked] = useState(false);
  const [tableSettings, setTableSettings] = useState({});
  const [selectedSignals, setSelectedSignals] = useState([]);
  const [tableSelection, setTableSelection] = useState({});

  useEffect(() => setSettingsModalHidden(hidden), [hidden]);
  useEffect(() => setStatusOption(stepStatusOption), [stepStatusOption]);
  useEffect(() => setStatusWeightUnit(stepStatusUnit), [stepStatusUnit]);

  useEffect(() => {
    if (!checked) {
      setStatusWeightValue('');
      setStatusWeightUnit(STEP_STATUS_UNITS.PERCENT);
    } else {
      setStatusWeightUnit(stepStatusUnit);
    }
  }, [checked]);

  useEffect(() => {
    if (
      stepStatusValue !== '' &&
      stepStatusOption &&
      stepStatusOption === STEP_STATUS_OPTIONS.WORST
    ) {
      setStatusWeightValue(stepStatusValue);
      setChecked(true);
    }
  }, [stepStatusValue]);

  useEffect(() => {
    const defaultSignalSelection = signals.filter((s) => {
      return !s.included || s.included === true || s.included === undefined;
    });
    setTableSettings({
      ariaLabel: 'Signals',
      items: signals,
    });
    setSelectedSignals(defaultSignalSelection);

    const sel = signals.reduce((acc, sig, idx) => {
      acc[idx] = sig.included === undefined ? 'true' : sig.included;
      return acc;
    }, {});

    if (sel) setTableSelection(sel);
  }, [signals]);

  const tableHeight = useMemo(
    () =>
      calculateTableHeight(Object.keys(tableSelection).length, signals.length),
    [tableSelection, signals.length]
  );

  const closeHandler = useCallback(
    (action) => {
      switch (action) {
        case 'update':
          if (onChange) {
            onChange({
              statusOption: statusOption,
              statusWeightUnit: statusWeightUnit,
              statusWeightValue: statusWeightValue,
              signals: selectedSignals,
            });
            if (onClose) onClose();
          }
          break;

        case 'delete':
          setDeleteModalHidden(false);
          setSettingsModalHidden(true);
      }
      if (onClose) onClose();
    },
    [
      onChange,
      selectedSignals,
      statusOption,
      statusWeightUnit,
      statusWeightValue,
    ]
  );

  const onStatusChange = useCallback((e, value) => {
    if (value === STEP_STATUS_OPTIONS.BEST) {
      setStatusWeightUnit(STEP_STATUS_UNITS.PERCENT);
      setStatusWeightValue('');
      setChecked(false);
    }
    setStatusOption(value);
  }, []);

  const toggleApplySwitch = useCallback(() => {
    setChecked((prevChecked) => !prevChecked);
  }, [signals]);

  const handleStatusUnitChange = useCallback((e, val) => {
    setStatusWeightUnit(val);
    setStatusWeightValue('');
  }, []);

  const handleStatusValueChange = useCallback(
    (e) => {
      const input = e.target.value;

      if (statusWeightUnit === STEP_STATUS_UNITS.PERCENT) {
        const numInput = parseInt(input);
        if (numInput >= 1 && numInput <= 100) {
          setStatusWeightValue(input);
        } else if (input === '') {
          setStatusWeightValue('');
        }
      }

      if (statusWeightUnit === STEP_STATUS_UNITS.COUNT) {
        const numInput = parseInt(input);
        if (numInput >= 1 && numInput <= selectedSignals.length) {
          setStatusWeightValue(input);
        } else if (input === '') {
          setStatusWeightValue('');
        }
      }
    },
    [statusWeightUnit]
  );

  const selectItemHandler = useCallback(
    (sel) => {
      const updatedSignals = signals.map((signal, idx) => {
        const isSelected = sel[idx];
        return { ...signal, included: isSelected || false };
      });

      setSelectedSignals(updatedSignals);

      const updatedTable = Object.keys(sel).reduce((acc, key) => {
        if (sel[key]) acc[key] = true;
        return acc;
      }, {});

      setTableSelection(updatedTable);
    },
    [signals]
  );

  return (
    <Modal hidden={settingsModalHidden} onClose={closeHandler}>
      <HeadingText type={HeadingText.TYPE.HEADING_1}>
        {UI_CONTENT.STEP.CONFIG.TITLE}
      </HeadingText>
      <HeadingText type={HeadingText.TYPE.HEADING_3}>{title || ''}</HeadingText>
      <div className="step-form">
        <div className="step-config-section">
          <HeadingText
            className="step-config-header"
            type={HeadingText.TYPE.HEADING_4}
          >
            {UI_CONTENT.STEP.CONFIG.SELECT_SIGNALS.TITLE}
          </HeadingText>
          <span>{UI_CONTENT.STEP.CONFIG.SELECT_SIGNALS.DESCRIPTION}</span>
          <br />
          {signals.length > 0 ? (
            <div className="signal-settings-table">
              <DataTable
                {...tableSettings}
                height={tableHeight}
                selectionType={DataTable.SELECTION_TYPE.MULTIPLE}
                densityType={DataTable.DENSITY_TYPE.COMPACT}
                selection={tableSelection}
                onSelectionChange={selectItemHandler}
              >
                {signalTableHeader}
                <DataTableBody>
                  {() => (
                    <DataTableRow>
                      <DataTableRowCell />
                      <DataTableRowCell />
                    </DataTableRow>
                  )}
                </DataTableBody>
              </DataTable>
            </div>
          ) : (
            <EmptyState
              type={EmptyState.TYPE.USER_CLEARED}
              illustrationType={EmptyState.ILLUSTRATION_TYPE.ILLUSTRATION_03}
              title={UI_CONTENT.STEP.CONFIG.EMPTY_STATE}
            />
          )}
        </div>
        <div className="step-config-section">
          <HeadingText
            className="step-config-header"
            type={HeadingText.TYPE.HEADING_4}
          >
            {UI_CONTENT.STEP.CONFIG.STATUS_CONFIG.TITLE}
          </HeadingText>
          <span>{UI_CONTENT.STEP.CONFIG.STATUS_CONFIG.DESCRIPTION}</span>
          <br />
          <RadioGroup value={statusOption} onChange={onStatusChange}>
            <div className="config-radio-btn">
              <Radio
                label={UI_CONTENT.STEP.CONFIG.STATUS_CONFIG.RADIO_WORST_LABEL}
                value={STEP_STATUS_OPTIONS.WORST}
              />
              <Tooltip text={UI_CONTENT.STEP.CONFIG.TOOLTIPS.WORST}>
                <Icon
                  className="info-icon"
                  type={Icon.TYPE.INTERFACE__INFO__INFO}
                />
              </Tooltip>
            </div>
            <Switch
              className="config-switch"
              disabled={
                statusOption === STEP_STATUS_OPTIONS.BEST ? true : false
              }
              checked={checked}
              label={UI_CONTENT.STEP.CONFIG.STATUS_CONFIG.APPLY_LABEL}
              onChange={toggleApplySwitch}
            />
            <div className="worst-status-form">
              <TextField
                className="status-weight-value"
                disabled={!checked}
                name="step-percent"
                placeholder="1"
                value={statusWeightValue || ''}
                onChange={handleStatusValueChange}
              />
              <Select
                onChange={handleStatusUnitChange}
                value={statusWeightUnit}
                disabled={!checked}
              >
                <SelectItem value={STEP_STATUS_UNITS.PERCENT}>
                  {UI_CONTENT.STEP.CONFIG.STATUS_CONFIG.SELECT.PERCENT}
                </SelectItem>
                <SelectItem value={STEP_STATUS_UNITS.COUNT}>
                  {UI_CONTENT.STEP.CONFIG.STATUS_CONFIG.SELECT.COUNT}
                </SelectItem>
              </Select>
            </div>
            <div className="config-radio-btn">
              <Radio
                label={UI_CONTENT.STEP.CONFIG.STATUS_CONFIG.RADIO_BEST_LABEL}
                value={STEP_STATUS_OPTIONS.BEST}
              />
              <Tooltip text={UI_CONTENT.STEP.CONFIG.TOOLTIPS.BEST}>
                <Icon
                  className="info-icon"
                  type={Icon.TYPE.INTERFACE__INFO__INFO}
                />
              </Tooltip>
            </div>
          </RadioGroup>
        </div>
      </div>
      <div className="step-button-bar">
        <Button
          type={Button.TYPE.DESTRUCTIVE}
          onClick={() => closeHandler('delete')}
        >
          Delete
        </Button>
        <div className="right">
          <Button
            type={Button.TYPE.TERTIARY}
            onClick={() => closeHandler('cancel')}
          >
            Cancel
          </Button>
          <Tooltip
            text={
              Object.keys(tableSelection).length === 0
                ? UI_CONTENT.STEP.CONFIG.TOOLTIPS.SAVE_BTN
                : ''
            }
          >
            <Button
              disabled={Object.keys(tableSelection).length === 0}
              type={Button.TYPE.PRIMARY}
              onClick={() => closeHandler('update')}
            >
              Save
            </Button>
          </Tooltip>
        </div>
      </div>
      <DeleteConfirmModal
        name={title}
        type="step"
        hidden={deleteModalHidden}
        onConfirm={onConfirm}
        onClose={() => setDeleteModalHidden(true)}
      />
    </Modal>
  );
};

StepSettingsModal.propTypes = {
  title: PropTypes.string,
  stepStatusOption: PropTypes.string,
  stepStatusValue: PropTypes.string,
  stepStatusUnit: PropTypes.string,
  signals: PropTypes.array,
  hidden: PropTypes.bool,
  onConfirm: PropTypes.func,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
};

export default StepSettingsModal;
