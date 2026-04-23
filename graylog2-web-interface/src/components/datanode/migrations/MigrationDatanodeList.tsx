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
import styled from 'styled-components';

import { Icon, Spinner, Timestamp } from 'components/common';
import { Alert, Table } from 'components/bootstrap';
import { DocumentationLink } from 'components/support';
import useDataNodes from 'components/datanode/hooks/useDataNodes';

type Props = {
  showProvisioningState?: boolean
}

const StyledIcon = styled(Icon)`
  margin-right: 0.5em;
`;

const MigrationDatanodeList = ({ showProvisioningState }: Props) => {
  const { data: dataNodes, isInitialLoading } = useDataNodes();

  if (isInitialLoading) {
    return <Spinner text="Loading Data Nodes" />;
  }

  return (
    <div>
      {(!dataNodes || dataNodes?.list.length === 0) ? (
        <>
          <p><StyledIcon name="info" />未找到 Data Node。</p>
          <Alert bsStyle="warning" title="未找到数据节点">
            请至少启动一个数据节点以继续迁移过程。有关如何启动数据节点的更多信息，请参见我们的 <DocumentationLink page="graylog-data-node" text="documentation" />.
          </Alert>
          <p><Spinner text="Looking for Data Nodes..." /></p>
        </>
      ) : (
        <>
          <h4>找到的数据节点： {dataNodes?.list.length}</h4>
          {dataNodes.list.find((datanode) => !datanode.version_compatible) && (
            <Alert bsStyle="warning" title="发现不兼容的数据节点">
              存在与当前 Graylog 版本不兼容的 Data Node 正在运行。请确保 Graylog 和 Data Node 使用相同的版本。
            </Alert>
          )}
          <br />
          <Table bordered condensed striped hover>
            <thead>
              <tr>
                <th>主机名</th>
                <th>传输地址</th>
                <th>状态</th>
                <th>证书有效期至</th>
                <th>版本</th>
              </tr>
            </thead>
            <tbody>
              {dataNodes.list.map((datanode) => (
                <tr key={datanode.id}>
                  <td>{datanode.hostname}</td>
                  <td>{datanode.transport_address}</td>
                  <td>{showProvisioningState ? datanode.status : datanode.data_node_status}</td>
                  <td>{datanode.cert_valid_until ? <Timestamp dateTime={datanode.cert_valid_until} /> : 'No certificate'}</td>
                  <td>
                    {!datanode.version_compatible && (
                      <Icon name="warning"
                            title="此版本与当前 Graylog 版本不兼容。" />
                    )}
                    {datanode.datanode_version}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

MigrationDatanodeList.defaultProps = {
  showProvisioningState: true,
};

export default MigrationDatanodeList;
