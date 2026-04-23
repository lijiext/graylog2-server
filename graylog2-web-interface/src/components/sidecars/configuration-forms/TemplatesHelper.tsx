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

import { Table } from 'components/bootstrap';

const TemplatesHelper = () => {
  const _buildVariableName = (name) => `\${sidecar.${name}}`;

  return (
    <div>
      <Table responsive>
        <thead>
          <tr>
            <th>名称</th>
            <th>描述</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>{_buildVariableName('operatingSystem')}</code></td>
            <td>Sidecar 运行的操作系统名称，例如 <code>&quot;Linux&quot;, &quot;Windows&quot;</code></td>
          </tr>
          <tr>
            <td><code>{_buildVariableName('nodeName')}</code></td>
            <td>Sidecar 的名称，若未设置则默认为主机名。</td>
          </tr>
          <tr>
            <td><code>{_buildVariableName('nodeId')}</code></td>
            <td>Sidecar 的 UUID。</td>
          </tr>
          <tr>
            <td><code>{_buildVariableName('sidecarVersion')}</code></td>
            <td>正在运行的 Sidecar 的版本字符串。</td>
          </tr>
          <tr>
            <td><code>{_buildVariableName('spoolDir')}</code></td>
            <td>每个配置唯一的目录，可用于存储采集器数据。</td>
          </tr>
          <tr>
            <td><code>{_buildVariableName('tags.<tag>')}</code></td>
            <td>为 Sidecar 设置的标签映射。这可以用于渲染条件配置片段。例如： <br />
              <code> &lt;#if sidecar.tags.webserver??&gt;<br />&nbsp;&nbsp;- /var/log/apache/*.log<br />&lt;/#if&gt;  </code>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default TemplatesHelper;
