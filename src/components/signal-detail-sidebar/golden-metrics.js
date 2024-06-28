import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardBody,
  CardHeader,
  HeadingText,
  LineChart,
  NrqlQuery,
} from 'nr1';

const cardSubtitle = ({ since = '', until } = {}) =>
  until
    ? `${since.replace(/since /i, '')} - ${until.replace(/until /i, '')}`
    : since || '';

const GoldenMetrics = ({ data, timeWindow }) => {
  const [entityAcctId, setEntityAcctId] = useState();
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    if (!data) return;
    setEntityAcctId(data.accountId);
    setMetrics(data.goldenMetrics?.metrics || []);
  }, [data]);

  return (
    <div className="golden-metrics-wrapper">
      {metrics.length ? (
        <HeadingText
          className="golden-metrics-header"
          type={HeadingText.TYPE.HEADING_4}
        >
          Golden metrics
        </HeadingText>
      ) : null}
      <div className="golden-metrics">
        {metrics.map(({ query, title }, idx) =>
          entityAcctId && query ? (
            <NrqlQuery
              key={title}
              accountIds={[entityAcctId]}
              query={query}
              timeRange={
                timeWindow?.start && timeWindow?.end
                  ? { begin_time: timeWindow.start, end_time: timeWindow.end }
                  : null
              }
              // offset={(new Date()).getTimezoneOffset() * 60000}
            >
              {({ data: queryData }) => (
                <Card
                  key={`${title.replace(/\s+/g, '')}`}
                  className="golden-metric-card"
                >
                  <CardHeader
                    className="golden-metric-card-header"
                    title={title || `Golden metric ${idx}`}
                    subtitle={cardSubtitle(queryData?.metadata)}
                  />
                  <CardBody className="golden-metric-card-body">
                    <LineChart data={queryData} />
                  </CardBody>
                </Card>
              )}
            </NrqlQuery>
          ) : null
        )}
      </div>
    </div>
  );
};

GoldenMetrics.propTypes = {
  data: PropTypes.object,
  timeWindow: PropTypes.object,
};

export default GoldenMetrics;
