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
import { LoggerOverview, ClusterSupportBundleOverview } from 'components/loggers';

const LoggersPage = () => (
  <DocumentTitle title="日志记录">
    <span>
      <PageHeader title="日志记录">
        <span>
          此部分控制 Graylog 架构的日志记录，并允许您动态更改日志级别。请注意，在重启受影响的服务后，日志级别将重置为默认值。
        </span>
      </PageHeader>
      <LoggerOverview />
      <ClusterSupportBundleOverview />
    </span>
  </DocumentTitle>
);

export default LoggersPage;
