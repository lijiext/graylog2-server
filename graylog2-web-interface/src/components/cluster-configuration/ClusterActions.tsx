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
import React, { useState } from 'react';
import URI from 'urijs';

import { LinkContainer } from 'components/common/router';
import { ConfirmDialog, ExternalLink, IfPermitted } from 'components/common';
import { DropdownButton, MenuItem } from 'components/bootstrap';
import Routes from 'routing/Routes';
import HideOnCloud from 'util/conditional/HideOnCloud';
import { SystemLoadBalancerStore } from 'stores/load-balancer/SystemLoadBalancerStore';
import { SystemProcessingStore } from 'stores/system-processing/SystemProcessingStore';

import type { GraylogNode } from './useClusterNodes';

type Props = {
  node: GraylogNode;
};

const ClusterActions = ({ node }: Props) => {
  const [showMessageProcessingModal, setShowMessageProcessingModal] = useState<boolean>(false);
  const [loadBalancerStatusToConfirm, setLoadBalancerStatusToConfirm] = useState<'ALIVE' | 'DEAD' | undefined>(
    undefined,
  );

  const apiBrowserURI = new URI(`${node.transport_address}/api-browser/`).normalizePathname().toString();
  const nodeName = `${node.short_node_id} / ${node.hostname}`;

  const toggleMessageProcessing = () => {
    if (node.is_processing) {
      SystemProcessingStore.pause(node.node_id);
    } else {
      SystemProcessingStore.resume(node.node_id);
    }
    setShowMessageProcessingModal(false);
  };

  const updateLoadBalancerStatus = (status: 'ALIVE' | 'DEAD') => {
    SystemLoadBalancerStore.override(node.node_id, status);
    setLoadBalancerStatusToConfirm(undefined);
  };

  return (
    <>
      <DropdownButton bsSize="xs" title="更多" id={`more-actions-dropdown-${node.node_id}`} pullRight>
        <IfPermitted permissions="processing:changestate">
          <MenuItem onSelect={() => setShowMessageProcessingModal(true)}>
            {node.is_processing ? 'Pause' : 'Resume'} 消息处理
          </MenuItem>
        </IfPermitted>
        <IfPermitted permissions="lbstatus:change">
          {node.lb_status === 'alive' ? (
            <MenuItem onSelect={() => setLoadBalancerStatusToConfirm('DEAD')}>
              将负载均衡器状态覆盖为 DEAD
            </MenuItem>
          ) : (
            <MenuItem onSelect={() => setLoadBalancerStatusToConfirm('ALIVE')}>
              将负载均衡器状态覆盖为 ALIVE
            </MenuItem>
          )}
        </IfPermitted>
        <IfPermitted permissions={['processing:changestate', 'lbstatus:change', 'node:shutdown']} anyPermissions>
          <IfPermitted permissions={['inputs:read', 'threads:dump']} anyPermissions>
            <MenuItem divider />
          </IfPermitted>
        </IfPermitted>
        <LinkContainer to={Routes.SYSTEM.METRICS(node.node_id)}>
          <MenuItem>指标</MenuItem>
        </LinkContainer>
        <HideOnCloud>
          <IfPermitted permissions="inputs:read">
            <LinkContainer to={Routes.node_inputs(node.node_id)}>
              <MenuItem>本地消息输入端</MenuItem>
            </LinkContainer>
          </IfPermitted>
        </HideOnCloud>
        <IfPermitted permissions="threads:dump">
          <LinkContainer to={Routes.SYSTEM.THREADDUMP(node.node_id)}>
            <MenuItem>获取线程转储</MenuItem>
          </LinkContainer>
        </IfPermitted>
        <IfPermitted permissions="processbuffer:dump">
          <LinkContainer to={Routes.SYSTEM.PROCESSBUFFERDUMP(node.node_id)}>
            <MenuItem>获取进程缓冲区转储</MenuItem>
          </LinkContainer>
        </IfPermitted>
        <IfPermitted permissions="loggersmessages:read">
          <LinkContainer to={Routes.SYSTEM.SYSTEMLOGS(node.node_id)}>
            <MenuItem>获取最近的系统日志消息</MenuItem>
          </LinkContainer>
        </IfPermitted>
        <IfPermitted permissions="api_browser:read">
          <MenuItem href={apiBrowserURI} target="_blank">
            <ExternalLink>API 浏览器</ExternalLink>
          </MenuItem>
        </IfPermitted>
      </DropdownButton>
      {showMessageProcessingModal && (
        <ConfirmDialog
          show
          onConfirm={toggleMessageProcessing}
          onCancel={() => setShowMessageProcessingModal(false)}
          title="消息处理">
          <>
            您即将 <b>{node.is_processing ? 'pause' : 'resume'}</b> 消息处理中 <b>{nodeName}</b>{' '}
            节点。确定吗？
          </>
        </ConfirmDialog>
      )}
      {loadBalancerStatusToConfirm && (
        <ConfirmDialog
          show
          onConfirm={() => updateLoadBalancerStatus(loadBalancerStatusToConfirm)}
          onCancel={() => setLoadBalancerStatusToConfirm(undefined)}
          title="负载均衡器">
          <>
            您即将更改负载均衡器的状态 <b>{nodeName}</b> 节点到{' '}
            <b>{loadBalancerStatusToConfirm}</b>。您确定吗？
          </>
        </ConfirmDialog>
      )}
    </>
  );
};

export default ClusterActions;
