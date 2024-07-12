import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'nr1';

import { UI_CONTENT } from '../../src/constants';

const Footer = ({ entitiesCount, alertsCount, saveHandler, cancelHandler }) => (
  <footer>
    <div className="message-bar">
      {entitiesCount > 25 || alertsCount > 50
        ? UI_CONTENT.SIGNAL_SELECTION.TOO_MANY_ENTITIES_ERROR_MESSAGE
        : ''}
    </div>
    <div className="buttons-bar">
      <Button type={Button.TYPE.TERTIARY} onClick={cancelHandler}>
        Cancel
      </Button>
      <Button
        type={Button.TYPE.PRIMARY}
        disabled={
          !(entitiesCount || alertsCount) ||
          entitiesCount > 25 ||
          alertsCount > 50
        }
        onClick={saveHandler}
      >
        Save changes
      </Button>
    </div>
  </footer>
);

Footer.propTypes = {
  entitiesCount: PropTypes.number,
  alertsCount: PropTypes.number,
  saveHandler: PropTypes.func,
  cancelHandler: PropTypes.func,
};

export default Footer;
