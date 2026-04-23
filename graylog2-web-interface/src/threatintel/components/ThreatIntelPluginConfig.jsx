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
import PropTypes from 'prop-types';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import createReactClass from 'create-react-class';

import { Button, BootstrapModalForm, Input } from 'components/bootstrap';
import { IfPermitted } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';
import withTelemetry from 'logic/telemetry/withTelemetry';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

const ThreatIntelPluginConfig = createReactClass({
  // eslint-disable-next-line react/no-unused-class-component-methods
  displayName: 'ThreatIntelPluginConfig',

  // eslint-disable-next-line react/no-unused-class-component-methods
  propTypes: {
    config: PropTypes.object,
    updateConfig: PropTypes.func.isRequired,
    sendTelemetry: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      config: {
        tor_enabled: false,
        spamhaus_enabled: false,
        abusech_ransom_enabled: false,
      },
    };
  },

  getInitialState() {
    const { config } = this.props;

    return {
      config: ObjectUtils.clone(config),
      threatintelConfigModal: false,
    };
  },

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState({ config: ObjectUtils.clone(newProps.config) });
  },

  _updateConfigField(field, value) {
    const { config } = this.state;
    const update = ObjectUtils.clone(config);
    update[field] = value;
    this.setState({ config: update });
  },

  _onCheckboxClick(field, ref) {
    return () => {
      this._updateConfigField(field, this[ref].getChecked());
    };
  },

  // eslint-disable-next-line react/no-unused-class-component-methods
  _onSelect(field) {
    return (selection) => {
      this._updateConfigField(field, selection);
    };
  },

  // eslint-disable-next-line react/no-unused-class-component-methods
  _onUpdate(field) {
    return (e) => {
      this._updateConfigField(field, e.target.value);
    };
  },

  _openModal() {
    this.setState({ threatintelConfigModal: true });
  },

  _closeModal() {
    this.setState({ threatintelConfigModal: false });
  },

  _resetConfig() {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.getInitialState());
  },

  _saveConfig() {
    const { updateConfig, sendTelemetry } = this.props;

    sendTelemetry(TELEMETRY_EVENT_TYPE.CONFIGURATIONS.THREATINTEL_CONFIGURATION_UPDATED, {
      app_pathname: 'configurations',
      app_section: 'threat-intel',
    });

    updateConfig(this.state.config).then(() => {
      this._closeModal();
    });
  },

  render() {
    return (
      <div>
        <h3>威胁情报查找配置</h3>

        <p>
          威胁情报查找插件的配置。
        </p>

        <dl className="deflist">
          <dt>Tor 出口节点:</dt>
          <dd>{this.state.config.tor_enabled === true ? '已启用' : '已禁用'}</dd>

          <dt>Spamhaus:</dt>
          <dd>{this.state.config.spamhaus_enabled === true ? '已启用' : '已禁用'}</dd>
        </dl>

        <IfPermitted permissions="clusterconfigentry:edit">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>编辑配置</Button>
        </IfPermitted>

        <BootstrapModalForm show={this.state.threatintelConfigModal}
                            title="更新威胁情报插件配置"
                            onSubmitForm={this._saveConfig}
                            onCancel={this._resetConfig}
                            submitButtonText="更新配置">
          <fieldset>
            <Input type="checkbox"
                   id="tor-checkbox"
                   ref={(elem) => {
                     // eslint-disable-next-line react/no-unused-class-component-methods
                     this.torEnabled = elem;
                   }}
                   label="是否允许 Tor 出口节点查找？"
                   help="启用后将在全局管道函数中包含 Tor 出口节点查找，禁用也会停止刷新数据。"
                   name="tor_enabled"
                   checked={this.state.config.tor_enabled}
                   onChange={this._onCheckboxClick('tor_enabled', 'torEnabled')} />

            <Input type="checkbox"
                   id="spamhaus-checkbox"
                   ref={(elem) => {
                     // eslint-disable-next-line react/no-unused-class-component-methods
                     this.spamhausEnabled = elem;
                   }}
                   label="是否允许 Spamhaus DROP/EDROP 查找？"
                   help="启用以在全局管道函数中包含 Spamhaus 查找，禁用也会停止刷新数据。"
                   name="tor_enabled"
                   checked={this.state.config.spamhaus_enabled}
                   onChange={this._onCheckboxClick('spamhaus_enabled', 'spamhausEnabled')} />
          </fieldset>
        </BootstrapModalForm>
      </div>
    );
  },
});

export default withTelemetry(ThreatIntelPluginConfig);
