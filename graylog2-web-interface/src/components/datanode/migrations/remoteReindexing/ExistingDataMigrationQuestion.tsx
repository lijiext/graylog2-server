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

import { Space } from 'preflight/components/common';
import useProductName from 'brand-customization/useProductName';

import type { MigrationStepComponentProps } from '../../Types';
import MigrationStepTriggerButtonToolbar from '../common/MigrationStepTriggerButtonToolbar';

const ExistingDataMigrationQuestion = ({ currentStep, onTriggerStep, hideActions }: MigrationStepComponentProps) => {
  const productName = useProductName();

  return (
    <>
      <p>您是否要迁移现有数据？</p>
      <Space h="md" />
      <p>
        请移除 <code>elasticsearch_hosts</code> 来自您的 Graylog 配置文件的一行 (
        <code>server.conf</code>).
      </p>
      <p>
        例如，{' '}
        <code>
          elasticsearch_hosts =
          https://admin:admin@opensearch1:9200,https://admin:admin@opensearch2:9200,https://admin:admin@opensearch3:9200
        </code>
      </p>
      <Space h="md" />
      <p>完成后请重启 {productName} 完成迁移。</p>
      <Space h="md" />
      <MigrationStepTriggerButtonToolbar
        hidden={hideActions}
        nextSteps={currentStep.next_steps}
        onTriggerStep={onTriggerStep}
      />
    </>
  );
};

export default ExistingDataMigrationQuestion;
