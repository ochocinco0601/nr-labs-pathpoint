import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText, Icon, Radio } from 'nr1';

import { Select } from '../../src/components';
import { sanitizeKpis, sanitizeStages } from '../../src/utils';

const fileReader = new FileReader();
const UPLOADED_FILE_MSG = 'Uploaded file successfully.';

const ImportFlow = ({ accountId, accounts = [], onCreate, onCancel }) => {
  const [jsonText, setJsonText] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState();
  const [jsonStatusMsg, setJsonStatusMsg] = useState('');
  const [showDragging, setShowDragging] = useState(false);
  const [structureOnly, setStructureOnly] = useState(false);

  useEffect(() => {
    if (!selectedAccountId) setSelectedAccountId(accountId);
  }, [accountId, selectedAccountId]);

  fileReader.onload = useCallback(({ target: { result: json } = {} } = {}) => {
    if (!json) return;
    let importedFlow;
    try {
      importedFlow = JSON.parse(json);
    } catch (e) {
      console.error('Error uploading file', e);
    }
    if (importedFlow) {
      if (
        importedFlow.name &&
        importedFlow.refreshInterval &&
        importedFlow.stages &&
        importedFlow.kpis
      ) {
        setJsonText(json);
        setJsonStatusMsg(UPLOADED_FILE_MSG);
      } else {
        setJsonStatusMsg('Uploaded file does not contain a flow!');
      }
    } else {
      setJsonStatusMsg('Error reading file!');
    }
  }, []);

  const accountsSelect = useMemo(
    () =>
      accounts.reduce(
        (acc, { id, name }) => {
          if (selectedAccountId === id) acc.selected = { id, name };

          acc.items.push({
            id,
            selected: selectedAccountId === id,
            option: (
              <div className="account-picker-option">
                <span>{name}</span>
                <span>{id}</span>
              </div>
            ),
          });

          return acc;
        },
        { items: [], selected: null }
      ),
    [accounts, selectedAccountId]
  );

  const createHandler = () => {
    if (!onCreate) return;
    let flowJson;
    try {
      flowJson = JSON.parse(jsonText);
    } catch (e) {
      console.error('Error uploading file', e);
    }
    if (flowJson) {
      const { name, refreshInterval, stages: s, kpis: k } = flowJson;
      if (
        !name ||
        !refreshInterval ||
        !s ||
        !Array.isArray(s) ||
        !k ||
        !Array.isArray(k)
      ) {
        setJsonStatusMsg('Invalid flow JSON!');
        return;
      }
      const stages = sanitizeStages(s, structureOnly);
      const kpis = structureOnly ? [] : sanitizeKpis(k);
      const doc = {
        name,
        refreshInterval,
        stages,
        kpis,
      };
      onCreate(selectedAccountId, doc);
    } else {
      setJsonStatusMsg('Unable to parse JSON!');
    }
  };

  const dragOverHandler = useCallback((e) => {
    e.preventDefault();
    setShowDragging(true);
  }, []);

  const dragLeaveHandler = useCallback((e) => {
    e.preventDefault();
    setShowDragging(false);
  }, []);

  const dropHandler = useCallback((e) => {
    e.preventDefault();
    setShowDragging(false);
    const files = e.dataTransfer?.items || e.dataTransfer.files || [];
    if (files.length !== 1 || (files[0].kind && files[0].kind !== 'file')) {
      setJsonStatusMsg('Unable to read file!');
      return;
    }
    const file = e.dataTransfer.items ? files[0].getAsFile() : files[0];
    if (file) fileReader.readAsText(file);
  }, []);

  const uploadFile = useCallback(
    async ({ target: { files: [file] = [] } = {} } = {}) => {
      setJsonStatusMsg('');
      if (file) fileReader.readAsText(file);
    },
    []
  );

  return (
    <div className="content details full-height">
      <div>
        <div className="flow-subtitle">Import flow</div>
        <HeadingText type={HeadingText.TYPE.HEADING_4}>
          Flow information
        </HeadingText>
      </div>

      <div className="import-form">
        <div className="field-row">
          <div className="account-picker">
            <Select
              title={accountsSelect.selected?.name}
              label="Select your account"
              items={accountsSelect.items}
              onSelect={({ id }) => setSelectedAccountId(id)}
            />
          </div>
          <div className="import-options">
            <div className="import-options-label">Choose to import...</div>
            <div className="import-options-choices">
              <Radio
                checked={structureOnly}
                onClick={() => setStructureOnly(true)}
                label="Structure only (stages, levels, steps)"
              />
              <Radio
                checked={!structureOnly}
                onClick={() => setStructureOnly(false)}
                label="Everything (structure, signals, flow KPIs)"
              />
            </div>
          </div>
        </div>

        <div className="file-drop">
          <div className="file-drop-instructions">
            <Icon type={Icon.TYPE.DOCUMENTS__DOCUMENTS__ATTACHMENT} />
            <span className="instructions">
              <input
                id="file-upload"
                className="visually-hidden"
                type="file"
                accept="application/json"
                onChange={uploadFile}
              />
              <label htmlFor="file-upload" className="upload">
                Upload
              </label>
              , drag a file or paste your JSON code here.
              <span
                className={jsonStatusMsg === UPLOADED_FILE_MSG ? 'ok' : 'error'}
              >
                {jsonStatusMsg}
              </span>
            </span>
          </div>
          <div
            className="drop-zone"
            onDragOver={dragOverHandler}
            onDragLeave={dragLeaveHandler}
            onDrop={dropHandler}
          >
            {showDragging ? (
              <div className="drop-zone-instructions">Drop file here...</div>
            ) : (
              <textarea
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Paste JSON code here"
                value={jsonText}
                onChange={({ target: { value } } = {}) => setJsonText(value)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="button-bar align-right">
        <Button type={Button.TYPE.TERTIARY} onClick={onCancel}>
          Back
        </Button>
        <Button
          type={Button.TYPE.PRIMARY}
          disabled={!jsonText}
          onClick={createHandler}
        >
          Create
        </Button>
      </div>
    </div>
  );
};

ImportFlow.propTypes = {
  accountId: PropTypes.number,
  accounts: PropTypes.array,
  onCreate: PropTypes.func,
  onCancel: PropTypes.func,
};

export default ImportFlow;
