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
import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import Immutable from 'immutable';

import { useStore } from 'stores/connect';
import type { Store } from 'stores/StoreTypes';
import { ConfigurationsActions, ConfigurationsStore } from 'stores/configurations/ConfigurationsStore';
import { getConfig } from 'components/configurations/helpers';
import { ConfigurationType } from 'components/configurations/ConfigurationTypes';
import { Button, Row, Col, BootstrapModalForm, Input } from 'components/bootstrap';
import { IfPermitted, ISODurationInput } from 'components/common';
import Spinner from 'components/common/Spinner';
import type { SearchesConfig as SearchConfig } from 'components/search/SearchConfig';
import Select from 'components/common/Select/Select';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import 'moment-duration-format';
import type { TimeRangePreset } from 'components/configurations/TimeRangePresetForm';
import TimeRangePresetForm from 'components/configurations/TimeRangePresetForm';
import generateId from 'logic/generateId';
import TimeRangePresetOptionsSummary from 'components/configurations/TimeRangePresetOptionSummary';
import { onInitializingTimerange } from 'views/components/TimerangeForForm';
import useUserDateTime from 'hooks/useUserDateTime';
import type { DateTime, DateTimeFormats } from 'util/DateTime';
import { normalizeFromSearchBarForBackend } from 'views/logic/queries/NormalizeTimeRange';
import { getPathnameWithoutId } from 'util/URLUtils';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import useMinimumRefreshInterval from 'views/hooks/useMinimumRefreshInterval';
import Alert from 'components/bootstrap/Alert';
import useLocation from 'routing/useLocation';
import ReadableDuration from 'components/common/ReadableDuration';

import TimeRangeOptionsForm from './TimeRangeOptionsForm';
import TimeRangeOptionsSummary from './TimeRangeOptionsSummary';

const queryTimeRangeLimitValidator = (milliseconds: number) => milliseconds >= 1;

const surroundingTimeRangeValidator = (milliseconds: number) => milliseconds >= 1;

const autoRefreshTimeRangeValidator = (minimumRefreshIntervalMS: number) => (milliseconds: number) =>
  milliseconds >= 1000 && milliseconds >= minimumRefreshIntervalMS;

const splitStringList = (stringList: string) =>
  stringList
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

const buildTimeRangeOptions = (options: { [x: string]: string }) =>
  Object.keys(options).map((key) => ({ period: key, description: options[key] }));

type Option = { period: string; description: string };

const mapQuickAccessBEData = (
  items: Array<TimeRangePreset>,
  formatTime: (time: DateTime, format?: DateTimeFormats) => string,
): Immutable.List<TimeRangePreset> =>
  Immutable.List(
    items.map(({ timerange, description, id }) => {
      const presetId = id ?? generateId();

      return { description, id: presetId, timerange: onInitializingTimerange(timerange, formatTime) };
    }),
  );

const SearchesConfig = () => {
  const { userTimezone, formatTime } = useUserDateTime();
  const isLimitEnabled = (config: { query_time_range_limit: string }) =>
    moment.duration(config?.query_time_range_limit).asMilliseconds() > 0;
  const { data: minimumRefreshInterval, isInitialLoading: isLoadingMinimumRefreshInterval } =
    useMinimumRefreshInterval();
  const minimumRefreshIntervalMS = moment.duration(minimumRefreshInterval).asMilliseconds();
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [viewConfig, setViewConfig] = useState<SearchConfig | undefined>(undefined);
  const [formConfig, setFormConfig] = useState<SearchConfig | undefined>(undefined);
  const configuration = useStore(ConfigurationsStore as Store<Record<string, any>>, (state) => state?.configuration);
  const [relativeTimeRangeOptionsUpdate, setRelativeTimeRangeOptionsUpdate] = useState<Array<Option> | undefined>(
    undefined,
  );
  const [surroundingTimeRangeOptionsUpdate, setSurroundingTimeRangeOptionsUpdate] = useState<Array<Option> | undefined>(
    undefined,
  );
  const [autoRefreshTimeRangeOptionsUpdate, setAutoRefreshTimeRangeOptionsUpdate] = useState<Array<Option> | undefined>(
    undefined,
  );
  const [surroundingFilterFieldsUpdate, setSurroundingFilterFieldsUpdate] = useState<string | undefined>(undefined);
  const [analysisDisabledFieldsUpdate, setAnalysisDisabledFieldsUpdate] = useState<string | undefined>(undefined);
  const [defaultAutoRefreshOptionUpdate, setDefaultAutoRefreshOptionUpdate] = useState<string | undefined>(undefined);
  const [timeRangePresetsUpdated, setTimeRangePresetsUpdated] = useState<Immutable.List<TimeRangePreset>>(undefined);
  const [showCancelAfterSeconds, setShowCancelAfterSeconds] = useState(false);
  const sendTelemetry = useSendTelemetry();
  const { pathname } = useLocation();

  useEffect(() => {
    ConfigurationsActions.list(ConfigurationType.SEARCHES_CLUSTER_CONFIG).then(() => {
      const config = getConfig(ConfigurationType.SEARCHES_CLUSTER_CONFIG, configuration);
      setViewConfig(config);
      setFormConfig(config);
      setShowCancelAfterSeconds(!!config?.cancel_after_seconds);
    });
  }, [configuration]);

  const onUpdate = (field: keyof SearchConfig) => (newOptions) => {
    setFormConfig({ ...formConfig, [field]: newOptions });
  };

  const onTimeRangePresetsUpdate = (data: Immutable.List<TimeRangePreset>) => {
    setTimeRangePresetsUpdated(data);
  };

  const onSurroundingTimeRangeOptionsUpdate = (data: Array<Option>) => {
    setSurroundingTimeRangeOptionsUpdate(data);
  };

  const onAutoRefreshTimeRangeOptionsUpdate = (data: Array<Option>) => {
    setAutoRefreshTimeRangeOptionsUpdate(data);
  };

  const onFilterFieldsUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurroundingFilterFieldsUpdate(e.target.value);
  };

  const onAnalysisDisabledFieldsUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnalysisDisabledFieldsUpdate(e.target.value);
  };

  const onAutoRefreshDefaultOptionsUpdate = (data: string) => {
    setDefaultAutoRefreshOptionUpdate(data);
  };

  const onChecked = () => {
    let queryTimeRangeLimit;

    if (isLimitEnabled(formConfig)) {
      // If currently enabled, disable by setting the limit to 0 seconds.
      queryTimeRangeLimit = 'PT0S';
    } else {
      // If currently not enabled, set a default of 30 days.
      queryTimeRangeLimit = 'P30D';
    }

    setFormConfig({ ...formConfig, query_time_range_limit: queryTimeRangeLimit });
  };

  const onCancelAfterSecondsChanged = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setFormConfig({ ...formConfig, cancel_after_seconds: Number(value) });
  };

  const onCheckedCancelAfterSeconds = () => {
    let cancelAfterSeconds: number | null;

    if (showCancelAfterSeconds) {
      cancelAfterSeconds = null;
    } else {
      cancelAfterSeconds = 30;
    }

    setShowCancelAfterSeconds((cur) => !cur);
    setFormConfig({ ...formConfig, cancel_after_seconds: cancelAfterSeconds });
  };

  const openModal = () => {
    setShowConfigModal(true);
  };

  const resetFormUpdates = () => {
    setRelativeTimeRangeOptionsUpdate(undefined);
    setSurroundingTimeRangeOptionsUpdate(undefined);
    setSurroundingFilterFieldsUpdate(undefined);
    setAnalysisDisabledFieldsUpdate(undefined);
    setAutoRefreshTimeRangeOptionsUpdate(undefined);
    setDefaultAutoRefreshOptionUpdate(undefined);
    setTimeRangePresetsUpdated(undefined);
  };

  const handleModalCancel = () => {
    setShowConfigModal(false);
    setFormConfig(viewConfig);
    resetFormUpdates();
  };

  const saveConfig = () => {
    const update = { ...formConfig };

    sendTelemetry(TELEMETRY_EVENT_TYPE.CONFIGURATIONS.SEARCHES_UPDATED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_section: 'search',
      app_action_value: 'configuration-save',
    });

    if (relativeTimeRangeOptionsUpdate) {
      update.relative_timerange_options = {};

      relativeTimeRangeOptionsUpdate.forEach((entry) => {
        update.relative_timerange_options[entry.period] = entry.description;
      });

      setRelativeTimeRangeOptionsUpdate(undefined);
    }

    if (timeRangePresetsUpdated) {
      update.quick_access_timerange_presets = timeRangePresetsUpdated
        .toArray()
        .map(({ description, timerange, id }) => ({
          description,
          timerange: normalizeFromSearchBarForBackend(timerange, userTimezone),
          id,
        }));

      setTimeRangePresetsUpdated(undefined);
    }

    if (surroundingTimeRangeOptionsUpdate) {
      update.surrounding_timerange_options = {};

      surroundingTimeRangeOptionsUpdate.forEach((entry) => {
        update.surrounding_timerange_options[entry.period] = entry.description;
      });

      setSurroundingTimeRangeOptionsUpdate(undefined);
    }

    if (surroundingFilterFieldsUpdate) {
      update.surrounding_filter_fields = splitStringList(surroundingFilterFieldsUpdate);
      setSurroundingFilterFieldsUpdate(undefined);
    }

    if (analysisDisabledFieldsUpdate) {
      update.analysis_disabled_fields = splitStringList(analysisDisabledFieldsUpdate);
      setAnalysisDisabledFieldsUpdate(undefined);
    }

    if (autoRefreshTimeRangeOptionsUpdate) {
      update.auto_refresh_timerange_options = Object.fromEntries(
        autoRefreshTimeRangeOptionsUpdate.map((entry) => [entry.period, entry.description]),
      );
      setAutoRefreshTimeRangeOptionsUpdate(undefined);
    }

    const defaultAutoRefreshOption = defaultAutoRefreshOptionUpdate
      ? (update.auto_refresh_timerange_options[defaultAutoRefreshOptionUpdate] ??
        Object.keys(update.auto_refresh_timerange_options)[0])
      : (update.auto_refresh_timerange_options[update.default_auto_refresh_option] ??
        Object.keys(update.auto_refresh_timerange_options)[0]);

    if (update.default_auto_refresh_option !== defaultAutoRefreshOption) {
      update.default_auto_refresh_option = defaultAutoRefreshOptionUpdate;
      setDefaultAutoRefreshOptionUpdate(undefined);
    }

    const newFormConfig = { ...formConfig, ...update };

    ConfigurationsActions.update(ConfigurationType.SEARCHES_CLUSTER_CONFIG, newFormConfig).then(() => {
      setShowConfigModal(false);
      resetFormUpdates();
    });
  };

  const timeRangePresetsFromBE = useMemo(
    () => mapQuickAccessBEData(formConfig?.quick_access_timerange_presets ?? [], formatTime),
    [formConfig?.quick_access_timerange_presets, formatTime],
  );
  const timeRangePresets = useMemo(
    () => timeRangePresetsUpdated ?? timeRangePresetsFromBE,
    [timeRangePresetsFromBE, timeRangePresetsUpdated],
  );

  if (!viewConfig) {
    return <Spinner />;
  }

  const duration = (config) => moment.duration(config.query_time_range_limit);
  const limit = (config) =>
    isLimitEnabled(config) ? `${config.query_time_range_limit} (${duration(config).humanize()})` : 'disabled';
  const autoRefreshOptions = (config) =>
    autoRefreshTimeRangeOptionsUpdate ?? buildTimeRangeOptions(config.auto_refresh_timerange_options);
  const formDefaultAutoRefreshOptionUpdate = (config) =>
    defaultAutoRefreshOptionUpdate ?? config.default_auto_refresh_option;
  const defaultAutoRefreshOption = (config) =>
    autoRefreshOptions(config).find((option) => option.period === formDefaultAutoRefreshOptionUpdate(config))
      ? formDefaultAutoRefreshOptionUpdate(config)
      : autoRefreshOptions[0]?.period;

  const cancellationTimeout = (config) =>
    config.cancel_after_seconds ? `${config.cancel_after_seconds} seconds` : 'disabled';

  return (
    <div>
      <h2>搜索配置</h2>

      <dl className="deflist">
        <dt>查询时间范围限制</dt>
        <dd>{limit(viewConfig)}</dd>
        <dd>
          用户可查询过去数据的最长时间。这可以防止用户意外创建跨越大量数据的查询，此类查询可能需要很长时间和大量资源才能完成（甚至可能无法完成）。
        </dd>
      </dl>

      <dl className="deflist">
        <dt>取消超时</dt>
        <dd>{cancellationTimeout(viewConfig)}</dd>
        <dd>
          每个小部件在自动取消搜索执行前可执行的秒数。这有助于减少执行的搜索数量并提升性能。
        </dd>
      </dl>

      <Row>
        <Col md={4}>
          <strong>搜索时间范围预设</strong>
          <TimeRangePresetOptionsSummary options={timeRangePresetsFromBE.toArray()} />
          <strong>周围时间范围选项</strong>
          <TimeRangeOptionsSummary options={viewConfig.surrounding_timerange_options} />
        </Col>
        <Col md={4}>
          <Row style={{ marginBottom: 20 }}>
            <Col>
              <strong>周围搜索过滤字段</strong>
              <ul>
                {viewConfig.surrounding_filter_fields &&
                  viewConfig.surrounding_filter_fields.map((f: string) => <li key={f}>{f}</li>)}
              </ul>
            </Col>
          </Row>
          <Row>
            <Col>
              <strong>字段上的 UI 分析已禁用</strong>
              <ul>
                {viewConfig.analysis_disabled_fields &&
                  viewConfig.analysis_disabled_fields.map((f: string) => <li key={f}>{f}</li>)}
              </ul>
            </Col>
          </Row>
        </Col>
        <Col md={4}>
          <strong>自动刷新间隔选项</strong>
          <TimeRangeOptionsSummary options={viewConfig.auto_refresh_timerange_options} />

          <strong>默认自动刷新间隔</strong>
          <TimeRangeOptionsSummary
            options={{
              [viewConfig.default_auto_refresh_option]:
                viewConfig.auto_refresh_timerange_options[viewConfig.default_auto_refresh_option],
            }}
          />
        </Col>
      </Row>
      <IfPermitted permissions="clusterconfigentry:edit">
        <Button bsStyle="info" bsSize="xs" onClick={openModal}>
          编辑配置
        </Button>
      </IfPermitted>

      {showConfigModal && formConfig && (
        <BootstrapModalForm
          show
          bsSize="large"
          title="更新搜索配置"
          onSubmitForm={saveConfig}
          onCancel={handleModalCancel}
          submitButtonText="更新配置">
          <fieldset>
            <label htmlFor="query-limit-checkbox">查询时间范围限制</label>
            <Input
              id="query-limit-checkbox"
              type="checkbox"
              label="启用查询限制"
              name="enabled"
              checked={isLimitEnabled(formConfig)}
              onChange={onChecked}
            />
            {isLimitEnabled(formConfig) && (
              <ISODurationInput
                id="query-timerange-limit-field"
                duration={formConfig.query_time_range_limit}
                update={onUpdate('query_time_range_limit')}
                label="查询时间范围限制 (ISO8601 持续时间)"
                help='搜索的最大时间范围。（例如："P30D" 表示 30 天，"PT24H" 表示 24 小时）'
                validator={queryTimeRangeLimitValidator}
                required
              />
            )}
            <label htmlFor="cancel_after_seconds_checkbox">查询取消超时</label>
            <Input
              id="cancel_after_seconds_checkbox"
              type="checkbox"
              label="启用查询取消超时"
              name="cancel_after_seconds_checkbox"
              checked={showCancelAfterSeconds}
              onChange={onCheckedCancelAfterSeconds}
              help="每个小部件在自动取消搜索执行前可执行的秒数。这有助于减少执行的搜索数量并提升性能。"
            />
            {showCancelAfterSeconds && (
              <Input
                id="cancel_after_seconds"
                type="number"
                label="取消超时"
                name="cancel_after_seconds"
                min="1"
                step="1"
                pattern="\d+"
                required
                value={formConfig.cancel_after_seconds}
                onChange={onCancelAfterSecondsChanged}
              />
            )}
            <TimeRangePresetForm options={timeRangePresets} onUpdate={onTimeRangePresetsUpdate} />
            <TimeRangeOptionsForm
              options={
                surroundingTimeRangeOptionsUpdate || buildTimeRangeOptions(formConfig.surrounding_timerange_options)
              }
              update={onSurroundingTimeRangeOptionsUpdate}
              validator={surroundingTimeRangeValidator}
              title="周围时间范围选项"
              help={
                <span>
                  配置以下可用选项 <strong>surrounding</strong> 时间范围选择器为{' '}
                  <strong>ISO8601 时长</strong>
                </span>
              }
            />

            <Input
              id="filter-fields-input"
              type="text"
              label="周围搜索过滤字段"
              onChange={onFilterFieldsUpdate}
              value={
                surroundingFilterFieldsUpdate ||
                (formConfig.surrounding_filter_fields && formConfig.surrounding_filter_fields.join(', '))
              }
              help="以 ',' 分隔的消息字段列表，将用作周围消息查询的过滤器。"
              required
            />

            <Input
              id="disabled-fields-input"
              type="text"
              label="已禁用的分析字段"
              onChange={onAnalysisDisabledFieldsUpdate}
              value={
                analysisDisabledFieldsUpdate ||
                (formConfig.analysis_disabled_fields && formConfig.analysis_disabled_fields.join(', '))
              }
              help="一个以 ',' 分隔的消息字段列表，在这些字段中，Web UI 中的分析功能（如 QuickValues）将被禁用。"
              required
            />
            <TimeRangeOptionsForm
              options={autoRefreshOptions(formConfig)}
              update={onAutoRefreshTimeRangeOptionsUpdate}
              validator={autoRefreshTimeRangeValidator(minimumRefreshIntervalMS)}
              title="自动刷新间隔选项"
              help={
                <span>
                  配置以下可用选项 <strong>自动刷新</strong> 间隔选择器为{' '}
                  <strong>ISO8601 时长</strong>
                </span>
              }
            />
            <Input
              label="默认自动刷新选项"
              id="default-auto-refresh-option"
              required
              help="选择自动刷新启动时使用的间隔，前提是您未明确选择一个间隔">
              <Select
                placeholder="选择默认间隔"
                clearable={false}
                options={autoRefreshOptions(formConfig)}
                displayKey="description"
                valueKey="period"
                onChange={onAutoRefreshDefaultOptionsUpdate}
                value={defaultAutoRefreshOption(formConfig)}
              />
            </Input>
            {!isLoadingMinimumRefreshInterval && (
              <Alert bsStyle="warning">
                请注意，最小刷新间隔为 <ReadableDuration duration={minimumRefreshInterval} /> (
                {minimumRefreshInterval}) has been configured in the server configuration file. Only intervals which are
                equal or above the minimum can be used.
              </Alert>
            )}
          </fieldset>
        </BootstrapModalForm>
      )}
    </div>
  );
};

export default SearchesConfig;
