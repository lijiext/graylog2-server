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
import { Button, Table } from 'components/bootstrap';
import { IfPermitted } from 'components/common';
import Spinner from 'components/common/Spinner';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import UrlWhiteListForm from 'components/configurations/UrlWhiteListForm';
import type { WhiteListConfig } from 'stores/configurations/ConfigurationsStore';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { getPathnameWithoutId } from 'util/URLUtils';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

const UrlWhiteListConfig = () => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const configuration = useStore(ConfigurationsStore as Store<Record<string, any>>, (state) => state?.configuration);
  const [viewConfig, setViewConfig] = useState<WhiteListConfig | undefined>(undefined);
  const [formConfig, setFormConfig] = useState<WhiteListConfig | undefined>(undefined);
  const [isValid, setIsValid] = useState(false);

  const sendTelemetry = useSendTelemetry();
  const { pathname } = useLocation();

  useEffect(() => {
    ConfigurationsActions.list(ConfigurationType.URL_WHITELIST_CONFIG).then(() => {
      const config = getConfig(ConfigurationType.URL_WHITELIST_CONFIG, configuration);

      setViewConfig(config);
      setFormConfig(config);
    });
  }, [configuration]);

  const summary = (): React.ReactElement<'tr'>[] => {
    const literal = 'literal';
    const { entries } = viewConfig;

    return entries.map((urlConfig, idx) => (
      <tr key={urlConfig.id}>
        <td>{idx + 1}</td>
        <td>{urlConfig.title}</td>
        <td>{urlConfig.value}</td>
        <td>{urlConfig.type === literal ? '精确匹配' : 'Regex'}</td>
      </tr>
    ));
  };

  const openModal = () => {
    setShowConfigModal(true);
  };

  const closeModal = () => {
    setShowConfigModal(false);
    setFormConfig(viewConfig);
  };

  const saveConfig = () => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.CONFIGURATIONS.URL_WHITE_LIST_UPDATED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_section: 'urlwhitelist',
      app_action_value: 'configuration-save',
    });

    ConfigurationsActions.updateWhitelist(ConfigurationType.URL_WHITELIST_CONFIG, formConfig).then(() => {
      closeModal();
    });
  };

  const update = (newConfig: WhiteListConfig, newIsValid: boolean) => {
    setFormConfig(newConfig);
    setIsValid(newIsValid);
  };

  if (!viewConfig || !formConfig) {
    return <Spinner />;
  }

  const { entries, disabled } = formConfig;

  return (
    <div>
      <h2>URL 白名单配置 {disabled ? <small>(已禁用)</small> : <small>(已启用)</small>}</h2>
      <p>
        启用后，来自 Graylog 服务器的出站 HTTP 请求（如事件通知或基于 HTTP 的数据适配器请求）将根据此处配置的白名单进行验证。由于 HTTP 请求由 Graylog 服务器发出，它们可能能够访问外部用户无法访问的更敏感系统，包括可能包含密钥和其他机密的 AWS EC2 元数据、Elasticsearch 等。白名单管理访问与数据适配器和事件通知配置是分开的。
      </p>
      <Table striped bordered condensed className="top-margin">
        <thead>
          <tr>
            <th>#</th>
            <th>标题</th>
            <th>URL</th>
            <th>类型</th>
          </tr>
        </thead>
        <tbody>
          {summary()}
        </tbody>
      </Table>
      <IfPermitted permissions="urlwhitelist:write">
        <Button bsStyle="info" bsSize="xs" onClick={openModal}>编辑配置</Button>
      </IfPermitted>
      {showConfigModal && (
        <BootstrapModalForm show
                            bsSize="lg"
                            title="更新白名单配置"
                            onSubmitForm={saveConfig}
                            onCancel={closeModal}
                            submitButtonDisabled={!isValid}
                            submitButtonText="更新配置">
          <h3>白名单 URL</h3>
          <UrlWhiteListForm urls={entries} disabled={disabled} onUpdate={update} />
        </BootstrapModalForm>
      )}
    </div>
  );
};

export default UrlWhiteListConfig;
