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
import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';

import { Row, Col, Button, Table, Label, SegmentedControl, Alert, Modal } from 'components/bootstrap';
import { DocumentTitle, PageHeader, Spinner, Icon } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import useDataNodeUpgradeStatus, {
  getNodeToUpgrade,
  saveNodeToUpgrade,
  startShardReplication,
  stopShardReplication,
} from 'components/datanode/hooks/useDataNodeUpgradeStatus';
import type { DataNodeInformation } from 'components/datanode/hooks/useDataNodeUpgradeStatus';
import ClusterConfigurationPageNavigation from 'components/cluster-configuration/ClusterConfigurationPageNavigation';
import DocumentationLink from 'components/support/DocumentationLink';
import HelpPopoverButton from 'components/common/HelpPopoverButton';

const ServerVersion = styled.dl(
  ({ theme }) => css`
    color: ${theme.colors.gray[60]};
  `,
);

const StyledHorizontalDl = styled.dl(
  ({ theme }) => css`
    margin: ${theme.spacings.md} 0;

    > dt {
      clear: left;
      float: left;
      margin-bottom: ${theme.spacings.sm};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 160px;
    }

    > *:not(dt) {
      margin-bottom: ${theme.spacings.sm};
      margin-left: 140px;
    }
  `,
);

const ShardReplicationContainer = styled.div`
  display: flex;
  height: 20px;
  align-items: center;
`;

type DataNodeUpgradeMethodType = 'cluster-restart' | 'rolling-upgrade';

const UpgradeMethodSegments: Array<{ value: DataNodeUpgradeMethodType; label: string }> = [
  { value: 'cluster-restart', label: 'Cluster Restart' },
  { value: 'rolling-upgrade', label: 'Rolling Upgrade' },
];

const getClusterHealthStyle = (status: string) => {
  switch (status) {
    case 'GREEN':
      return 'success';
    case 'YELLOW':
      return 'warning';
    case 'RED':
      return 'danger';
    default:
      return 'info';
  }
};

const upgradeInstructionsDocumentationMessage = (
  <p>
    若要手动升级您的数据节点，请遵循以下说明 
    <DocumentationLink text="documentation" page={DocsHelper.PAGES.GRAYLOG_DATA_NODE} />.
  </p>
);

const DataNodeUpgradePage = () => {
  const upgradeListRef = useRef();

  const { data, isInitialLoading } = useDataNodeUpgradeStatus();
  const [upgradeMethod, setUpgradeMethod] = useState<DataNodeUpgradeMethodType>('cluster-restart');
  const [openUpgradeConfirmDialog, setOpenUpgradeConfirmDialog] = useState<boolean>(false);

  const scrollIntoDataNodeUpgradedList = () => {
    if (!isInitialLoading && upgradeListRef?.current) {
      (upgradeListRef.current as HTMLTableSectionElement).scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startNodeUpgrade = async (node: DataNodeInformation) => {
    scrollIntoDataNodeUpgradedList();
    saveNodeToUpgrade(node?.hostname);
    setOpenUpgradeConfirmDialog(true);
    stopShardReplication();
  };

  const confirmNodeUpgrade = async () => {
    startShardReplication();
    setOpenUpgradeConfirmDialog(false);
  };

  const manualUpgradeAlert = (nodeInProgress: string) => (
    <Alert bsStyle="warning">
      <p>
        完成手动升级后 {nodeInProgress ? <b>{nodeInProgress}</b> : 'your Data Node'} 在系统上，等待其重新连接并出现在 <b>已升级节点</b> 面板，然后单击 
        <Button onClick={confirmNodeUpgrade} bsStyle="link" bsSize="large">
          <b>确认升级</b>
        </Button>
          并继续到下一个节点。
      </p>
      {upgradeInstructionsDocumentationMessage}
    </Alert>
  );

  const nodeInProgress = getNodeToUpgrade();

  const numberOfNodes = (data?.outdated_nodes?.length || 0) + (data?.up_to_date_nodes?.length || 0);

  const showRollingUpgrade = upgradeMethod === 'rolling-upgrade' && (!!nodeInProgress || numberOfNodes > 2);

  return (
    <DocumentTitle title="数据节点升级">
      <ClusterConfigurationPageNavigation />
      <PageHeader
        title="数据节点升级"
        documentationLink={{
          title: 'Data Nodes documentation',
          path: DocsHelper.PAGES.GRAYLOG_DATA_NODE,
        }}>
        <span>
          Graylog 数据节点与 Graylog 的集成更紧密，并简化了未来的更新。它们允许您对 Graylog 消息数据库中的所有消息进行索引和搜索。
        </span>
      </PageHeader>
      {isInitialLoading ? (
        <Spinner />
      ) : (
        <Row className="content">
          <Col xs={12}>
            <SegmentedControl
              data={UpgradeMethodSegments}
              value={upgradeMethod}
              onChange={(value: DataNodeUpgradeMethodType) => setUpgradeMethod(value)}
            />
            <Alert bsStyle="info">
              {upgradeMethod === 'cluster-restart' && (
                <>
                  <p>
                    使用集群重启方法时，您将一次性升级所有数据节点。在此期间，消息将在日志中缓冲，并在数据节点集群重新上线时进行处理，只要您的日志大小已针对数据节点停机期间预期的消息量进行配置，就不会导致数据丢失。
                  </p>
                  <p>
                    如果您运行的数据节点集群节点数少于三个，则集群重启方法是唯一可用的方法。
                  </p>
                  <p>
                    如果您正在运行包含三个或更多节点的数据节点集群，在考虑您的日志大小和消息吞吐量后，您可以选择使用集群重启方法。
                  </p>
                </>
              )}
              {upgradeMethod === 'rolling-upgrade' && (
                <>
                  <p>
                    滚动升级仅可在运行的数据节点集群上执行，且必须{' '}
                    <b>三个或更多节点</b>, with virtually no downtime.
                  </p>
                  <p>
                    数据节点可单独就地停止并升级。或者，可以逐个停止数据节点，并由运行新版本的主机替换它们。在此过程中，您可以继续在集群中索引和查询数据。
                  </p>
                </>
              )}
            </Alert>
            {!data?.outdated_nodes?.length && data?.up_to_date_nodes?.length > 0 && (
              <Alert bsStyle="success">您的所有数据节点均为最新。</Alert>
            )}
            {!data?.shard_replication_enabled && manualUpgradeAlert(nodeInProgress)}
            {(data?.warnings?.length || 0) > 0 && (
              <Alert bsStyle="danger">
                {data.warnings.map((warning) => (
                  <p>{warning}</p>
                ))}
              </Alert>
            )}
          </Col>
          <Col xs={12}>
            <h3>
              <Label bsStyle={getClusterHealthStyle(data?.cluster_state?.status)} bsSize="xs">
                {data?.cluster_state?.cluster_name}: {data?.cluster_state?.status}
              </Label>
              &nbsp;
              <HelpPopoverButton
                helpText={
                  <>
                    <p>集群在滚动升级期间状态如何变化？</p>
                    <p>
                      RED - 如果您正在使用无副本的索引，并升级托管这些索引分片的节点，集群将进入红色状态，且无法向这些索引摄入数据或从中搜索数据。
                    </p>
                    <p>
                      黄色 - 在开始升级节点后，分片分配将设置为无复制，以允许 OpenSearch 仅使用可用的分片。
                    </p>
                    <p>
                      节点升级后，当您点击 <em>确认升级</em>, shard replication will
                      be re-enabled and all shards that were unavailable due to the node being upgraded will be
                      re-allocated and the cluster will return to a GREEN state.
                    </p>
                  </>
                }
              />
            </h3>
            <StyledHorizontalDl>
              <dt>服务器版本:</dt>
              <ServerVersion>
                <b>{data?.server_version?.version || ''}</b>
              </ServerVersion>
              {upgradeMethod === 'rolling-upgrade' && (
                <>
                  <dt>分片复制:</dt>
                  <dd>
                    <ShardReplicationContainer>
                      {data?.shard_replication_enabled ? (
                        <Label bsStyle="success" bsSize="xs">
                          已启用
                        </Label>
                      ) : (
                        <Label bsStyle="warning" bsSize="xs">
                          已禁用
                        </Label>
                      )}
                      &nbsp;
                      <HelpPopoverButton
                        helpText={
                          <>
                            <p>
                              点击后{' '}
                              <em>
                                <b>开始升级流程</b>
                              </em>{' '}
                              对于节点，分片分配将设置为无复制，以允许 OpenSearch 仅使用可用的分片。
                            </p>
                            <p>
                              节点升级后，当您点击{' '}
                              <em>
                                <b>确认升级</b>
                              </em>
                              , shard replication will be re-enabled and all shards that were unavailable due to the
                              node being upgraded will be re-allocated.
                            </p>
                            <br />
                            <Button
                              onClick={data?.shard_replication_enabled ? stopShardReplication : startShardReplication}
                              bsStyle="warning"
                              bsSize="xsmall">
                              强制 {data?.shard_replication_enabled ? 'Disabled' : 'Enabled'}
                            </Button>
                          </>
                        }
                      />
                    </ShardReplicationContainer>
                  </dd>
                </>
              )}
              <dt>集群管理器:</dt>
              <dd>{data?.cluster_state?.manager_node?.name}</dd>
              <dt>节点数量:</dt>
              <dd>
                {numberOfNodes} ({data?.outdated_nodes?.length || 0} 过时， {data?.up_to_date_nodes?.length || 0}{' '}
                已升级)
              </dd>
              <dt>分片数量:</dt>
              <dd>
                {data?.cluster_state?.active_shards || 0} 活动, 
                {data?.cluster_state?.initializing_shards || 0} 初始化中， 
                {data?.cluster_state?.relocating_shards || 0} 正在重新定位， 
                {data?.cluster_state?.unassigned_shards || 0} unassigned
              </dd>
            </StyledHorizontalDl>
            <br />
          </Col>
          {showRollingUpgrade && (
            <Col xs={12}>
              <Row>
                <Col sm={6}>
                  <h3>过时的节点</h3>
                  <br />
                  <Table>
                    <tbody>
                      {data?.outdated_nodes?.map((outdated_node) => (
                        <tr key={outdated_node?.hostname}>
                          <td>
                            <div>
                              {outdated_node?.hostname}&nbsp;
                              <Label
                                bsStyle={outdated_node?.data_node_status === 'AVAILABLE' ? 'success' : 'warning'}
                                bsSize="xs">
                                {outdated_node?.data_node_status}
                              </Label>
                              &nbsp;
                              {outdated_node?.manager_node && (
                                <Label bsStyle="info" bsSize="xs">
                                  manager
                                </Label>
                              )}
                            </div>
                            <div>
                              <i>{outdated_node?.ip}</i>
                            </div>
                          </td>
                          <td>
                            <i>{outdated_node?.datanode_version}</i>
                          </td>
                          <td align="right">
                            <Button
                              onClick={() => startNodeUpgrade(outdated_node)}
                              disabled={!outdated_node?.upgrade_possible}
                              bsSize="sm"
                              bsStyle="primary">
                              开始升级流程
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {!data?.outdated_nodes?.length && (
                        <tr>
                          <td>未找到过时的节点。</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
                <Col sm={6}>
                  <h3>已升级节点</h3>
                  <br />
                  <Table>
                    <tbody ref={upgradeListRef}>
                      {data?.up_to_date_nodes?.map((upgraded_node) => (
                        <tr key={upgraded_node?.hostname}>
                          <td>
                            <div>
                              {upgraded_node?.hostname}&nbsp;
                              <Label
                                bsStyle={upgraded_node?.data_node_status === 'AVAILABLE' ? 'success' : 'warning'}
                                bsSize="xs">
                                {upgraded_node?.data_node_status}
                              </Label>
                              &nbsp;
                              {upgraded_node?.manager_node && (
                                <Label bsStyle="info" bsSize="xs">
                                  manager
                                </Label>
                              )}
                            </div>
                            <div>
                              <i>{upgraded_node?.ip}</i>
                            </div>
                          </td>
                          <td>
                            <i>{upgraded_node?.datanode_version}</i>
                          </td>
                          <td align="right">
                            <Label bsStyle="success" bsSize="xs">
                              已升级 <Icon name="check" />
                            </Label>
                          </td>
                        </tr>
                      ))}
                      {!data?.up_to_date_nodes?.length && (
                        <tr>
                          <td>未找到已升级的节点。</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Col>
          )}
          {openUpgradeConfirmDialog && nodeInProgress && (
            <Modal show backdrop={false} onHide={() => setOpenUpgradeConfirmDialog(false)}>
              <Modal.Header>
                <Modal.Title>数据节点手动升级</Modal.Title>
              </Modal.Header>

              <Modal.Body>{manualUpgradeAlert(nodeInProgress)}</Modal.Body>
            </Modal>
          )}
        </Row>
      )}
    </DocumentTitle>
  );
};

export default DataNodeUpgradePage;
