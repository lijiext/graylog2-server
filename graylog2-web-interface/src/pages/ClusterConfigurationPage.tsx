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

import { DocumentTitle, PageHeader } from 'components/common';
import { Col, Row } from 'components/bootstrap';
import useClusterNodes from 'components/cluster-configuration/useClusterNodes';
import ClusterConfigurationListView from 'components/cluster-configuration/ClusterConfigurationListView';
import TableFetchContextProvider from 'components/common/PaginatedEntityTable/TableFetchContextProvider';
import type { SearchParams } from 'stores/PaginationTypes';
import ClusterConfigurationPageNavigation from 'components/cluster-configuration/ClusterConfigurationPageNavigation';
import HideOnCloud from 'util/conditional/HideOnCloud';
import IndexerClusterHealth from 'components/indexers/IndexerClusterHealth';

const ClusterConfigurationPage = () => {
  const clusterNodes = useClusterNodes();
  const searchParams: SearchParams = {
    query: '',
    page: 1,
    pageSize: 0,
    sort: { attributeId: 'hostname', direction: 'asc' },
  };

  return (
    <DocumentTitle title="集群配置">
      <ClusterConfigurationPageNavigation />
      <div>
        <PageHeader title="集群配置">
          <span>
            此页面提供集群中节点的实时概览。您可以随时暂停消息处理。在恢复处理之前，处理缓冲区将不接受任何新消息。如果为节点启用了消息日志（默认情况下已启用），即使处理已禁用，传入的消息也会持久化到磁盘。
          </span>
        </PageHeader>
        <HideOnCloud>
          <IndexerClusterHealth minimal />
        </HideOnCloud>
        <Row className="content">
          <Col xs={6}>
            <h2>节点</h2>
          </Col>
          <Col md={12}>
            <TableFetchContextProvider
              refetch={clusterNodes.refetchDatanodes}
              searchParams={searchParams}
              attributes={[]}
              entityTableId="cluster-configuration">
              <ClusterConfigurationListView clusterNodes={clusterNodes} />
            </TableFetchContextProvider>
          </Col>
        </Row>
      </div>
    </DocumentTitle>
  );
};

export default ClusterConfigurationPage;
