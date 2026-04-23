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
import useProductName from 'brand-customization/useProductName';

import useIsElasticsearch from '../hooks/useIsElasticsearch';

const Headline = styled.h2`
  margin-top: 5px;
  margin-bottom: 10px;
`;

export const StyledPanel = styled(Panel)<{ bsStyle: string }>(
  ({ bsStyle = 'default', theme }) => css`
    &.panel {
      background-color: ${theme.colors.global.contentBackground};

      .panel-heading {
        color: ${theme.colors.variant.darker[bsStyle]};
      }
    }
  `,
);

const StyledHelpPanel = styled(StyledPanel)`
  margin-top: 30px;
`;

const MigrationWelcomeStep = ({ currentStep, onTriggerStep, hideActions }: MigrationStepComponentProps) => {
  const isElasticsearch = useIsElasticsearch();
  const isRemoteReindexingEnabled = AppConfig.isFeatureEnabled('remote_reindex_migration');
  const productName = useProductName();

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
          该 {productName} 数据节点是一个管理组件，旨在配置和优化 OpenSearch 以用于 {productName}，减少管理开销并简化未来更新。
        </p>
        <p>
          v5.2 之前的部署或选择不与数据节点一起安装的部署需要将消息数据库迁移到数据节点。
        </p>
        <p>
          此迁移工具将检查您的组件兼容性，并指导您将现有的 OpenSearch 数据迁移到数据节点。
          <br />
        </p>
        <p>
          迁移到数据节点需要在操作系统、当前操作系统/ES 集群以及配置文件中执行一些步骤。
        </p>
        <p>
          您可以获取有关数据节点迁移的更多信息{' '}
          <DocumentationLink page="graylog-data-node" text="documentation" />.
        </p>
        <br />
        <MigrationDatanodeList />
        {!(isElasticsearch && !isRemoteReindexingEnabled) && (
          <MigrationStepTriggerButtonToolbar
            hidden={hideActions}
            nextSteps={currentStep.next_steps}
            onTriggerStep={onTriggerStep}
          />
        )}
      </Col>
      {isRemoteReindexingEnabled && (
        <Col md={6}>
          <StyledHelpPanel bsStyle="info">
            <Panel.Heading>
              <Panel.Title componentClass="h3">
                <Icon name="info" /> 迁移方法
              </Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <p>
                在迁移过程中，您可以选择两种选项之一，将现有的 ElasticSearch 或 OpenSearch 数据迁移到数据节点。您应根据个人前提条件和需求进行选择。
              </p>
              <p>
                如果您已经在运行 <code>OpenSearch (1.x 或 2.x)</code> 作为您的搜索后端，您可以选择{' '}
                <code>原地迁移</code>. In this migration scenario, the data node’s OpenSearch will use the
                existing data directory of OpenSearch to serve all data previously available in your existing
                OpenSearch. This is the recommended method if you want to quickly migrate to data node.
              </p>
              <p>
                如果您想选择性迁移数据（例如，如果您非独占地使用搜索后端进行{' '}
                {productName}), 您应选择 <code>远程重新索引迁移</code>. In this scenario, all
                data will be copied from your existing search backend to data node’s OpenSearch. Depending on your
                setup, this can take some time and imposes additional disk space for the copied data to be available.
                During the remote reindexing, {productName} 正在向数据节点摄入数据，可以正常使用，但只会从旧搜索后端提供可用的数据。
              </p>
              <p>
                如果您正在运行 <code>ElasticSearch</code> 作为您的搜索后端{' '}
                <code>远程重新索引迁移</code> 将自动选择。
              </p>
              <p>
                If you don’t plan to migrate any existing data or only want to migrate a small subset of data we
                recommend you choose the remote reindexing migration and either skip the data migration or choose only
                the selected indices for migration.
              </p>
            </Panel.Body>
          </StyledHelpPanel>
        </Col>
      )}
    </Row>
  );
};

export default MigrationWelcomeStep;
