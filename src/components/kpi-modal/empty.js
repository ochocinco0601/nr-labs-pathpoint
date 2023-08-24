import React from 'react';
import PropTypes from 'prop-types';

import { EmptyState } from 'nr1';
import { UI_CONTENT } from '../../constants';

const KpiModalEmptyState = ({ accountId, nrqlQuery, error }) => {
  const accountValid = Number.isInteger(accountId);

  const desc = !accountValid
    ? UI_CONTENT.KPI_MODAL.EMPTY_STATUS_MESSAGE_DESC_1
    : !nrqlQuery
    ? UI_CONTENT.KPI_MODAL.EMPTY_STATUS_MESSAGE_DESC_2
    : error && error.graphQLErrors[0].message;

  return (
    <EmptyState
      fullWidth
      iconType={EmptyState.ICON_TYPE.INTERFACE__PLACEHOLDERS__ICON_PLACEHOLDER}
      title={
        !accountValid || !nrqlQuery
          ? UI_CONTENT.KPI_MODAL.EMPTY_STATE_MESSAGE_TITLE_1
          : UI_CONTENT.KPI_MODAL.EMPTY_STATE_MESSAGE_TITLE_2
      }
      description={desc}
      // type={
      //   !accountValid || !nrqlQuery
      //     ? EmptyState.TYPE.NORMAL
      //     : EmptyState.TYPE.ERROR
      // }
      additionalInfoLink={{
        label: UI_CONTENT.KPI_MODAL.EMPTY_STATE_ADDITIONAL_LINK_LABEL,
        to: UI_CONTENT.KPI_MODAL.EMPTY_STATE_ADDITIONAL_LINK_URL,
      }}
    />
  );
};

KpiModalEmptyState.propTypes = {
  accountId: PropTypes.number || PropTypes.string,
  nrqlQuery: PropTypes.string,
  error: PropTypes.object,
};

export default KpiModalEmptyState;
