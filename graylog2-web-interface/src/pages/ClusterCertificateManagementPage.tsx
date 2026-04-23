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

import { Row, Col } from 'components/bootstrap';
import { DocumentTitle, PageHeader } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import DataNodeConfiguration from 'components/datanode/DataNodeConfiguration/DataNodeConfiguration';
import ClusterConfigurationPageNavigation from 'components/cluster-configuration/ClusterConfigurationPageNavigation';

const ClusterCertificateManagementPage = () => (
  <DocumentTitle title="证书管理">
    <ClusterConfigurationPageNavigation />
    <PageHeader
      title="证书管理"
      documentationLink={{
        title: 'Data Nodes documentation',
        path: DocsHelper.PAGES.GRAYLOG_DATA_NODE,
      }}>
      <span>
        Graylog 数据节点与 Graylog 的集成更紧密，并简化了未来的更新。它们允许您对 Graylog 消息数据库中的所有消息进行索引和搜索。
      </span>
    </PageHeader>
    <Row className="content">
      <Col md={12}>
        <DataNodeConfiguration />
      </Col>
    </Row>
  </DocumentTitle>
);

export default ClusterCertificateManagementPage;
