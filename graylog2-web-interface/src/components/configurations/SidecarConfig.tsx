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
import { useEffect, useState } from 'react';

import { useStore } from 'stores/connect';
import type { Store } from 'stores/StoreTypes';
import { ConfigurationsActions, ConfigurationsStore } from 'stores/configurations/ConfigurationsStore';
import { getConfig } from 'components/configurations/helpers';
import { ConfigurationType } from 'components/configurations/ConfigurationTypes';
import { Button, BootstrapModalForm, Input } from 'components/bootstrap';
import { IfPermitted, ISODurationInput } from 'components/common';
import Spinner from 'components/common/Spinner';
import * as ISODurationUtils from 'util/ISODurationUtils';
import { getValueFromInput } from 'util/FormsUtils';
import StringUtils from 'util/StringUtils';

type Config = {
  sidecar_expiration_threshold: string;
  sidecar_inactive_threshold: string;
  sidecar_update_interval: string;
  sidecar_send_status: boolean;
  sidecar_configuration_override: boolean;
};

const DEFAULT_CONFIG = {
  sidecar_expiration_threshold: 'P14D',
  sidecar_inactive_threshold: 'PT1M',
  sidecar_update_interval: 'PT30S',
  sidecar_send_status: true,
  sidecar_configuration_override: false,
};

const SidecarConfig = () => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [viewConfig, setViewConfig] = useState<Config>(DEFAULT_CONFIG);
  const [formConfig, setFormConfig] = useState<Config>(DEFAULT_CONFIG);
  const configuration = useStore(ConfigurationsStore as Store<Record<string, any>>, (state) => state?.configuration);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    ConfigurationsActions.list(ConfigurationType.SIDECAR_CONFIG).then(() => {
      const config = getConfig(ConfigurationType.SIDECAR_CONFIG, configuration);

      setViewConfig(config);
      setFormConfig(config);
      setLoaded(true);
    });
  }, [configuration]);

  const openModal = () => {
    setShowConfigModal(true);
  };

  const closeModal = () => {
    setShowConfigModal(false);
    setFormConfig(viewConfig);
  };

  const saveConfig = () => {
    ConfigurationsActions.update(ConfigurationType.SIDECAR_CONFIG, formConfig).then(() => {
      closeModal();
    });
  };

  const onUpdate = (field: string) => (value: string | React.ChangeEvent<HTMLInputElement>) => {
    const newValue = typeof value === 'object' ? getValueFromInput(value.target) : value;

    setFormConfig({ ...formConfig, [field]: newValue });
  };

  const inactiveThresholdValidator = (milliseconds: number) => milliseconds >= 1000;

  const expirationThresholdValidator = (milliseconds: number) => milliseconds >= 60 * 1000;

  const durationMilliseconds = (duration: string) =>
    ISODurationUtils.isValidDuration(duration, (milliseconds) => milliseconds);

  const updateIntervalValidator = (milliseconds: number) => {
    const inactiveMilliseconds = durationMilliseconds(formConfig.sidecar_inactive_threshold);
    const expirationMilliseconds = durationMilliseconds(formConfig.sidecar_expiration_threshold);

    return milliseconds >= 1000 && milliseconds < inactiveMilliseconds && milliseconds < expirationMilliseconds;
  };

  if (!loaded || !viewConfig) {
    return <Spinner />;
  }

  return (
    <div>
      <h2>Sidecars 配置</h2>

      <dl className="deflist">
        <dt>非活跃阈值:</dt>
        <dd>{viewConfig.sidecar_inactive_threshold}</dd>
        <dt>过期阈值:</dt>
        <dd>{viewConfig.sidecar_expiration_threshold}</dd>
        <dt>更新间隔：</dt>
        <dd>{viewConfig.sidecar_update_interval}</dd>
        <dt>发送状态:</dt>
        <dd>{StringUtils.capitalizeFirstLetter(viewConfig.sidecar_send_status.toString())}</dd>
        <dt>覆盖配置:</dt>
        <dd>{StringUtils.capitalizeFirstLetter(viewConfig.sidecar_configuration_override.toString())}</dd>
      </dl>

      <IfPermitted permissions="clusterconfigentry:edit">
        <Button bsStyle="info" bsSize="xs" onClick={openModal}>
          编辑配置
        </Button>
      </IfPermitted>

      {showConfigModal && formConfig && (
        <BootstrapModalForm
          show
          title="更新 Sidecars 系统配置"
          onSubmitForm={saveConfig}
          onCancel={closeModal}
          submitButtonText="更新配置">
          <fieldset>
            <ISODurationInput
              id="inactive-threshold-field"
              duration={formConfig.sidecar_inactive_threshold}
              update={onUpdate('sidecar_inactive_threshold')}
              label="非活跃阈值（以 ISO8601 时长表示）"
              help="Sidecars 被标记为不活动前的不活动时间长度。"
              validator={inactiveThresholdValidator}
              errorText="invalid (min: 1 second)"
              required
            />

            <ISODurationInput
              id="sidecar-expiration-field"
              duration={formConfig.sidecar_expiration_threshold}
              update={onUpdate('sidecar_expiration_threshold')}
              label="过期阈值（以 ISO8601 时长表示）"
              help="不活动的 Sidecar 从数据库中被清除的时间量。"
              validator={expirationThresholdValidator}
              errorText="invalid (min: 1 minute)"
              required
            />
            <ISODurationInput
              id="sidecar-update-field"
              duration={formConfig.sidecar_update_interval}
              update={onUpdate('sidecar_update_interval')}
              label="更新间隔（以 ISO8601 时长表示）"
              help="Sidecar 更新请求之间的时间间隔。"
              validator={updateIntervalValidator}
              errorText="invalid (min: 1 second, but less than Inactive threshold)"
              required
            />
          </fieldset>
          <Input
            type="checkbox"
            id="send-status-updates-checkbox"
            label="发送状态更新"
            checked={formConfig.sidecar_send_status}
            onChange={onUpdate('sidecar_send_status')}
            help="从每个客户端发送 Sidecar 状态和主机指标"
          />
          <Input
            type="checkbox"
            id="override-sidecar-config-checkbox"
            label="覆盖 Sidecar 配置"
            checked={formConfig.sidecar_configuration_override}
            onChange={onUpdate('sidecar_configuration_override')}
            help="覆盖所有 Sidecar 的配置文件设置"
          />
        </BootstrapModalForm>
      )}
    </div>
  );
};

export default SidecarConfig;
