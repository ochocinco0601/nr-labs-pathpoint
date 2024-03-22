import React, { useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardBody,
  CardHeader,
  LineChart,
  NerdGraphQuery,
  PlatformStateContext,
} from 'nr1';

import { timeRangeToNrql } from '@newrelic/nr-labs-components';

import { goldenMetricsForEntityQuery } from '../../queries';
import { formatForDisplay } from '../../utils';

const GoldenMetrics = ({ guid }) => {
  const platformState = useContext(PlatformStateContext);
  const [entityAcctId, setEntityAcctId] = useState();
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    if (!guid) return;

    const fetchGoldenMetricQueries = async () => {
      const query = goldenMetricsForEntityQuery(guid);
      const { data: { actor: { entity } = {} } = {} } =
        await NerdGraphQuery.query({
          query,
        });

      if (entity) {
        setEntityAcctId(entity.accountId);
        setMetrics(entity.goldenMetrics?.metrics || []);
      }
    };

    fetchGoldenMetricQueries();
  }, [guid]);

  const timeStatement = useMemo(
    () => timeRangeToNrql(platformState),
    [platformState]
  );

  const formattedTimeRange = useMemo(
    () => formatForDisplay(platformState.timeRange),
    [platformState]
  );

  return (
    <>
      {metrics.map(({ query, title }) =>
        entityAcctId && query ? (
          <Card
            key={`${title.replace(/\s+/g, '')}`}
            className="golden-metric-card"
          >
            <CardHeader
              className="golden-metric-card-header"
              title={title || ''}
              subtitle={formattedTimeRange}
            />
            <CardBody className="golden-metric-card-body">
              <LineChart
                accountIds={[entityAcctId]}
                query={`${query} ${timeStatement}`}
              />
            </CardBody>
          </Card>
        ) : null
      )}
    </>
  );
};

GoldenMetrics.propTypes = {
  guid: PropTypes.string,
};

export default GoldenMetrics;
