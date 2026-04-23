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
import React, { useState } from 'react';
import omit from 'lodash/omit';

import URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import { BootstrapModalForm, Button, Input } from 'components/bootstrap';
import { IfPermitted } from 'components/common';
import { ConfigurationsActions } from 'stores/configurations/ConfigurationsStore';
import { getValueFromInput } from 'util/FormsUtils';
import useProductName from 'brand-customization/useProductName';

import { PLUGIN_API_ENDPOINT, PLUGIN_CONFIG_CLASS_NAME } from '../Constants';
import UserNotification from '../../util/UserNotification';

type Props = {
  config?: {
    lookups_enabled: boolean;
    lookup_regions: string;
    access_key: string;
    secret_key: string;
    proxy_enabled: boolean;
    secret_key_salt?: string;
  };
};

const _initialState = (config) => omit(config, ['secret_key', 'secret_key_salt']);

const postConfigUpdate = (update) => {
  const url = URLUtils.qualifyUrl(PLUGIN_API_ENDPOINT);

  return fetch('PUT', url, update);
};
const AWSPluginConfiguration = ({
  config = {
    lookups_enabled: false,
    lookup_regions: 'us-east-1,us-west-1,us-west-2,eu-west-1,eu-central-1',
    access_key: '',
    secret_key: '',
    proxy_enabled: false,
  },
}: Props) => {
  const productName = useProductName();
  const [updateConfig, setUpdateConfig] = useState(_initialState(config));
  const [showAwsConfigModal, setShowAwsConfigModal] = useState(false);

  const updateConfigField = (field, value) => {
    setUpdateConfig({ ...updateConfig, [field]: value });
  };

  const onFocusSecretKey = () => {
    setUpdateConfig({ ...updateConfig, secret_key: '' });
  };

  const onUpdate = (field) => (value) => {
    if (typeof value === 'object') {
      updateConfigField(field, getValueFromInput(value.target));
    } else {
      updateConfigField(field, value);
    }
  };

  const openModal = () => {
    setShowAwsConfigModal(true);
  };

  const closeModal = () => {
    setShowAwsConfigModal(false);
  };

  const resetConfig = () => {
    setUpdateConfig(_initialState(config));
    closeModal();
  };

  const saveConfig = () => {
    postConfigUpdate(updateConfig).then(
      () => {
        ConfigurationsActions.list(PLUGIN_CONFIG_CLASS_NAME);
        closeModal();
      },
      (error) => {
        UserNotification.error(
          `AWS 插件配置失败，状态为：${error}`,
          '无法保存 AWS 插件配置。',
        );
      },
    );
  };

  return (
    <div>
      <h3>AWS 插件配置</h3>

      <p>
        AWS 模块提供的所有插件的基础配置。注意，某些参数将以未加密形式存储在 MongoDB 中。具有所需权限的用户可以在本页的配置对话框中读取这些参数。
      </p>

      <dl className="deflist">
        <dt>实例详情查找:</dt>
        <dd>{config.lookups_enabled === true ? 'Enabled' : 'Disabled'}</dd>

        <dt>Connect through proxy:</dt>
        <dd>{config.proxy_enabled === true ? 'Enabled' : 'Disabled'}</dd>

        <dt>查找区域:</dt>
        <dd>{config.lookup_regions ? config.lookup_regions : '[not set]'}</dd>

        <dt>Access Key:</dt>
        <dd>{config.access_key ? config.access_key : '[not set]'}</dd>

        <dt>Secret Key:</dt>
        <dd>{config.secret_key ? '***********' : '[not set]'}</dd>
      </dl>

      <IfPermitted permissions="clusterconfigentry:edit">
        <Button bsStyle="info" bsSize="xs" onClick={openModal}>
          编辑配置
        </Button>
      </IfPermitted>

      <BootstrapModalForm
        show={showAwsConfigModal}
        title="更新 AWS 插件配置"
        onSubmitForm={saveConfig}
        onCancel={resetConfig}
        submitButtonText="更新配置">
        <fieldset>
          <Input
            id="aws-lookups-enabled"
            type="checkbox"
            label="是否对 IP 地址运行 AWS 实例详细信息查找？"
            help={
              <span>
                启用后，消息处理器将尝试识别您的 AWS 实体（如 EC2、ELB、RDS 等）的 IP 地址，并添加有关其背后服务或实例的附加信息。此更改生效可能需要长达一分钟。
              </span>
            }
            name="lookups_enabled"
            checked={updateConfig.lookups_enabled}
            onChange={onUpdate('lookups_enabled')}
          />

          <Input
            id="aws-access-key"
            type="text"
            label="AWS 访问密钥"
            help={
              <span>
                请注意，此内容仅用于加密连接，但将以明文形式存储。请参阅文档以获取分配给底层 IAM 用户的建议权限。
              </span>
            }
            name="access_key"
            value={updateConfig.access_key}
            onChange={onUpdate('access_key')}
          />

          <Input
            id="aws-secret-key"
            type="password"
            label="AWS 密钥"
            help={
              <span>
                请注意，此内容仅用于加密连接，并将使用系统密钥进行加密存储。请参阅文档以获取分配给底层 IAM 用户的建议权限。
              </span>
            }
            name="secret_key"
            value={updateConfig.secret_key !== undefined ? updateConfig.secret_key : config.secret_key}
            onFocus={onFocusSecretKey}
            onChange={onUpdate('secret_key')}
          />

          <Input
            id="aws-lookup-regions"
            type="text"
            label="查找区域"
            help={
              <span>
                AWS 实例查找消息处理器会维护一个实例表以进行快速地址转换。定义要包含在表中的 AWS 区域。这应包含您运行 AWS 服务的所有区域。请记住，您的 IAM 用户需要这些区域的权限，否则您将看到警告 {productName} 服务器日志。
              </span>
            }
            name="lookup_regions"
            value={updateConfig.lookup_regions}
            onChange={onUpdate('lookup_regions')}
          />

          <Input
            id="aws-proxy-enabled"
            type="checkbox"
            label="使用 HTTP 代理？"
            help={
              <span>
                启用后，我们将通过配置的 HTTP 代理访问 AWS API (
                <code>http_proxy_uri</code>) in your {productName} 配置文件。
                <br />
                <em>重要：</em> 您必须重启所有 AWS 输入端，此配置才会生效。
              </span>
            }
            name="proxy_enabled"
            checked={updateConfig.proxy_enabled}
            onChange={onUpdate('proxy_enabled')}
          />
        </fieldset>
      </BootstrapModalForm>
    </div>
  );
};

export default AWSPluginConfiguration;
