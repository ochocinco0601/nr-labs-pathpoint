import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  BlockText,
  Button,
  Checkbox,
  CheckboxGroup,
  HeadingText,
  Icon,
  Modal,
  PlatformStateContext,
  TextField,
} from 'nr1';
import { useServiceLevelsSearch } from '../../hooks';
import { isMatchPattern } from '../../utils/regex';

const EditStepModal = ({
  stageName = 'Stage',
  stepGroup = 0,
  stepName = 'Step',
  existingSignals = [],
  hidden = true,
  onChange,
  onClose,
}) => {
  const [selectedSignals, setSelectedSignals] = useState([]);
  const [searchText, setSearchText] = useState('');
  const { accountId } = useContext(PlatformStateContext);
  const { serviceLevels, refetchServiceLevels } = useServiceLevelsSearch({
    accountId,
  });
  const [serviceLevelsLookup, setServiceLevelsLookup] = useState({});

  useEffect(() => setSelectedSignals(existingSignals), []);

  useEffect(
    () =>
      setServiceLevelsLookup(
        serviceLevels.reduce(
          (acc, { guid, name }) => ({ ...acc, [guid]: name }),
          {}
        )
      ),
    [serviceLevels]
  );

  const closeHandler = useCallback(() => {
    if (onClose) onClose();
  }, []);

  return (
    <Modal hidden={hidden} onClose={closeHandler}>
      <div className="edit-step-modal">
        <div className="signals-picker">
          <div className="heading">
            <HeadingText
              type={HeadingText.TYPE.HEADING_4}
              className="edit-step-stage-name"
            >
              {stageName}
            </HeadingText>
            <HeadingText
              type={HeadingText.TYPE.HEADING_5}
              className="step-group"
            >
              {stepGroup}
            </HeadingText>
            <HeadingText type={HeadingText.TYPE.HEADING_4}>
              {stepName}
            </HeadingText>
          </div>

          <div className="signals-search-bar">
            <TextField
              className="search-input"
              type={TextField.TYPE.SEARCH}
              placeholder="Search by service level name or attribute"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </div>

          <div className="signals-list">
            <CheckboxGroup>
              {serviceLevels.map(({ guid, name }) =>
                isMatchPattern(searchText, name) ? (
                  <Checkbox
                    key={guid}
                    label={name}
                    checked={selectedSignals.includes(guid)}
                    onChange={() => {
                      if (selectedSignals.includes(guid)) {
                        setSelectedSignals(
                          selectedSignals.filter((id) => id !== guid)
                        );
                      } else {
                        setSelectedSignals([...selectedSignals, guid]);
                      }
                    }}
                  />
                ) : null
              )}
            </CheckboxGroup>
          </div>

          <div className="footer-buttons">
            <Button
              type={Button.TYPE.SECONDARY}
              onClick={() =>
                window.open(
                  'https://one.newrelic.com/service-levels-management/sli-edit',
                  '_blank',
                  'noreferrer'
                )
              }
            >
              Create signal
            </Button>
            <Button
              type={Button.TYPE.PLAIN}
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
              onClick={() =>
                refetchServiceLevels ? refetchServiceLevels() : null
              }
            />
          </div>
        </div>

        <div className="signals-selections">
          <div className="header-bar">
            <HeadingText type={HeadingText.TYPE.HEADING_4}>
              Selected signals
            </HeadingText>
            <BlockText className="muted">
              {selectedSignals.length} signals selected
            </BlockText>
          </div>
          <div className="selections-list">
            {selectedSignals.map((guid) => (
              <div className="selection" key={guid}>
                <span className="name">{serviceLevelsLookup[guid]}</span>
                <span
                  className="remove"
                  onClick={() =>
                    setSelectedSignals(
                      selectedSignals.filter((id) => id !== guid)
                    )
                  }
                >
                  <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__CLOSE__SIZE_8} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-buttons">
          <Button
            type={Button.TYPE.PRIMARY}
            disabled={!selectedSignals.length}
            onClick={() => (onChange ? onChange(selectedSignals) : null)}
          >
            Add signal(s)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

EditStepModal.propTypes = {
  stageName: PropTypes.string,
  stepGroup: PropTypes.number,
  stepName: PropTypes.string,
  existingSignals: PropTypes.arrayOf(PropTypes.string),
  hidden: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
};

export default EditStepModal;
