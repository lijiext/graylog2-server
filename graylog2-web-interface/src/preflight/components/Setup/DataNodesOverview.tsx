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
import * as React from 'react';
import { Space } from '@mantine/core';
import styled from 'styled-components';

import { Badge, List } from 'preflight/components/common';
import Spinner from 'components/common/Spinner';
import Alert from 'components/bootstrap/Alert';
import useDataNodes from 'preflight/hooks/useDataNodes';
import DataNodeBadge from 'components/datanode/DataNodeList/DataNodeBadge';

const P = styled.p`
  max-width: 700px;
`;

const ErrorBadge = styled(Badge)`
  margin-left: 5px;
`;
const Error = ({ message }: { message: string }) => (
  <ErrorBadge title={message} color="red">
    {message}
  </ErrorBadge>
);

const DataNodesOverview = () => {
  const {
    data: dataNodes,
    isFetching: isFetchingDataNodes,
    isInitialLoading: isInitialLoadingDataNodes,
  } = useDataNodes();

  return (
    <>
      <P>
        Graylog 数据节点与 Graylog 的集成更紧密，并简化了未来的更新。一旦 Graylog 数据节点正在运行且您已配置证书颁发机构，即可恢复启动。
      </P>
      <P>
        这些是当前注册的数据节点。列表会持续更新。{' '}
        {isFetchingDataNodes && <Spinner text="" />}
      </P>
      {!!dataNodes.length && (
        <>
          <Space h="sm" />
          <List spacing="xs">
            {dataNodes.map(({ hostname, transport_address, short_node_id, status, error_msg }) => (
              <List.Item key={short_node_id}>
                <DataNodeBadge status={status} nodeId={short_node_id} transportAddress={transport_address} />
                <span title="传输地址">{transport_address}</span>
                {' – '}
                <span title="主机名">{hostname}</span>
                {error_msg && <Error message={error_msg} />}
              </List.Item>
            ))}
          </List>
        </>
      )}
      {!dataNodes.length && !isInitialLoadingDataNodes && <Alert bsStyle="info">未找到任何数据节点。</Alert>}
      <Space h="md" />
    </>
  );
};

export default DataNodesOverview;
