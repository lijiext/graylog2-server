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
import { BootstrapModalForm, Button, Input } from 'components/bootstrap';
import { IfPermitted } from 'components/common';
import Spinner from 'components/common/Spinner';
import 'moment-duration-format';
import { DocumentationLink } from 'components/support';
import DocsHelper from 'util/DocsHelper';
import BetaBadge from 'components/common/BetaBadge';

type McpConfigState = {
  enable_remote_access: boolean;
  enable_output_schema: boolean;
};

const McpConfig = () => {
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [modalConfig, setModalConfig] = useState<McpConfigState | undefined>(undefined);
  const [viewConfig, setViewConfig] = useState<McpConfigState | undefined>(undefined);
  const configuration = useStore(ConfigurationsStore as Store<Record<string, any>>, (state) => state?.configuration);

  useEffect(() => {
    ConfigurationsActions.list(ConfigurationType.MCP_CONFIG).then(() => {
      const config = getConfig(ConfigurationType.MCP_CONFIG, configuration);
      setViewConfig(config);
      setModalConfig(config);
    });
  }, [configuration]);

  const openModal = () => {
    setShowConfigModal(true);
  };

  const onModalClickEnableRemoteAccess = () => {
    setModalConfig({ ...modalConfig, enable_remote_access: !modalConfig.enable_remote_access });
  };

  const onModalClickEnableOutputSchema = () => {
    setModalConfig({ ...modalConfig, enable_output_schema: !modalConfig.enable_output_schema });
  };

  const onModalCancel = () => {
    setShowConfigModal(false);
    setModalConfig(viewConfig);
  };

  const onModalSave = () => {
    ConfigurationsActions.update(ConfigurationType.MCP_CONFIG, { ...modalConfig }).then(() => {
      setShowConfigModal(false);
    });
  };

  if (!viewConfig) {
    return <Spinner />;
  }

  return (
    <div>
      <h2>
        MCP 服务器配置 <BetaBadge />
      </h2>
      <br />
      <p>激活 MCP（模型上下文协议）以启用与集群的基于 LLM 的通信和自动化。</p>
      <p>
        查看{' '}
        <DocumentationLink text="MCP connection documentation" page={DocsHelper.PAGES.MCP_SERVER} displayIcon={false} />{' '}
        用于客户端设置说明。
      </p>
      <hr />
      <dl className="deflist">
        <dt>远程 MCP 访问</dt>
        <dd>{viewConfig.enable_remote_access ? 'Enabled' : 'Disabled'}</dd>
        <br />
        <dt>输出模式</dt>
        <dd>{viewConfig.enable_output_schema ? 'Enabled' : 'Disabled'}</dd>
      </dl>

      <IfPermitted permissions="clusterconfigentry:edit">
        <Button bsStyle="info" bsSize="xs" onClick={openModal}>
          编辑配置
        </Button>
      </IfPermitted>

      {showConfigModal && modalConfig && (
        <BootstrapModalForm
          show
          bsSize="large"
          title="更新 MCP 服务器配置"
          onSubmitForm={onModalSave}
          onCancel={onModalCancel}
          submitButtonText="更新配置">
          <fieldset>
            <Input
              id="enable-remote-access-checkbox"
              type="checkbox"
              label="启用远程 MCP 访问"
              name="enabled"
              checked={modalConfig.enable_remote_access}
              onChange={onModalClickEnableRemoteAccess}
            />
            <Input
              id="enable-output-schema-checkbox"
              disabled={!modalConfig.enable_remote_access}
              type="checkbox"
              label="启用输出架构生成"
              name="output-schema-enabled"
              checked={modalConfig.enable_output_schema}
              onChange={onModalClickEnableOutputSchema}
            />
          </fieldset>
        </BootstrapModalForm>
      )}
    </div>
  );
};

export default McpConfig;
