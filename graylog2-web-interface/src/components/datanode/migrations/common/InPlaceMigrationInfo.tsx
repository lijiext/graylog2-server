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
import styled, { css } from 'styled-components';

import { Panel } from 'components/bootstrap';

export const StyledPanel = styled(Panel)<{ bsStyle: string }>(
  ({ bsStyle = 'default', theme }) => css`
    &.panel {
      background-color: ${theme.colors.global.contentBackground};

      .panel-heading {
        color: ${theme.colors.variant.darker[bsStyle]};
      }
    }
    margin-top: ${theme.spacings.md} !important;
  `,
);

const InPlaceMigrationInfo = () => (
  <StyledPanel bsStyle="info">
    <Panel.Heading>
      <Panel.Title componentClass="h3">原地迁移</Panel.Title>
    </Panel.Heading>
    <Panel.Body>
      对于就地迁移，请确保您的数据节点的配置位于 <code>datanode.conf</code>，特别是 <code>opensearch_data_location</code> 配置选项，指向每个节点上正确的现有 OpenSearch 数据目录。
      <br />
      在迁移期间，Data Node 和 OpenSearch 的系统用户都需要能够访问并写入数据目录。为确保这一点，您可以运行例如
      <br />
      <code>sudo chmod -R 757 &lt;your_data_directory&gt;</code>
    </Panel.Body>
  </StyledPanel>
);
export default InPlaceMigrationInfo;
