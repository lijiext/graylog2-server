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
import useCompatibilityCheck from 'components/datanode/hooks/useCompatibilityCheck';
import { Spinner } from 'components/common';
import CompatibilityStatus from 'components/datanode/migrations/CompatibilityStatus';
import MigrationStepTriggerButtonToolbar from 'components/datanode/migrations/common/MigrationStepTriggerButtonToolbar';
import type { MigrationStepComponentProps } from 'components/datanode/Types';

const CompatibilityAlert = styled(Alert)`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const CompatibilityCheckStep = ({ currentStep, onTriggerStep, hideActions }: MigrationStepComponentProps) => {
  const { error: requestError, data, isInitialLoading, isError } = useCompatibilityCheck();

  if (isInitialLoading) {
    return <Spinner text="Loading compatibility check results..." />;
  }

  const errors = Object.values(data || {}).flatMap((value) => value?.compatibility_errors || []);
  const warnings = Object.values(data || {}).flatMap((value) => value?.compatibility_warnings || []);
  const isCompatible = errors.length === 0;

  return (
    <>
      <h3>目录兼容性检查</h3>
      {isCompatible && !warnings.length && (
        <CompatibilityAlert bsStyle="success">
          <h4>您现有的 OpenSearch 数据可以迁移到数据节点。</h4>
        </CompatibilityAlert>
      )}
      {(!isCompatible || isError) && (
        <CompatibilityAlert bsStyle="danger">
          {!isError && !isCompatible && (
            <>
              <h4>您现有的 OpenSearch 数据无法迁移到数据节点。</h4>
              <br />
              {errors.map((error) => (
                <dd key={error}>{error}</dd>
              ))}
            </>
          )}
          {isError && (
            <>
              <h4>检查兼容性时发生错误</h4>
              <p>{requestError.message}</p>
            </>
          )}
        </CompatibilityAlert>
      )}
      {warnings.length > 0 && (
        <CompatibilityAlert bsStyle="warning">
          {warnings.map((warning) => (
            <dd key={warning}>{warning}</dd>
          ))}
        </CompatibilityAlert>
      )}
      <br />
      {!isCompatible && (
        <p>您的 OpenSearch 集群无法迁移到此数据节点版本，因为不兼容。</p>
      )}
      {isCompatible &&
        data &&
        Object.keys(data).map((hostname) => (
          <CompatibilityStatus
            key={hostname}
            hostname={hostname}
            opensearchVersion={data[hostname].opensearch_version}
            nodeInfo={data[hostname].info}
          />
        ))}
      <MigrationStepTriggerButtonToolbar
        hidden={hideActions}
        nextSteps={currentStep.next_steps}
        onTriggerStep={onTriggerStep}
      />
    </>
  );
};

export default CompatibilityCheckStep;
