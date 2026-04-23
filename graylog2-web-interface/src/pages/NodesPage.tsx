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
import URI from 'urijs';
import PropTypes from 'prop-types';

import * as URLUtils from 'util/URLUtils';
import { DocumentTitle, ExternalLinkButton, PageHeader, Spinner } from 'components/common';
import { NodesList } from 'components/nodes';
import type { NodeInfo } from 'stores/nodes/NodesStore';
import { NodesStore } from 'stores/nodes/NodesStore';
import { useStore } from 'stores/connect';

import useCurrentUser from '../hooks/useCurrentUser';

const GLOBAL_API_BROWSER_URL = '/api-browser/global/index.html';

const hasExternalURI = (nodes: { [nodeId: string]: NodeInfo }) => {
  const nodeVals = Object.values(nodes);
  const publishURI = URLUtils.qualifyUrl('/');

  return (nodeVals.findIndex((node) => new URI(node.transport_address).normalizePathname().toString() !== publishURI) >= 0);
};

const GlobalAPIButton = ({ nodes }: { nodes: { [nodeId: string]: NodeInfo } }) => {
  if (!nodes) {
    return <Spinner />;
  }

  if (hasExternalURI(nodes)) {
    return (
      <ExternalLinkButton bsStyle="info" href={URLUtils.qualifyUrl(GLOBAL_API_BROWSER_URL)}>
        集群全局 API 浏览器
      </ExternalLinkButton>
    );
  }

  return null;
};

GlobalAPIButton.propTypes = {
  nodes: PropTypes.object.isRequired,
};

const NodesPage = () => {
  const currentUser = useCurrentUser();
  const { nodes } = useStore(NodesStore);

  return (
    <DocumentTitle title="节点">
      <div>
        <PageHeader title="节点" actions={<GlobalAPIButton nodes={nodes} />}>
          <span>
            此页面提供 Graylog 集群中节点的实时概览。您可以随时暂停消息处理。在恢复处理之前，进程缓冲区将不接受任何新消息。如果为节点启用了消息日志（默认情况下已启用），即使处理已禁用，传入的消息也会持久化到磁盘。
          </span>
        </PageHeader>
        <NodesList permissions={currentUser.permissions} nodes={nodes} />
      </div>
    </DocumentTitle>
  );
};

export default NodesPage;
