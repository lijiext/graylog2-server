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
import React, { useEffect } from 'react';

import { Link } from 'components/common/router';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { InputsList } from 'components/inputs';
import Routes from 'routing/Routes';
import withParams from 'routing/withParams';
import { InputStatesStore } from 'stores/inputs/InputStatesStore';
import { NodesStore } from 'stores/nodes/NodesStore';
import useParams from 'routing/useParams';
import { useStore } from 'stores/connect';

import useCurrentUser from '../hooks/useCurrentUser';

const NodeInputsPage = () => {
  const { nodeId } = useParams();

  const currentUser = useCurrentUser();
  const { nodes } = useStore(NodesStore);
  const node = nodes?.[nodeId];

  useEffect(() => {
    const interval = setInterval(InputStatesStore.list, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!node) {
    return <Spinner />;
  }

  const title = <span>节点输入端 {node.short_node_id} / {node.hostname}</span>;

  return (
    <DocumentTitle title={`节点 ${node.short_node_id} / ${node.hostname} 的输入`}>
      <div>
        <PageHeader title={title}>
          <span>
            Graylog 节点通过输入端接收数据。在此页面上，您可以查看此特定节点上正在运行的输入端。<br />
            您可以在集群上启动和终止输入端 <Link to={Routes.SYSTEM.INPUTS}>here</Link>.
          </span>
        </PageHeader>
        <InputsList permissions={currentUser.permissions} node={node} />
      </div>
    </DocumentTitle>
  );
};

export default withParams(NodeInputsPage);
