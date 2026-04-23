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
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import moment from 'moment';
import { Formik, Form, Field } from 'formik';
import styled, { css } from 'styled-components';
import { PluginStore } from 'graylog-web-plugin/plugin';

import useIndexSetTemplateDefaults from 'components/indices/IndexSetTemplates/hooks/useIndexSetTemplateDefaults';
import AppConfig from 'util/AppConfig';
import { FormikInput, FormSubmit, Section, Spinner, TimeUnitInput } from 'components/common';
import HideOnCloud from 'util/conditional/HideOnCloud';
import { Alert, Col, Row } from 'components/bootstrap';
import 'components/indices/rotation';
import 'components/indices/retention';
import { prepareDataTieringConfig, prepareDataTieringInitialValues } from 'components/indices/data-tiering';
import type { IndexSet, IndexSetFormValues, IndexSetFieldRestriction } from 'stores/indices/IndexSetsStore';
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
import useProductName from 'brand-customization/useProductName';
import HiddenFieldWrapper from 'components/indices/IndexSetConfigurationForm/HiddenFieldWrapper';
import IndexSetReadOnlyConfiguration from 'components/indices/IndexSetConfigurationForm/IndexSetReadOnlyConfiguration';
import IndexSetRotationRetentionConfigurationSection from 'components/indices/IndexSetConfigurationForm/IndexSetRotationRetentionConfigurationSection';
import useCurrentUser from 'hooks/useCurrentUser';
import { isPermitted } from 'util/PermissionsMixin';

type Props = {
  cancelLink: string;
  create?: boolean;
  indexSet?: IndexSet;
  onUpdate: (indexSet: IndexSet) => void;
  retentionStrategies: Strategies;
  retentionStrategiesContext: RetentionStrategyContext;
  rotationStrategies: Strategies;
  submitButtonText: string;
  submitLoadingText?: string;
};

type Unit = 'seconds' | 'minutes';

type RetentionConfigSegment = 'data_tiering' | 'legacy';

const FlexWrapper = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacings.md};
  `,
);

const SubmitWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const IndexSetConfigurationForm = ({
  indexSet: initialIndexSet = undefined,
  rotationStrategies,
  retentionStrategies,
  retentionStrategiesContext,
  create = false,
  onUpdate,
  cancelLink,
  submitButtonText,
  submitLoadingText = undefined,
}: Props) => {
  const history = useHistory();
  const productName = useProductName();
  const ignoreFieldRestrictions = isPermitted(useCurrentUser().permissions, 'indexsets_field_restrictions:edit');

  const [fieldTypeRefreshIntervalUnit, setFieldTypeRefreshIntervalUnit] = useState<Unit>('seconds');
  const { loadingIndexSetTemplateDefaults, indexSetTemplateDefaults } = useIndexSetTemplateDefaults();
  const [indexSet] = useIndexSet(initialIndexSet);

  const [immutableFields, setImmutableFields] = useState<string[]>([]);
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);

  const isCloud = AppConfig.isCloud();
  const enableDataTieringCloud = useFeature('data_tiering_cloud');

  const initialSegment = (): RetentionConfigSegment => {
    if (hiddenFields.includes('data_tiering')) return 'legacy';
    if (hiddenFields.includes('legacy')) return 'data_tiering';

    if (indexSet?.use_legacy_rotation) return 'legacy';

    return 'data_tiering';
  };

  const [selectedRetentionSegment, setSelectedRetentionSegment] = useState<RetentionConfigSegment>(initialSegment());

  const parseFieldRestrictions = (field_restrictions: IndexSetFieldRestriction[]) => {
    const getHidden = () =>
      Object.keys(field_restrictions).filter(
        (field) => field_restrictions[field].filter((restriction) => restriction.type === 'hidden').length > 0,
      );

    const getImmutable = () =>
      Object.keys(field_restrictions).filter(
        (field) => field_restrictions[field].filter((restriction) => restriction.type === 'immutable').length > 0,
      );

    if (field_restrictions) return [getImmutable(), getHidden()];

    return [[], []];
  };

  useEffect(() => {
    if (indexSet?.use_legacy_rotation) {
      setSelectedRetentionSegment('legacy');
    } else {
      setSelectedRetentionSegment('data_tiering');
    }
  }, [indexSet]);

  useEffect(() => {
    const [tmpImmutable, tmpHidden] = parseFieldRestrictions(indexSet?.field_restrictions);
    setImmutableFields(tmpImmutable);
    setHiddenFields(tmpHidden);
  }, [indexSet]);

  const isDataTieringImmutable = useMemo(() => immutableFields.includes('data_tiering'), [immutableFields]);
  const isDataTieringLocked = isDataTieringImmutable && !ignoreFieldRestrictions;

  const prepareRetentionConfigBeforeSubmit = useCallback(
    (values: IndexSetFormValues): IndexSet => {
      const indexSetValues = values;

      if (!create) {
        delete indexSetValues.index_prefix;
        delete indexSetValues.index_analyzer;
        delete indexSetValues.creation_date;
        delete indexSetValues.can_be_default;
        delete indexSetValues.default;
      }

      const legacyConfig = {
        ...indexSetValues,
        data_tiering: indexSetTemplateDefaults.data_tiering,
        use_legacy_rotation: true,
      };

      if (isCloud && !enableDataTieringCloud) {
        return legacyConfig;
      }

      if (selectedRetentionSegment === 'legacy') {
        return legacyConfig;
      }

      const configWithDataTiering = {
        ...indexSetValues,
        data_tiering: prepareDataTieringConfig(values.data_tiering, PluginStore, isDataTieringLocked),
      };

      if (loadingIndexSetTemplateDefaults || !indexSetTemplateDefaults)
        return { ...configWithDataTiering, use_legacy_rotation: false };

      const legacyindexSetTemplateDefaults = {
        rotation_strategy_class: indexSetTemplateDefaults.rotation_strategy_class,
        rotation_strategy: indexSetTemplateDefaults.rotation_strategy as RotationStrategyConfig,
        retention_strategy_class: indexSetTemplateDefaults.retention_strategy_class,
        retention_strategy: indexSetTemplateDefaults.retention_strategy as RetentionStrategyConfig,
      };

      return { ...configWithDataTiering, ...legacyindexSetTemplateDefaults, use_legacy_rotation: false };
    },
    [
      create,
      loadingIndexSetTemplateDefaults,
      indexSetTemplateDefaults,
      selectedRetentionSegment,
      enableDataTieringCloud,
      isCloud,
      isDataTieringLocked,
    ],
  );

  const saveConfiguration = (values: IndexSetFormValues) => onUpdate(prepareRetentionConfigBeforeSubmit(values));

  const onFieldTypeRefreshIntervalChange = (
    intervalValue: number,
    unit: Unit,
    name: string,
    onChange: (name: string, value: number) => void,
    setFieldValue: (key: string, value: number) => void,
  ) => {
    onChange(name, moment.duration(intervalValue, unit).asMilliseconds());
    setFieldValue(name, moment.duration(intervalValue, unit).asMilliseconds());
    setFieldTypeRefreshIntervalUnit(unit);
  };

  const detailsSectionRenderable = (): boolean => {
    if (create) return true;

    const detailsFieldsEdit = [
      'shards',
      'replicas',
      'index_optimization_max_num_segments',
      'index_optimization_disabled',
      'field_type_refresh_interval',
    ];

    return detailsFieldsEdit.filter((fieldName: string) => !hiddenFields.includes(fieldName)).length > 0;
  };

  if (!indexSet) return null;

  const onCancel = () => history.push(cancelLink);

  if (loadingIndexSetTemplateDefaults) return <Spinner />;

  const prepareInitialValues = () => {
    if (indexSet.data_tiering) {
      return {
        ...indexSet,
        data_tiering: prepareDataTieringInitialValues(indexSet.data_tiering, PluginStore, isDataTieringLocked),
      };
    }

    return indexSet as unknown as IndexSetFormValues;
  };

  return (
    <Row>
      <Col md={12}>
        <Formik validateOnMount onSubmit={saveConfiguration} enableReinitialize initialValues={prepareInitialValues()}>
          {({ isValid, setFieldValue, isSubmitting, values }) => (
            <IndexRetentionProvider>
              <Form>
                <FlexWrapper>
                  <Section title="配置信息">
                    <FormikInput
                      type="text"
                      label="标题"
                      id="title"
                      name="title"
                      help="索引集的描述性名称。"
                      required
                    />
                    <FormikInput
                      type="text"
                      id="description"
                      label="描述"
                      name="description"
                      help="为此索引集添加描述。"
                      required
                    />
                  </Section>
                  {detailsSectionRenderable() && (
                    <Section title="详情">
                      {create && (
                        <IndexSetReadOnlyConfiguration
                          hiddenFields={hiddenFields}
                          immutableFields={immutableFields}
                          ignoreFieldRestrictions={ignoreFieldRestrictions}
                        />
                      )}
                      <HideOnCloud>
                        <HiddenFieldWrapper
                          hiddenFields={hiddenFields}
                          ignoreFieldRestrictions={ignoreFieldRestrictions}>
                          <FormikInput
                            type="number"
                            id="shards"
                            label="索引分片"
                            name="shards"
                            help="此索引集中每个索引使用的搜索集群分片数。增加索引分片可通过将活动的写入索引分布在多个搜索节点上来提高存储到此索引集的数据的搜索集群写入速度。增加索引分片可能会降低搜索性能并增加索引的内存占用。此值不应设置为高于搜索节点的数量。"
                            required
                            disabled={immutableFields?.includes('shards') && !ignoreFieldRestrictions}
                          />
                          <FormikInput
                            type="number"
                            id="replicas"
                            label="索引副本"
                            name="replicas"
                            help="Number of search cluster Replica Shards used per Index in this Index Set. Adding Replica Shards improves search performance during parallel reads of the index, such as occurs on dashboards, and is a component of HA and backup strategy. Each Replica Shard set multiplies the storage requirement and memory footprint of the index. This value should not be set higher than the number of search nodes, and typically not higher than 1.                                   "
                            required
                            disabled={immutableFields?.includes('replicas') && !ignoreFieldRestrictions}
                          />
                          <FormikInput
                            type="number"
                            id="max-number-segments"
                            label="最大分段数"
                            name="index_optimization_max_num_segments"
                            minLength={1}
                            help={
                              <>
                                <em>高级选项。</em> 优化（强制合并）后每个搜索集群索引的最大段数。设置较高的值会降低索引优化的压缩率。
                              </>
                            }
                            required
                            disabled={
                              immutableFields?.includes('index_optimization_max_num_segments') &&
                              !ignoreFieldRestrictions
                            }
                          />
                          <FormikInput
                            type="checkbox"
                            id="index-optimization-disabled"
                            label="旋转后禁用索引优化"
                            name="index_optimization_disabled"
                            help={
                              <>
                                <em>高级选项。</em> 索引优化是在活动索引完成轮转后发生的压缩过程，可减少磁盘上索引的大小。它表现为搜索集群在索引轮转后执行的 CPU 密集型维护任务。压缩索引可提高搜索性能并减少索引集的存储占用。
                              </>
                            }
                            disabled={
                              immutableFields?.includes('index_optimization_disabled') && !ignoreFieldRestrictions
                            }
                          />
                          <Field name="field_type_refresh_interval">
                            {({ field: { name, value, onChange } }) => (
                              <TimeUnitInput
                                label="字段类型刷新间隔"
                                help={
                                  <>
                                    <em>高级选项。</em> 活动写入索引的字段类型信息将多久更新一次。将此值设置得更高可以略微减少搜索集群的开销并提高性能，但会导致新数据消息的搜索时间变长 {productName}.
                                  </>
                                }
                                value={moment.duration(value, 'milliseconds').as(fieldTypeRefreshIntervalUnit)}
                                unit={fieldTypeRefreshIntervalUnit.toUpperCase()}
                                units={['SECONDS', 'MINUTES']}
                                update={(intervalValue: number, unit: Unit) =>
                                  onFieldTypeRefreshIntervalChange(intervalValue, unit, name, onChange, setFieldValue)
                                }
                                required
                                disabled={
                                  immutableFields?.includes('field_type_refresh_interval') && !ignoreFieldRestrictions
                                }
                              />
                            )}
                          </Field>
                        </HiddenFieldWrapper>
                      </HideOnCloud>
                    </Section>
                  )}
                  <IndexSetRotationRetentionConfigurationSection
                    values={values}
                    indexSet={indexSet}
                    retentionStrategies={retentionStrategies}
                    retentionStrategiesContext={retentionStrategiesContext}
                    rotationStrategies={rotationStrategies}
                    hiddenFields={hiddenFields}
                    immutableFields={immutableFields}
                    ignoreFieldRestrictions={ignoreFieldRestrictions}
                    isCloud={isCloud}
                    enableDataTieringCloud={enableDataTieringCloud}
                    selectedRetentionSegment={selectedRetentionSegment}
                    setSelectedRetentionSegment={setSelectedRetentionSegment}
                  />
                  {isIndexFieldTypeChangeAllowed(indexSet) && (
                    <Section title="字段类型配置文件">
                      <Field name="field_type_profile">
                        {({ field: { name, value } }) => (
                          <IndexSetProfileConfiguration
                            value={value}
                            onChange={(profileId) => {
                              setFieldValue(name, profileId);
                            }}
                            name={name}
                          />
                        )}
                      </Field>
                    </Section>
                  )}
                  <Section title="重要提示">
                    <Alert bsStyle="info">
                      这些更改不适用于任何现有索引。它们仅适用于新创建的索引。若要立即将此更改应用于当前索引集，请轮转该索引。
                    </Alert>
                  </Section>
                  <SubmitWrapper>
                    <FormSubmit
                      disabledSubmit={!isValid}
                      submitButtonText={submitButtonText}
                      submitLoadingText={submitLoadingText}
                      isSubmitting={isSubmitting}
                      isAsyncSubmit
                      displayCancel
                      onCancel={onCancel}
                    />
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

export default IndexSetConfigurationForm;
