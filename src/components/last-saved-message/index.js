import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const LastSavedMessage = ({ lastSavedTimestamp }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    updateMessageText();
    const interval = setInterval(updateMessageText, 60000);
    return () => clearInterval(interval);
  }, [updateMessageText]);

  const updateMessageText = useCallback(() => {
    if (lastSavedTimestamp) {
      const curTime = Date.now();
      const diff = curTime - lastSavedTimestamp;

      if (diff < 61000) {
        // ~ 1 minute
        setMessage('Saved just now');
      } else if (diff < 122000) {
        // ~ 2 minutes
        setMessage('Saved a minute ago');
      } else if (diff < 3600000) {
        // 1 hour
        setMessage('Saved few minutes ago');
      } else {
        setMessage('');
      }
    } else {
      setMessage('');
    }
  }, [lastSavedTimestamp]);

  return <span className="last-saved-message">{message}</span>;
};

LastSavedMessage.propTypes = {
  lastSavedTimestamp: PropTypes.number,
};

export default LastSavedMessage;
