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
import { useParams } from 'react-router-dom';

import { Link } from 'components/common/router';
import { Col } from 'components/bootstrap';
import { ContentHeadRow, DocumentTitle, Spinner } from 'components/common';
import OutputsComponent from 'components/outputs/OutputsComponent';
import Routes from 'routing/Routes';
import useCurrentUser from 'hooks/useCurrentUser';
import useStream from 'components/streams/hooks/useStream';

const StreamOutputsPage = () => {
  const currentUser = useCurrentUser();
  const { streamId } = useParams();
  const { data: stream } = useStream(streamId);

  if (!stream) {
    return <Spinner />;
  }

  return (
    <DocumentTitle title={`数据流 ${stream.title} 的输出`}>
      <div>
        <ContentHeadRow className="content">
          <Col md={10}>
            <h1>
              数据流的输出端 »{stream.title}&laquo;
            </h1>

            <p className="description">
              Graylog 节点可通过输出端转发数据流的消息。在此处可启动或终止任意数量的输出端。您还可重用已为其他数据流运行的输出端。所有已配置输出端的全局视图可用 <Link to={Routes.SYSTEM.OUTPUTS}>here</Link>。您可以在以下位置找到输出插件 <a href="https://marketplace.graylog.org/" rel="noopener noreferrer" target="_blank">Graylog 应用市场</a>.
              <br />

              <i>正在移除</i> 一个输出端会将其从该数据流中移除，但它仍将保留在可用输出端列表中。删除一个输出端 <i>globally</i> 将从此数据流和所有其他数据流中移除它并终止它。您可以在详细信息中查看所有定义的输出端 {' '} <Link to={Routes.SYSTEM.OUTPUTS}>全局输出端列表</Link>.
            </p>
          </Col>
        </ContentHeadRow>
        <OutputsComponent streamId={stream.id} permissions={currentUser.permissions} />
      </div>
    </DocumentTitle>
  );
};

export default StreamOutputsPage;
