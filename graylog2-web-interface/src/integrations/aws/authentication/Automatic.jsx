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
import styled from 'styled-components';

import { Table } from 'components/bootstrap';
import { Icon } from 'components/common';
import { SectionTitle, SectionNote } from 'integrations/aws/common/sharedStyles';

const StyledTable = styled(Table)`
  margin: 0;
`;

const Automatic = () => (
  <StyledTable condensed>
    <thead>
      <tr>
        <td colSpan="2">
          <SectionTitle>自动认证将按以下列出的顺序尝试每一项。</SectionTitle>
        </td>
      </tr>
    </thead>

    <tbody>
      <tr>
        <th>环境变量</th>
        <td>
          <code>AWS_ACCESS_KEY_ID</code> and <code>AWS_SECRET_ACCESS_KEY</code>
        </td>
      </tr>
      <tr>
        <th>Java 系统属性</th>
        <td>
          <code>aws.accessKeyId</code> and <code>aws.secretKey</code>
        </td>
      </tr>
      <tr>
        <th>默认凭证配置文件</th>
        <td>
          通常位于 <code>~/.aws/credentials</code>
        </td>
      </tr>
      <tr>
        <th>Amazon ECS 容器凭据</th>
        <td>
          如果环境变量从 Amazon ECS 加载 <code>AWS_CONTAINER_CREDENTIALS_RELATIVE_URI</code> 已设置
        </td>
      </tr>
      <tr>
        <th>实例配置文件凭据</th>
        <td>用于 EC2 实例，并通过 Amazon EC2 元数据服务提供</td>
      </tr>
    </tbody>

    <tfoot>
      <tr>
        <td colSpan="2">
          <SectionNote>
            有关更多信息，请查看{' '}
            <a
              href="https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html"
              target="_blank"
              rel="noopener noreferrer">
              AWS 凭证配置文档 <Icon name="open_in_new" />
            </a>
          </SectionNote>
        </td>
      </tr>
    </tfoot>
  </StyledTable>
);

export default Automatic;
