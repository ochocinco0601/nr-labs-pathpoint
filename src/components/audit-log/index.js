import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { AccountStorageQuery, HeadingText } from 'nr1';

import { NERD_STORAGE } from '../../constants';

const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat('default', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatTimestamp = (timestamp) =>
  TIMESTAMP_FORMATTER.format(new Date(timestamp)).replace(/[APM]{2}/, (match) =>
    match.toLowerCase()
  );

const AuditLog = ({ flowId, accountId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!flowId || !accountId) return;

    const fetchLogs = async () => {
      const { data, error } = await AccountStorageQuery.query({
        accountId,
        collection: NERD_STORAGE.EDITS_LOG_COLLECTION,
        documentId: flowId,
      });

      if (error) return console.error('Error fetching audit logs', error);
      setLogs(data?.logs);
    };

    fetchLogs();
  }, [flowId, accountId]);

  return (
    <div className="audit-log">
      <div className="audit-logs-header">
        <HeadingText type={HeadingText.TYPE.HEADING_2}>Audit Log</HeadingText>
      </div>
      <div className="items">
        {logs.reverse().map(({ id, user, timestamp }) => (
          <div key={id} className="item">
            <div className="line">
              <span className="title">{user?.name}</span>
              <span>({user?.email})</span>
            </div>
            <div className="line light">{formatTimestamp(timestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

AuditLog.propTypes = {
  flowId: PropTypes.string,
  accountId: PropTypes.number,
};

export default AuditLog;
