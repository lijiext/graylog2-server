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

import MigrationStepTriggerButtonToolbar from 'components/datanode/migrations/common/MigrationStepTriggerButtonToolbar';
import type { MigrationStepComponentProps } from 'components/datanode/Types';
import { Panel } from 'components/bootstrap';
import { Icon } from 'components/common';
import { StyledPanel } from 'components/datanode/migrations/MigrationWelcomeStep';
import useProductName from 'brand-customization/useProductName';

const StyledHelpPanel = styled(StyledPanel)`
  margin-top: 30px;
`;

const StopMessageProcessing = ({ currentStep, onTriggerStep, hideActions }: MigrationStepComponentProps) => {
  const productName = useProductName();

  return (
    <>
      <p>{productName} 处理已停止。</p>
      <StyledHelpPanel bsStyle="warning">
        <Panel.Heading>
          <Panel.Title componentClass="h3">
            <Icon name="warning" />
            停止 OpenSearch
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <p>请在继续之前停止您的 OpenSearch 集群。</p>
          <p>
            如果您正在通过将数据节点指向其数据目录来迁移现有的 OpenSearch 数据，请确保将数据目录的所有者更改为运行数据节点的用户（通常是 graylog-datanode），并重置正确的权限，例如通过运行
          </p>
          <p>
            <code>sudo chown -R graylog-datanode:graylog-datanode &lt;your_data_directory&gt;</code>
            <br />
            <code>sudo chmod -R 750 &lt;your_data_directory&gt;</code>
          </p>
        </Panel.Body>
      </StyledHelpPanel>
      <p />
      <MigrationStepTriggerButtonToolbar
        hidden={hideActions}
        nextSteps={currentStep.next_steps}
        onTriggerStep={onTriggerStep}
      />
    </>
  );
};

export default StopMessageProcessing;
