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
import { PluginStore } from 'graylog-web-plugin/plugin';

import type { IndexSet, IndexSetFormValues } from 'stores/indices/IndexSetsStore';
import type {
  RetentionStrategyContext,
  Strategies,
  RotationStrategyConfig,
  RetentionStrategyConfig,
} from 'components/indices/Types';
import { Spinner } from 'components/common';
import IndexMaintenanceStrategiesConfiguration from 'components/indices/IndexMaintenanceStrategiesConfiguration';

type Props = {
  indexSet: IndexSet;
  values: IndexSetFormValues;
  retentionStrategies: Strategies;
  retentionStrategiesContext: RetentionStrategyContext;
  rotationStrategies: Strategies;
  hiddenFields: string[];
  immutableFields: string[];
  ignoreFieldRestrictions: boolean;
};

type RotationStrategiesProps = {
  rotationStrategies: Array<any>;
  indexSetRotationStrategy: RotationStrategyConfig;
  indexSetRotationStrategyClass: string;
  disabled?: boolean;
};

type RetentionConfigProps = {
  retentionStrategies: Array<any>;
  retentionStrategiesContext: RetentionStrategyContext;
  indexSetRetentionStrategy: RetentionStrategyConfig;
  IndexSetRetentionStrategyClass: string;
  immutableFields?: string[];
  disabled?: boolean;
};

const _getRotationConfigState = (strategy: string, data: RotationStrategyConfig) => ({
  rotation_strategy_class: strategy,
  rotation_strategy: data,
});

const _getRetentionConfigState = (strategy: string, data: RetentionStrategyConfig) => ({
  retention_strategy_class: strategy,
  retention_strategy: data,
});

const RotationStrategies = ({
  rotationStrategies,
  indexSetRotationStrategy,
  indexSetRotationStrategyClass,
  disabled = false,
}: RotationStrategiesProps) => {
  if (!rotationStrategies) return <Spinner />;

  return (
    <IndexMaintenanceStrategiesConfiguration
      title="索引轮转配置"
      name="rotation"
      description="使用多个索引存储文档，您可以配置策略以确定何时轮换当前活动的写入索引。"
      selectPlaceholder="Select rotation strategy"
      label="轮转策略"
      pluginExports={PluginStore.exports('indexRotationConfig')}
      strategies={rotationStrategies}
      activeConfig={{
        config: indexSetRotationStrategy,
        strategy: indexSetRotationStrategyClass,
      }}
      getState={_getRotationConfigState}
      disabled={disabled}
    />
  );
};

const RetentionConfig = ({
  retentionStrategies,
  retentionStrategiesContext,
  indexSetRetentionStrategy,
  IndexSetRetentionStrategyClass,
  disabled = false,
  immutableFields = [],
}: RetentionConfigProps) => {
  if (!retentionStrategies) return <Spinner />;

  return (
    <IndexMaintenanceStrategiesConfiguration
      title="索引保留配置"
      name="retention"
      description="保留策略用于清理旧索引"
      selectPlaceholder="Select retention strategy"
      label="保留策略"
      pluginExports={PluginStore.exports('indexRetentionConfig')}
      strategies={retentionStrategies}
      retentionStrategiesContext={retentionStrategiesContext}
      activeConfig={{
        config: indexSetRetentionStrategy,
        strategy: IndexSetRetentionStrategyClass,
      }}
      getState={_getRetentionConfigState}
      disabled={disabled}
      immutableFields={immutableFields}
    />
  );
};

const IndexSetRotationRetentionLegacyConfiguration = ({
  indexSet,
  values,
  rotationStrategies,
  retentionStrategies,
  retentionStrategiesContext,
  hiddenFields,
  immutableFields,
  ignoreFieldRestrictions,
}: Props) => {
  const sectionDisabled: boolean = immutableFields.includes('legacy');

  return (
    <>
      {indexSet.writable && (!hiddenFields?.includes('legacy.rotation_strategy') || ignoreFieldRestrictions) && (
        <RotationStrategies
          rotationStrategies={rotationStrategies}
          indexSetRotationStrategy={values.rotation_strategy}
          indexSetRotationStrategyClass={values.rotation_strategy_class}
          disabled={
            (immutableFields?.includes('legacy.rotation_strategy') || sectionDisabled) && !ignoreFieldRestrictions
          }
        />
      )}
      {indexSet.writable && (!hiddenFields?.includes('legacy.retention_strategy') || ignoreFieldRestrictions) && (
        <RetentionConfig
          retentionStrategies={retentionStrategies}
          retentionStrategiesContext={retentionStrategiesContext}
          indexSetRetentionStrategy={values.retention_strategy}
          IndexSetRetentionStrategyClass={values.retention_strategy_class}
          disabled={
            (immutableFields?.includes('legacy.retention_strategy') || sectionDisabled) && !ignoreFieldRestrictions
          }
          immutableFields={immutableFields}
        />
      )}
    </>
  );
};
export default IndexSetRotationRetentionLegacyConfiguration;
