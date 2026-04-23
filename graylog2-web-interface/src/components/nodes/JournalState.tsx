/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import React, { useEffect } from 'react';
import numeral from 'numeral';

import { Pluralize, Spinner } from 'components/common';
import MetricsExtractor from 'logic/metrics/MetricsExtractor';
import { MetricsActions, MetricsStore } from 'stores/metrics/MetricsStore';
import { useStore } from 'stores/connect';

type Props = {
  nodeId: string;
};
const metricNames = {
  append: 'org.graylog2.journal.append.1-sec-rate',
  read: 'org.graylog2.journal.read.1-sec-rate',
  segments: 'org.graylog2.journal.segments',
  entriesUncommitted: 'org.graylog2.journal.entries-uncommitted',
};

const JournalState = ({ nodeId }: Props) => {
  const { metrics } = useStore(MetricsStore);

  useEffect(() => {
    Object.keys(metricNames).forEach((metricShortName) => MetricsActions.add(nodeId, metricNames[metricShortName]));

    return () => {
      Object.keys(metricNames).forEach((metricShortName) =>
        MetricsActions.remove(nodeId, metricNames[metricShortName]),
      );
    };
  }, [nodeId]);

  const nodeMetrics = metrics?.[nodeId];
  const _isLoading = !nodeMetrics;

  if (_isLoading) {
    return <Spinner text="Loading journal metrics..." />;
  }

  const _metrics = MetricsExtractor.getValuesForNode(nodeMetrics, metricNames);

  if (Object.keys(_metrics).length === 0) {
    return <span>Journal 指标不可用。</span>;
  }

  return (
    <span>
      日志包含 <strong>{numeral(_metrics.entriesUncommitted).format('0,0')} 未处理的日志消息</strong> in{' '}
      {_metrics.segments} <Pluralize value={_metrics.segments} singular="segment" plural="segments" />.{' '}
      <strong>{numeral(_metrics.append).format('0,0')} messages</strong> 已附加，{' '}
      <strong>{numeral(_metrics.read).format('0,0')} messages</strong> 最近一秒内读取。
    </span>
  );
};

export default JournalState;
