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

import type { MigrationStepComponentProps } from 'components/datanode/Types';
import MigrationStepTriggerButtonToolbar from 'components/datanode/migrations/common/MigrationStepTriggerButtonToolbar';
import { Space } from 'preflight/components/common';
import MigrationDatanodeList from 'components/datanode/migrations/MigrationDatanodeList';

const RestartGraylog = ({ currentStep, onTriggerStep, hideActions }: MigrationStepComponentProps) => (
  <>
    <p>即将完成！</p>
    <p>请移除 <code>elasticsearch_hosts</code> 来自您的 <code>server.conf</code></p>
    <p>例如， <code>elasticsearch_hosts = https://admin:admin@opensearch1:9200,https://admin:admin@opensearch2:9200,https://admin:admin@opensearch3:9200</code></p>
    <Space h="md" />
    <MigrationDatanodeList showProvisioningState={false} />
    <p>请等待所有数据节点变为'AVAILABLE'。如果它们在 1-2 分钟内未变为可用，请检查数据节点的日志。
    </p>
    {/* eslint-disable-next-line react/no-unescaped-entities */}
    <p>完成后，请重启 Graylog 以完成迁移。</p>
    <MigrationStepTriggerButtonToolbar hidden={hideActions} nextSteps={currentStep.next_steps} onTriggerStep={onTriggerStep} />
  </>
);

export default RestartGraylog;
