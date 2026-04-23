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

import { DocumentTitle, PageHeader } from 'components/common';
import OutputsComponent from 'components/outputs/OutputsComponent';
import useCurrentUser from 'hooks/useCurrentUser';

const SystemOutputsPage = () => {
  const currentUser = useCurrentUser();

  return (
    <DocumentTitle title="输出端">
      <span>
        <PageHeader title="集群中的输出端">
          <span>
            Graylog 节点可通过输出端转发消息。在此处可启动或终止任意数量的输出端{' '}
            <strong>然后将其分配给数据流，以实时转发该数据流的所有消息。</strong><br />
            您可以在 中找到输出插件 <a href="https://marketplace.graylog.org/" target="_blank" rel="noreferrer">Graylog 应用市场</a>.
          </span>
        </PageHeader>

        <OutputsComponent permissions={currentUser.permissions} />
      </span>
    </DocumentTitle>
  );
};

export default SystemOutputsPage;
