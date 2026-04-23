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
import styled from 'styled-components';
import { PluginStore } from 'graylog-web-plugin/plugin';

import { useStore } from 'stores/connect';
import { NodesStore } from 'stores/nodes/NodesStore';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { Col, Row } from 'components/bootstrap';
import { GraylogClusterOverview } from 'components/cluster';
import PluginList from 'components/enterprise/PluginList';
import EnterpriseProductLink from 'components/enterprise/EnterpriseProductLink';
import ProductLink from 'components/enterprise/ProductLink';
import HideOnCloud from 'util/conditional/HideOnCloud';

const GraylogEnterpriseHeader = styled.h2`
  margin-bottom: 10px;
`;

const EnterprisePage = () => {
  const nodes = useStore(NodesStore);
  const licensePlugin = PluginStore.exports('license');
  const ProductLinkComponent = licensePlugin[0]?.EnterpriseProductLink || ProductLink;

  if (!nodes) {
    return <Spinner />;
  }

  const { clusterId } = nodes;

  return (
    <DocumentTitle title="试用 Graylog Enterprise">
      <div>
        <PageHeader title="试用 Graylog Enterprise">
          <span>
            Graylog 企业版为开源 Graylog 核心添加了商业功能。您可以在以下位置了解更多关于 Graylog 企业版的信息 <EnterpriseProductLink>产品页面</EnterpriseProductLink>.
          </span>
        </PageHeader>

        <GraylogClusterOverview layout="compact">
          <PluginList />
        </GraylogClusterOverview>
        <HideOnCloud>
          <Row className="content">
            <Col md={6}>
              <GraylogEnterpriseHeader>Graylog 企业版</GraylogEnterpriseHeader>
              <p>
                Graylog Enterprise 旨在满足资源受限的 IT 运维和软件工程团队的需求，提供了许多生产力增强功能，每年可为您在收集和分析日志数据以发现性能、停机和错误问题的根本原因方面节省数千小时。
              </p>
              <ProductLinkComponent href="https://go2.graylog.org/request-graylog-operations" clusterId={clusterId}>
                立即请求
              </ProductLinkComponent>
            </Col>
            <Col md={6}>
              <GraylogEnterpriseHeader>Graylog 安全</GraylogEnterpriseHeader>
              <p>
                通过安全专用仪表盘和告警、异常检测 AI/ML 引擎、与其他安全工具的集成、SOAR 能力以及众多合规报告功能，扩展 Graylog Open 在检测、调查和响应网络安全威胁方面的能力。
              </p>
              <ProductLinkComponent href="https://go2.graylog.org/request-graylog-security" licenseSubject="/license/security" clusterId={clusterId}>
                立即请求
              </ProductLinkComponent>
            </Col>
          </Row>
        </HideOnCloud>
      </div>
    </DocumentTitle>
  );
};

export default EnterprisePage;
