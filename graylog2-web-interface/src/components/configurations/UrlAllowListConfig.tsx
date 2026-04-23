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
import UrlAllowListForm from 'components/configurations/UrlAllowListForm';
import type { AllowListConfig } from 'stores/configurations/ConfigurationsStore';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { getPathnameWithoutId } from 'util/URLUtils';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import useProductName from 'brand-customization/useProductName';

const UrlAllowListConfig = () => {
  const productName = useProductName();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const configuration = useStore(ConfigurationsStore as Store<Record<string, any>>, (state) => state?.configuration);
  const [viewConfig, setViewConfig] = useState<AllowListConfig | undefined>(undefined);
  const [formConfig, setFormConfig] = useState<AllowListConfig | undefined>(undefined);
  const [isValid, setIsValid] = useState(false);

  const sendTelemetry = useSendTelemetry();
  const { pathname } = useLocation();

  useEffect(() => {
    ConfigurationsActions.list(ConfigurationType.URL_ALLOWLIST_CONFIG).then(() => {
      const config = getConfig(ConfigurationType.URL_ALLOWLIST_CONFIG, configuration);

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
        <td>{urlConfig.type === literal ? 'Exact match' : 'Regex'}</td>
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
    sendTelemetry(TELEMETRY_EVENT_TYPE.CONFIGURATIONS.URL_ALLOW_LIST_UPDATED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_section: 'urlallowlist',
      app_action_value: 'configuration-save',
    });

    ConfigurationsActions.updateAllowlist(ConfigurationType.URL_ALLOWLIST_CONFIG, formConfig).then(() => {
      closeModal();
    });
  };

  const update = (newConfig: AllowListConfig, newIsValid: boolean) => {
    setFormConfig(newConfig);
    setIsValid(newIsValid);
  };

  if (!viewConfig || !formConfig) {
    return <Spinner />;
  }

  const { entries, disabled } = formConfig;

  return (
    <div>
      <h2>URL 允许列表配置 {disabled ? <small>(已禁用)</small> : <small>(已启用)</small>}</h2>
      <p>
        启用后，来自的出站 HTTP 请求 {productName} 服务器，例如事件通知或基于 HTTP 的数据适配器请求，将在此处配置的允许列表中进行验证。由于 HTTP 请求是由 {productName} 服务器可能能够访问外部用户无法访问的更敏感系统，包括 AWS EC2 元数据，其中可能包含密钥和其他机密信息，以及 Elasticsearch 等。允许管理访问与数据适配器和事件通知配置是分开的。
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
        <tbody>{summary()}</tbody>
      </Table>
      <IfPermitted permissions="urlallowlist:write">
        <Button bsStyle="info" bsSize="xs" onClick={openModal}>
          编辑配置
        </Button>
      </IfPermitted>
      {showConfigModal && (
        <BootstrapModalForm
          show
          bsSize="lg"
          title="更新白名单配置"
          onSubmitForm={saveConfig}
          onCancel={closeModal}
          submitButtonDisabled={!isValid}
          submitButtonText="更新配置">
          <h3>允许访问的 URL</h3>
          <UrlAllowListForm urls={entries} disabled={disabled} onUpdate={update} />
        </BootstrapModalForm>
      )}
    </div>
  );
};

export default UrlAllowListConfig;
