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

import { Col, Row } from 'components/bootstrap';
import useProductName from 'brand-customization/useProductName';
import ProductLink from 'components/enterprise/ProductLink';
import { useStore } from 'stores/connect';
import { NodesStore } from 'stores/nodes/NodesStore';

const GraylogEnterpriseHeader = styled.h2`
  margin-bottom: 10px;
`;

const AdvertisementSection = () => {
  const nodes = useStore(NodesStore);
  const productName = useProductName();
  const licensePlugin = PluginStore.exports('license');
  const ProductLinkComponent = licensePlugin[0]?.EnterpriseProductLink || ProductLink;
  const { clusterId } = nodes;

  return (
    <Row className="content">
      <Col md={6}>
        <GraylogEnterpriseHeader>{productName} 企业版</GraylogEnterpriseHeader>
        <p>
          旨在满足资源受限的 IT 运维和软件工程团队的需求， {productName}{' '}
          Enterprise 提供了众多生产力增强功能，每年可为您节省数千小时用于收集和分析日志数据，从而发现性能、中断和错误问题的根本原因。
        </p>
        <ProductLinkComponent href="https://go2.graylog.org/request-graylog-operations" clusterId={clusterId}>
          立即请求
        </ProductLinkComponent>
      </Col>
      <Col md={6}>
        <GraylogEnterpriseHeader>{productName} 安全</GraylogEnterpriseHeader>
        <p>
          扩展 {productName} Open’s capabilities for detecting, investigating, and responding to cybersecurity threats
          with security-specific dashboards and alerts, anomaly detection AI/ML engine, integrations with other security
          tools, SOAR capabilities, and numerous compliance reporting features.
        </p>
        <ProductLinkComponent
          href="https://go2.graylog.org/request-graylog-security"
          licenseSubject="/license/security"
          clusterId={clusterId}>
          立即请求
        </ProductLinkComponent>
      </Col>
    </Row>
  );
};

export default AdvertisementSection;
