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
import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Formik, Form, Field } from 'formik';
import styled, { css } from 'styled-components';
import { PluginStore } from 'graylog-web-plugin/plugin';

import useIndexSetTemplateDefaults from 'components/indices/IndexSetTemplates/hooks/useIndexSetTemplateDefaults';
import AppConfig from 'util/AppConfig';
import { FormikInput, FormSubmit, Section, Spinner, TimeUnitInput } from 'components/common';
import HideOnCloud from 'util/conditional/HideOnCloud';
import { Col, Row, SegmentedControl } from 'components/bootstrap';
import IndexMaintenanceStrategiesConfiguration from 'components/indices/IndexMaintenanceStrategiesConfiguration';
import 'components/indices/rotation';
import 'components/indices/retention';
import { DataTieringConfiguration, DataTieringVisualisation, prepareDataTieringConfig, prepareDataTieringInitialValues } from 'components/indices/data-tiering';
import type { IndexSet, IndexSetFormValues } from 'stores/indices/IndexSetsStore';
import { IndexSetPropType } from 'stores/indices/IndexSetsStore';
import type {
  RotationStrategyConfig,
  RetentionStrategyConfig,
  RetentionStrategyContext,
  Strategies,
} from 'components/indices/Types';
import IndexRetentionProvider from 'components/indices/contexts/IndexRetentionProvider';
import useHistory from 'routing/useHistory';
import IndexSetProfileConfiguration from 'components/indices/IndexSetProfileConfiguration';
import useFeature from 'hooks/useFeature';
import useIndexSet from 'components/indices/hooks/useIndexSet';
import isIndexFieldTypeChangeAllowed from 'components/indices/helpers/isIndexFieldTypeChangeAllowed';

type Props = {
  cancelLink: string,
  create?: boolean,
  indexSet?: IndexSet,
  onUpdate: (indexSet: IndexSet) => void,
  retentionStrategies: Strategies,
  retentionStrategiesContext: RetentionStrategyContext,
  rotationStrategies: Strategies,
  submitButtonText: string,
  submitLoadingText?: string,
};

type RotationStrategiesProps = {
  rotationStrategies: Array<any>,
  indexSetRotationStrategy: RotationStrategyConfig,
  indexSetRotationStrategyClass: string
}

type RetentionConfigProps = {
  retentionStrategies: Array<any>,
  retentionStrategiesContext: RetentionStrategyContext,
  indexSetRetentionStrategy: RetentionStrategyConfig,
  IndexSetRetentionStrategyClass: string
}

type Unit = 'seconds' | 'minutes';

type RetentionConfigSegment = 'data_tiering' | 'legacy'

const ConfigSegment = styled.div(({ theme }) => css`
  margin-top: ${theme.spacings.md};
`);

const FlexWrapper = styled.div(({ theme }) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacings.md};
`);

const SubmitWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const _validateIndexPrefix = (value: string) => {
  let error: string;

  if (value?.length === 0) {
    error = 'Invalid index prefix: cannot be empty';
  } else if (value?.indexOf('_') === 0 || value?.indexOf('-') === 0 || value?.indexOf('+') === 0) {
    error = 'Invalid index prefix: must start with a letter or number';
  } else if (value?.toLocaleLowerCase() !== value) {
    error = 'Invalid index prefix: must be lower case';
  } else if (!value?.match(/^[a-z0-9][a-z0-9_\-+]*$/)) {
    error = 'Invalid index prefix: must only contain letters, numbers, \'_\', \'-\' and \'+\'';
  }

  return error;
};

const _getRotationConfigState = (strategy: string, data: RotationStrategyConfig) => ({
  rotation_strategy_class: strategy,
  rotation_strategy: data,
});

const _getRetentionConfigState = (strategy: string, data: RetentionStrategyConfig) => ({
  retention_strategy_class: strategy,
  retention_strategy: data,
});

const RotationStrategies = ({ rotationStrategies, indexSetRotationStrategy, indexSetRotationStrategyClass }: RotationStrategiesProps) => {
  if (!rotationStrategies) return <Spinner />;

  return (
    <IndexMaintenanceStrategiesConfiguration title="索引轮转配置"
                                             name="rotation"
                                             description="Graylog 使用多个索引来存储文档。您可以配置其使用的策略，以确定何时轮换当前活动的写入索引。"
                                             selectPlaceholder="Select rotation strategy"
                                             label="轮转策略"
                                             pluginExports={PluginStore.exports('indexRotationConfig')}
                                             strategies={rotationStrategies}
                                             activeConfig={{
                                               config: indexSetRotationStrategy,
                                               strategy: indexSetRotationStrategyClass,
                                             }}
                                             getState={_getRotationConfigState} />
  );
};

const RetentionConfig = ({ retentionStrategies, retentionStrategiesContext, indexSetRetentionStrategy, IndexSetRetentionStrategyClass }: RetentionConfigProps) => {
  if (!retentionStrategies) return <Spinner />;

  return (
    <IndexMaintenanceStrategiesConfiguration title="索引保留配置"
                                             name="retention"
                                             description="Graylog 使用保留策略来清理旧索引。"
                                             selectPlaceholder="Select retention strategy"
                                             label="保留策略"
                                             pluginExports={PluginStore.exports('indexRetentionConfig')}
                                             strategies={retentionStrategies}
                                             retentionStrategiesContext={retentionStrategiesContext}
                                             activeConfig={{
                                               config: indexSetRetentionStrategy,
                                               strategy: IndexSetRetentionStrategyClass,
                                             }}
                                             getState={_getRetentionConfigState} />
  );
};

const ReadOnlyConfig = () => {
  const indexPrefixHelp = (
    <span>
      A <strong>unique</strong> 此索引集所属的 Elasticsearch 索引中使用的前缀。前缀必须以字母或数字开头，且只能包含字母、数字、'_'、'-' 和 '+'。
    </span>
  );

  return (
    <span>
      <FormikInput type="text"
                   id="index-prefix"
                   label="索引前缀"
                   name="index_prefix"
                   help={indexPrefixHelp}
                   validate={_validateIndexPrefix}
                   required />
      <FormikInput type="text"
                   id="index-analyzer"
                   label="分析器"
                   name="index_analyzer"
                   help="此索引集的 Elasticsearch 分析器。"
                   required />
    </span>
  );
};

const IndexSetConfigurationForm = ({
  indexSet: initialIndexSet,
  rotationStrategies,
  retentionStrategies,
  retentionStrategiesContext,
  create,
  onUpdate,
  cancelLink,
  submitButtonText,
  submitLoadingText,
} : Props) => {
  const history = useHistory();

  const [fieldTypeRefreshIntervalUnit, setFieldTypeRefreshIntervalUnit] = useState<Unit>('seconds');
  const { loadingIndexSetTemplateDefaults, indexSetTemplateDefaults } = useIndexSetTemplateDefaults();
  const [indexSet] = useIndexSet(initialIndexSet);
  const isCloud = AppConfig.isCloud();
  const enableDataTieringCloud = useFeature('data_tiering_cloud');

  const retentionConfigSegments: Array<{value: RetentionConfigSegment, label: string}> = [
    { value: 'data_tiering', label: '数据分层' },
    { value: 'legacy', label: '遗留 (已弃用)' },
  ];

  const initialSegment = () : RetentionConfigSegment => {
    if (indexSet?.use_legacy_rotation) return 'legacy';

    return 'data_tiering';
  };

  const [selectedRetentionSegment, setSelectedRetentionSegment] = useState<RetentionConfigSegment>(initialSegment());

  useEffect(() => {
    if (indexSet?.use_legacy_rotation) {
      setSelectedRetentionSegment('legacy');
    } else {
      setSelectedRetentionSegment('data_tiering');
    }
  }, [indexSet]);

  const prepareRetentionConfigBeforeSubmit = useCallback((values: IndexSetFormValues) : IndexSet => {
    const legacyConfig = { ...values, data_tiering: indexSetTemplateDefaults.data_tiering, use_legacy_rotation: true };

    if (isCloud && !enableDataTieringCloud) {
      return legacyConfig;
    }

    if (selectedRetentionSegment === 'legacy') {
      return legacyConfig;
    }

    const configWithDataTiering = { ...values, data_tiering: prepareDataTieringConfig(values.data_tiering, PluginStore) };

    if (loadingIndexSetTemplateDefaults || !indexSetTemplateDefaults) return { ...configWithDataTiering, use_legacy_rotation: false };

    const legacyindexSetTemplateDefaults = {
      rotation_strategy_class: indexSetTemplateDefaults.rotation_strategy_class,
      rotation_strategy: indexSetTemplateDefaults.rotation_strategy as RotationStrategyConfig,
      retention_strategy_class: indexSetTemplateDefaults.retention_strategy_class,
      retention_strategy: indexSetTemplateDefaults.retention_strategy as RetentionStrategyConfig,
    };

    return { ...configWithDataTiering, ...legacyindexSetTemplateDefaults, use_legacy_rotation: false };
  }, [loadingIndexSetTemplateDefaults, indexSetTemplateDefaults, selectedRetentionSegment, enableDataTieringCloud, isCloud]);

  const saveConfiguration = (values: IndexSetFormValues) => onUpdate(prepareRetentionConfigBeforeSubmit(values));

  const onFieldTypeRefreshIntervalChange = (
    intervalValue: number,
    unit: Unit,
    name: string,
    onChange: (name: string, value: number) => void,
    setFieldValue: (key: string, value: number) => void) => {
    onChange(name, moment.duration(intervalValue, unit).asMilliseconds());
    setFieldValue(name, moment.duration(intervalValue, unit).asMilliseconds());
    setFieldTypeRefreshIntervalUnit(unit);
  };

  if (!indexSet) return null;

  const onCancel = () => history.push(cancelLink);

  if (loadingIndexSetTemplateDefaults) return (<Spinner />);

  const prepareInitialValues = () => {
    if (indexSet.data_tiering) {
      return { ...indexSet, data_tiering: prepareDataTieringInitialValues(indexSet.data_tiering, PluginStore) };
    }

    return indexSet as unknown as IndexSetFormValues;
  };

  return (
    <Row>
      <Col md={12}>
        <Formik onSubmit={saveConfiguration}
                enableReinitialize
                initialValues={prepareInitialValues()}>
          {({ isValid, setFieldValue, isSubmitting, values }) => (
            <IndexRetentionProvider>
              <Form>
                <FlexWrapper>
                  <Section title="配置信息">
                    <FormikInput type="text"
                                 label="标题"
                                 id="title"
                                 name="title"
                                 help="索引集的描述性名称。"
                                 required />
                    <FormikInput type="text"
                                 id="description"
                                 label="描述"
                                 name="description"
                                 help="添加此索引集的描述。"
                                 required />
                  </Section>
                  <Section title="详情">
                    {create && <ReadOnlyConfig />}
                    <HideOnCloud>
                      <FormikInput type="number"
                                   id="shards"
                                   label="索引分片"
                                   name="shards"
                                   help="此索引集中每个索引使用的搜索集群分片数。增加索引分片可通过将活动写入索引分布在多个搜索节点上来提高存储到此索引集的数据的搜索集群写入速度。增加索引分片可能会降低搜索性能并增加索引的内存占用。此值不应设置为高于搜索节点的数量。"
                                   required />
                      <FormikInput type="number"
                                   id="replicas"
                                   label="索引副本"
                                   name="replicas"
                                   help="此索引集中每个索引使用的搜索集群副本分片数。添加副本分片可提升索引并行读取时的搜索性能，例如在仪表盘中发生的情况，也是高可用性和备份策略的组成部分。每个副本分片组会成倍增加索引的存储需求和内存占用。此值不应设置得高于搜索节点数，通常不应高于 1。                                   "
                                   required />
                      <FormikInput type="number"
                                   id="max-number-segments"
                                   label="最大段数"
                                   name="index_optimization_max_num_segments"
                                   minLength={1}
                                   help={<><em>高级选项。</em> 优化（强制合并）后每个搜索集群索引的最大段数。设置更高的值会降低索引优化的压缩率。</>}
                                   required />
                      <FormikInput type="checkbox"
                                   id="index-optimization-disabled"
                                   label="轮转后禁用索引优化"
                                   name="index_optimization_disabled"
                                   help={<><em>高级选项。</em> 索引优化是在活动索引轮转后执行的压缩过程，可减少磁盘上索引的大小。它表现为搜索集群在索引轮转后执行的 CPU 密集型维护任务。压缩索引可提高搜索性能并减少索引集的存储占用。</>} />
                      <Field name="field_type_refresh_interval">
                        {({ field: { name, value, onChange } }) => (
                          <TimeUnitInput id="field-type-refresh-interval"
                                         label="字段类型刷新间隔"
                                         type="number"
                                         help={<><em>高级选项。</em> 活动写入索引的字段类型信息更新频率。将此值设置得更高可以略微减少搜索集群的开销并提高性能，但会导致新数据消息在 Graylog 中可搜索的时间变长。</>}
                                         value={moment.duration(value, 'milliseconds').as(fieldTypeRefreshIntervalUnit)}
                                         unit={fieldTypeRefreshIntervalUnit.toUpperCase()}
                                         units={['SECONDS', 'MINUTES']}
                                         required
                                         update={(intervalValue: number, unit: Unit) => onFieldTypeRefreshIntervalChange(
                                           intervalValue, unit, name, onChange, setFieldValue,
                                         )} />
                        )}
                      </Field>
                    </HideOnCloud>
                  </Section>

                  <Section title="轮转与保留">
                    {isCloud && !enableDataTieringCloud ? (
                      <>
                        {indexSet.writable && <RotationStrategies rotationStrategies={rotationStrategies} indexSetRotationStrategy={values.rotation_strategy} indexSetRotationStrategyClass={values.rotation_strategy_class} />}
                        {indexSet.writable && <RetentionConfig retentionStrategies={retentionStrategies} retentionStrategiesContext={retentionStrategiesContext} indexSetRetentionStrategy={values.retention_strategy} IndexSetRetentionStrategyClass={values.retention_strategy_class} />}
                      </>
                    ) : (
                      <>
                        <SegmentedControl<RetentionConfigSegment> data={retentionConfigSegments}
                                                                  value={selectedRetentionSegment}
                                                                  onChange={setSelectedRetentionSegment} />

                        {selectedRetentionSegment === 'data_tiering' ? (
                          <>
                            <DataTieringVisualisation minDays={values.data_tiering?.index_lifetime_min}
                                                      maxDays={values.data_tiering?.index_lifetime_max}
                                                      minDaysInHot={values.data_tiering?.index_hot_lifetime_min}
                                                      warmTierEnabled={values.data_tiering?.warm_tier_enabled}
                                                      archiveData={values.data_tiering?.archive_before_deletion} />
                            <DataTieringConfiguration />
                          </>
                        )
                          : (
                            <ConfigSegment>
                              {indexSet.writable && <RotationStrategies rotationStrategies={rotationStrategies} indexSetRotationStrategy={values.rotation_strategy} indexSetRotationStrategyClass={values.rotation_strategy_class} />}
                              {indexSet.writable && <RetentionConfig retentionStrategies={retentionStrategies} retentionStrategiesContext={retentionStrategiesContext} indexSetRetentionStrategy={values.retention_strategy} IndexSetRetentionStrategyClass={values.retention_strategy_class} />}
                            </ConfigSegment>
                          )}

                      </>
                    )}
                  </Section>
                  {isIndexFieldTypeChangeAllowed(indexSet) && (
                  <Section title="字段类型配置文件">
                    <Field name="field_type_profile">
                      {({ field: { name, value } }) => (
                        <IndexSetProfileConfiguration value={value}
                                                      onChange={(profileId) => {
                                                        setFieldValue(name, profileId);
                                                      }}
                                                      name={name} />
                      )}
                    </Field>
                  </Section>
                  )}
                  <SubmitWrapper>
                    <FormSubmit disabledSubmit={!isValid}
                                submitButtonText={submitButtonText}
                                submitLoadingText={submitLoadingText}
                                isSubmitting={isSubmitting}
                                isAsyncSubmit
                                displayCancel
                                onCancel={onCancel} />
                  </SubmitWrapper>
                </FlexWrapper>
              </Form>
            </IndexRetentionProvider>
          )}
        </Formik>
      </Col>
    </Row>
  );
};

IndexSetConfigurationForm.propTypes = {
  indexSet: IndexSetPropType,
  rotationStrategies: PropTypes.array.isRequired,
  retentionStrategies: PropTypes.array.isRequired,
  retentionStrategiesContext: PropTypes.shape({
    max_index_retention_period: PropTypes.string,
  }).isRequired,
  create: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  cancelLink: PropTypes.string.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  submitLoadingText: PropTypes.string.isRequired,
};

IndexSetConfigurationForm.defaultProps = {
  create: false,
  indexSet: undefined,
};

export default IndexSetConfigurationForm;
