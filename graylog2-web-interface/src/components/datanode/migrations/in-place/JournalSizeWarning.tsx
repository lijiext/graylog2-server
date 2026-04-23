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

import { Icon } from 'components/common';
import { Panel } from 'components/bootstrap';
import { StyledPanel } from 'components/datanode/migrations/MigrationWelcomeStep';
import useProductName from 'brand-customization/useProductName';

const StyledHelpPanel = styled(StyledPanel)`
  margin-top: 30px;
`;

const JournalSizeWarning = () => {
  const productName = useProductName();

  return (
    <StyledHelpPanel bsStyle="warning">
      <Panel.Heading>
        <Panel.Title componentClass="h3">
          <Icon name="warning" /> Journal 大小警告
        </Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <p>
          请注意，在迁移过程中，您将不得不停止处理您的 {productName} 节点，这将导致日志文件体积增大。因此，您必须在“日志文件大小缩减”步骤或更早阶段增加日志文件卷的大小。
        </p>
      </Panel.Body>
    </StyledHelpPanel>
  );
};

export default JournalSizeWarning;
