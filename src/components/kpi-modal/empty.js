import React from 'react';
import PropTypes from 'prop-types';

import { EmptyState } from 'nr1';

const KpiModalEmptyState = ({ accountId, nrqlQuery, error }) => {
  const accountValid = Number.isInteger(accountId);

  const desc = !accountValid
    ? 'At least one account must be selected'
    : !nrqlQuery
    ? 'Enter and run a query to preview the result'
    : error && error.graphQLErrors[0].message;

  return (
    <EmptyState
      fullWidth
      iconType={EmptyState.ICON_TYPE.INTERFACE__PLACEHOLDERS__ICON_PLACEHOLDER}
      title={
        !accountValid || !nrqlQuery ? 'No preview available yet' : 'Error!'
      }
      description={desc}
      type={
        !accountValid || !nrqlQuery
          ? EmptyState.TYPE.NORMAL
          : EmptyState.TYPE.ERROR
      }
      additionalInfoLink={{
        label: 'See our NRQL reference',
        to: 'https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/nrql-syntax-clauses-functions/',
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
