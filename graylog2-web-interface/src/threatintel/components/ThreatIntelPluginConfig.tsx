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
import { useState } from 'react';

import { Button, BootstrapModalForm, Input } from 'components/bootstrap';
import { IfPermitted } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import type { SystemConfigurationComponentProps } from 'views/types';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';

type Config = {
  tor_enabled: boolean;
  spamhaus_enabled: boolean;
};
type Props = SystemConfigurationComponentProps<Config>;

const defaultConfig = {
  tor_enabled: false,
  spamhaus_enabled: false,
};

const ThreatIntelPluginConfig = ({ config: initialConfig = defaultConfig, updateConfig }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [config, setConfig] = useState<Config>(ObjectUtils.clone(initialConfig));
  const sendTelemetry = useSendTelemetry();

  const _updateConfigField = (field: string, value: boolean) => {
    const newConfig = {
      ...config,
      [field]: value,
    };
    setConfig(newConfig);
  };

  const _onCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    _updateConfigField(e.target.name, e.target.checked);
  };

  const _openModal = () => {
    setShowModal(true);
  };

  const _closeModal = () => {
    setShowModal(false);
  };

  const _resetConfig = () => {
    // Reset to initial state when the modal is closed without saving.
    setConfig(initialConfig);
    _closeModal();
  };

  const _saveConfig = () => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.CONFIGURATIONS.THREATINTEL_CONFIGURATION_UPDATED, {
      app_pathname: 'configurations',
      app_section: 'threat-intel',
    });

    updateConfig(config).then(() => {
      _closeModal();
    });
  };

  return (
    <div>
      <h3>威胁情报查找配置</h3>

      <p>威胁情报查找插件的配置。</p>

      <dl className="deflist">
        <dt>Tor 出口节点:</dt>
        <dd>{config.tor_enabled === true ? 'Enabled' : 'Disabled'}</dd>

        <dt>Spamhaus:</dt>
        <dd>{config.spamhaus_enabled === true ? 'Enabled' : 'Disabled'}</dd>
      </dl>

      <IfPermitted permissions="clusterconfigentry:edit">
        <Button bsStyle="info" bsSize="xs" onClick={_openModal}>
          编辑配置
        </Button>
      </IfPermitted>

      <BootstrapModalForm
        show={showModal}
        title="更新威胁情报插件配置"
        onSubmitForm={_saveConfig}
        onCancel={_resetConfig}
        submitButtonText="更新配置">
        <fieldset>
          <Input
            type="checkbox"
            id="tor-checkbox"
            label="允许 Tor 出口节点查找？"
            help="启用以在全局管道函数中包含 Tor 出口节点查找，禁用也会停止刷新数据。"
            name="tor_enabled"
            checked={config.tor_enabled}
            onChange={_onCheckboxClick}
          />

          <Input
            type="checkbox"
            id="spamhaus-checkbox"
            label="是否允许 Spamhaus DROP/EDROP 查找？"
            help="启用以在全局管道函数中包含 Spamhaus 查找，禁用也会停止刷新数据。"
            name="spamhaus_enabled"
            checked={config.spamhaus_enabled}
            onChange={_onCheckboxClick}
          />
        </fieldset>
      </BootstrapModalForm>
    </div>
  );
};

export default ThreatIntelPluginConfig;
