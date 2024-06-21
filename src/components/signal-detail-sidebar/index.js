import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardBody,
  HeadingText,
  Link,
  SectionMessage,
  navigation,
} from 'nr1';

import { SIGNAL_TYPES } from '../../constants';

import Incidents from './incidents';
import GoldenMetrics from './golden-metrics';
import { AppContext } from '../../contexts';

import typesList from '../../../nerdlets/signal-selection/types.json';

const NO_ENTITY_TYPE = '(unknown entity type)';

const entityTypeFromGuid = (guid) => {
  if (!guid) return NO_ENTITY_TYPE;
  const [, domain, type] = atob(guid)?.split('|') || [];
  if (!domain || !type) return NO_ENTITY_TYPE;
  return (
    typesList.find((t) => t.domain === domain && t.type === type)
      ?.displayName || NO_ENTITY_TYPE
  );
};

const SignalDetailSidebar = ({ guid, name, type, data, timeWindow }) => {
  const { account = {}, accounts = [] } = useContext(AppContext);
  const [hasAccessToEntity, setHasAccessToEntity] = useState(false);
  const [signalAccount, setSignalAccount] = useState();
  const [detailLinkText, setDetailLinkText] = useState('View entity details');

  useEffect(() => {
    const [acctId, condId] = ((atob(guid) || '').split('|') || []).reduce(
      (acc, cur, idx) => (idx === 0 || idx === 3 ? [...acc, Number(cur)] : acc),
      []
    );
    if (acctId === account.id) {
      setHasAccessToEntity(true);
      setSignalAccount(account);
    } else {
      const acct = accounts.find((a) => a.id === acctId);
      if (acct) {
        setHasAccessToEntity(true);
        setSignalAccount(acct);
      }
    }
    if (type === SIGNAL_TYPES.ALERT) {
      setDetailLinkText(condId ? 'View alert condition' : '');
    } else if (type === SIGNAL_TYPES.ENTITY) {
      setDetailLinkText('View entity details');
    }
  }, [guid, type, account, accounts]);

  return (
    <div className="signal-detail-sidebar">
      <div className="signal-header">
        <Card>
          <CardBody className="signal-header-card-body">
            <HeadingText type={HeadingText.TYPE.HEADING_6}>
              SIGNAL DETAILS
            </HeadingText>
            <HeadingText type={HeadingText.TYPE.HEADING_3}>{name}</HeadingText>
            <HeadingText type={HeadingText.TYPE.HEADING_5}>
              {`${signalAccount?.name || '(unknown account)'} | ${
                type === SIGNAL_TYPES.ENTITY
                  ? entityTypeFromGuid(guid)
                  : 'Alert condition'
              }`}
            </HeadingText>
            {hasAccessToEntity ? (
              <Link
                className="detail-link"
                to={navigation.getOpenEntityLocation(guid)}
                onClick={(e) => e.target.setAttribute('target', '_blank')}
              >
                {detailLinkText}
              </Link>
            ) : null}
          </CardBody>
        </Card>
      </div>
      {hasAccessToEntity ? (
        <>
          <Incidents type={type} data={data} timeWindow={timeWindow} />
          {type === SIGNAL_TYPES.ENTITY ? (
            <GoldenMetrics guid={guid} data={data} />
          ) : null}
        </>
      ) : (
        <SectionMessage
          type={SectionMessage.TYPE.CRITICAL}
          description="You do not have access to view this signal!"
        />
      )}
    </div>
  );
};

SignalDetailSidebar.propTypes = {
  guid: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.oneOf(Object.values(SIGNAL_TYPES)),
  data: PropTypes.object,
  timeWindow: PropTypes.object,
};

export default SignalDetailSidebar;
