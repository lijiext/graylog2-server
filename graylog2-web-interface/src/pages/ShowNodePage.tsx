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
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { NodeMaintenanceDropdown, NodeOverview } from 'components/nodes';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { ClusterOverviewStore } from 'stores/cluster/ClusterOverviewStore';
import { InputStatesStore } from 'stores/inputs/InputStatesStore';
import { InputTypesStore } from 'stores/inputs/InputTypesStore';
import { NodesStore } from 'stores/nodes/NodesStore';
import useParams from 'routing/useParams';
import { useStore } from 'stores/connect';
import usePluginList from 'hooks/usePluginList';
import useProductName from 'brand-customization/useProductName';

const ShowNodePage = () => {
  const productName = useProductName();
  const { nodeId } = useParams<{ nodeId: string }>();
  const { inputDescriptions } = useStore(InputTypesStore);
  const { nodes } = useStore(NodesStore);
  const { clusterOverview } = useStore(ClusterOverviewStore);
  const { pluginList, isLoading: isLoadingPlugins } = usePluginList(nodeId);
  const { data: jvmInformation } = useQuery({
    queryKey: ['jvm', nodeId],
    queryFn: () => ClusterOverviewStore.jvm(nodeId),
  });
  const { data: inputStates } = useQuery({
    queryKey: ['inputs', 'states', nodeId],

    queryFn: () =>
      InputStatesStore.list().then((newInputStates) => {
        // We only want the input states for the current node
        const inputIds = Object.keys(newInputStates);
        const filteredInputStates = [];

        inputIds.forEach((inputId) => {
          const inputObject = newInputStates[inputId][nodeId];

          if (inputObject) {
            filteredInputStates.push(inputObject);
          }
        });

        return filteredInputStates;
      }),
  });

  const systemOverview = clusterOverview?.[nodeId];
  const node = nodes?.[nodeId];
  const _isLoading = !node || !systemOverview || isLoadingPlugins;

  if (_isLoading) {
    return <Spinner />;
  }

  const title = (
    <span>
      节点 {node.short_node_id} / {node.hostname}
    </span>
  );

  return (
    <DocumentTitle title={`节点 ${node.short_node_id} / ${node.hostname}`}>
      <div>
        <PageHeader title={title} actions={<NodeMaintenanceDropdown node={node} />}>
          <span>
            此页面显示 {productName} 集群中处于活动状态并可访问的服务器节点。
            <br />
            {node.is_leader ? (
              <span>这是主节点。</span>
            ) : (
              <span>
                这是 <em>not</em> 主节点。
              </span>
            )}
          </span>
        </PageHeader>
        <NodeOverview
          node={node}
          systemOverview={systemOverview}
          jvmInformation={jvmInformation}
          plugins={pluginList.plugins}
          inputStates={inputStates}
          inputDescriptions={inputDescriptions}
        />
      </div>
    </DocumentTitle>
  );
};

export default ShowNodePage;
