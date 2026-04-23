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
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { ClusterNodeMetrics } from '@graylog/server-api';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { MetricsComponent } from 'components/metrics';
import type { Metric } from 'stores/metrics/MetricsStore';
import { MetricsStore } from 'stores/metrics/MetricsStore';
import type { NodesStoreState } from 'stores/nodes/NodesStore';
import { NodesStore } from 'stores/nodes/NodesStore';
import { useStore } from 'stores/connect';
import useQueryParameters from 'routing/useQuery';
import useParams from 'routing/useParams';

const metricsNamespace = MetricsStore.namespace;

const useNodeId = (nodes: NodesStoreState['nodes']) => {
  const { nodeId } = useParams();

  // "leader" node ID is a placeholder for leader node, get first leader node ID
  if (nodeId === 'leader' || nodeId === 'master') { // `master` is deprecated but we still support it here
    if (nodes === undefined) {
      return undefined;
    }

    const nodeIDs = Object.keys(nodes);
    const leaderNodes = nodeIDs.filter((nodeID) => nodes[nodeID].is_leader);

    return leaderNodes[0] ?? nodeIDs[0];
  }

  return nodeId;
};

const ShowMetricsPage = () => {
  const nodes = useStore(NodesStore, (state) => state.nodes);
  const nodeId = useNodeId(nodes);
  const { data: names, isLoading } = useQuery(
    ['metrics', 'names', nodeId],
    () => ClusterNodeMetrics.byNamespace(nodeId, metricsNamespace).then(({ metrics }) => metrics as Metric[]),
    { enabled: nodeId !== undefined });

  const { filter } = useQueryParameters() as { filter: string };

  if (!nodes || isLoading) {
    return <Spinner />;
  }

  const node = nodes[nodeId];
  const title = <span>节点指标 {node.short_node_id} / {node.hostname}</span>;

  return (
    <DocumentTitle title={`节点 ${node.short_node_id} / ${node.hostname} 的指标`}>
      <span>
        <PageHeader title={title}>
          <span>
            所有 Graylog 节点都提供一组用于诊断、调试和监控的内部指标。请注意，您也可以通过 JMX 访问所有指标。<br />
            此节点报告的总数为 {(names || []).length} 指标。
          </span>
        </PageHeader>

        <MetricsComponent names={names} namespace={metricsNamespace} nodeId={nodeId} filter={filter} />
      </span>
    </DocumentTitle>
  );
};

export default ShowMetricsPage;
