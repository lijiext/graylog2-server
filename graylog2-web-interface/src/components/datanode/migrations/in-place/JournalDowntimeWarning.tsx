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

import { Alert } from 'components/bootstrap';
import type { MigrationStepComponentProps } from 'components/datanode/Types';
import MigrationStepTriggerButtonToolbar from 'components/datanode/migrations/common/MigrationStepTriggerButtonToolbar';
import useProductName from 'brand-customization/useProductName';

import useJournalDowntimeSize from '../../hooks/useJournalDowntimeSize';
import MigrationError from '../common/MigrationError';

const DownsizeWarning = styled(Alert)`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const JournalDowntimeWarning = ({ currentStep, onTriggerStep, hideActions }: MigrationStepComponentProps) => {
  const productName = useProductName();
  const { data, error, isError } = useJournalDowntimeSize();

  return (
    <>
      <h3>Journal 停机大小警告</h3>
      <p>
        请注意，在迁移期间，您的数据将停止处理 {productName} 节点，这将导致日志文件的大小增长。
      </p>
      <p>因此，您可能需要增加日志卷的大小。</p>
      <p>
        您当前的日志大小是： <b>{data.journal_size_MB} MB</b> 且您当前的日志吞吐量为:{' '}
        <b>{data.KBs_per_minute} KB/分钟</b>
      </p>
      <p>
        您重新配置时的当前最大停机时间 {productName} 指向数据节点的地址是:{' '}
        <b>{data.max_downtime_duration}</b>
      </p>
      {isError && (
        <MigrationError
          errorMessage={`估算日志吞吐量时出错：${error?.message}`}
        />
      )}
      <DownsizeWarning bsStyle="warning">
        请在继续之前确保您的日志卷大小足够。
      </DownsizeWarning>
      <MigrationStepTriggerButtonToolbar
        hidden={hideActions}
        nextSteps={currentStep.next_steps}
        onTriggerStep={onTriggerStep}
      />
    </>
  );
};

export default JournalDowntimeWarning;
