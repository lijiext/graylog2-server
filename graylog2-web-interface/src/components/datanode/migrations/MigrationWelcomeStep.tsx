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
import styled, { css } from 'styled-components';

import { Col, Row, Panel, Alert } from 'components/bootstrap';
import { Icon } from 'components/common';
import { DocumentationLink } from 'components/support';
import MigrationDatanodeList from 'components/datanode/migrations/MigrationDatanodeList';
import MigrationStepTriggerButtonToolbar from 'components/datanode/migrations/common/MigrationStepTriggerButtonToolbar';
import type { MigrationStepComponentProps } from 'components/datanode/Types';
import MigrationError from 'components/datanode/migrations/common/MigrationError';
import AppConfig from 'util/AppConfig';

import useIsElasticsearch from '../hooks/useIsElasticsearch';

const Headline = styled.h2`
  margin-top: 5px;
  margin-bottom: 10px;
`;

export const StyledPanel = styled(Panel)<{ bsStyle: string }>(({ bsStyle = 'default', theme }) => css`
  &.panel {
    background-color: ${theme.colors.global.contentBackground};

    .panel-heading {
      color: ${theme.colors.variant.darker[bsStyle]};
    }
  }
`);

const StyledHelpPanel = styled(StyledPanel)`
  margin-top: 30px;
`;

const MigrationWelcomeStep = ({ currentStep, onTriggerStep, hideActions }: MigrationStepComponentProps) => {
  const isElasticsearch = useIsElasticsearch();
  const isRemoteReindexingEnabled = AppConfig.isFeatureEnabled('remote_reindex_migration');
  
  return (
    <Row>
      <Col md={isRemoteReindexingEnabled ? 6 : 12}>
        {isElasticsearch && !isRemoteReindexingEnabled && (
          <Alert bsStyle="warning">
            不兼容的搜索后端。请升级至 OpenSearch 以使用迁移向导。
          </Alert>
        )}
        <MigrationError errorMessage={currentStep.error_message} />
        <Headline>数据节点迁移</Headline>
        <p>
          Graylog 数据节点是一个管理组件，旨在配置和优化 OpenSearch 以供 Graylog 使用，从而减少管理开销并简化未来的更新。
        </p>
        <p>v5.2 之前的部署，或选择不随数据节点安装的部署，需要将消息数据库迁移到数据节点。</p>
        <p>
          此迁移工具将检查您组件的兼容性，并指导您将现有的 OpenSearch 数据迁移到数据节点。<br />
        </p>
        <p>迁移到数据节点需要在操作系统、当前操作系统/ES 集群以及配置文件中执行某些步骤。</p>
        <p>您可以获取有关数据节点迁移的更多信息 <DocumentationLink page="graylog-data-node" text="documentation" />.</p>
        <br />
        <MigrationDatanodeList />
        {!(isElasticsearch && !isRemoteReindexingEnabled) && (
          <MigrationStepTriggerButtonToolbar hidden={hideActions} nextSteps={currentStep.next_steps} onTriggerStep={onTriggerStep} />
        )}
      </Col>
      {isRemoteReindexingEnabled && (
        <Col md={6}>
          <StyledHelpPanel bsStyle="info">
            <Panel.Heading>
              <Panel.Title componentClass="h3"><Icon name="info" /> 迁移方法</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <p>
                在迁移过程中，您可以选择两种方案将现有的 Elasticsearch 或 OpenSearch 数据迁移到数据节点。您应该根据个人的前提条件和要求在两者之间做出选择。
              </p>
              <p>
                如果您正在运行 <code>OpenSearch (1.x 或 2.x)</code> 作为您的搜索后端，您可以选择 <code>就地迁移</code>。在此迁移场景中，数据节点的 OpenSearch 将使用现有的 OpenSearch 数据目录，来提供以前现有 OpenSearch 中可用的所有数据。如果您想快速迁移到数据节点，这是推荐的方法。
              </p>
              <p>
                如果您希望选择性迁移数据（例如，如果您非独占地使用搜索后端供 Graylog 使用），您应选择 <code>远程重新索引迁移</code>。在此场景中，所有数据都将从现有的搜索后端复制到数据节点的 OpenSearch。根据您的设置，这可能需要一些时间，并且会为复制的数据占用额外的磁盘空间。在远程重新索引期间，Graylog 正在向数据节点摄取数据并可以使用，但只有当旧搜索后端的数据变为可用时，才会提供这些数据。
              </p>
              <p>
                如果您正在运行 <code>ElasticSearch</code> 作为您的搜索后端 <code>远程重新索引迁移</code> 将自动选择。
              </p>
              <p>
                如果您不打算迁移任何现有数据，或仅希望迁移一小部分数据，我们建议您选择远程重新索引迁移，并跳过数据迁移，或仅选择要迁移的选定索引。
              </p>
            </Panel.Body>
          </StyledHelpPanel>
        </Col>
      )}
    </Row>
  );
}

export default MigrationWelcomeStep;
