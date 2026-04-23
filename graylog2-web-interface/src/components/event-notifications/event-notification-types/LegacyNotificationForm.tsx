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
import React from 'react';

import { Alert, ControlLabel, FormGroup, HelpBlock } from 'components/bootstrap';
import { Select } from 'components/common';
import { ConfigurationFormField } from 'components/configurationforms';

import commonStyles from './LegacyNotificationCommonStyles.css';

const formatLegacyTypes = (legacyTypes) =>
  Object.keys(legacyTypes).map((typeName) => ({ label: `Legacy ${legacyTypes[typeName].name}`, value: typeName }));

type LegacyNotificationFormProps = {
  config: any;
  validation: any;
  onChange: (...args: any[]) => void;
  legacyTypes: any;
};

class LegacyNotificationForm extends React.Component<
  LegacyNotificationFormProps,
  {
    [key: string]: any;
  }
> {
  static defaultConfig = {
    callback_type: '',
    configuration: {},
  };

  propagateMultiChange = (newValues) => {
    const { config, onChange } = this.props;
    const nextConfig = { ...config, ...newValues };

    onChange(nextConfig);
  };

  propagateChange = (key, value) => {
    const { config } = this.props;
    const nextConfiguration = { ...config.configuration, [key]: value };

    this.propagateMultiChange({ configuration: nextConfiguration });
  };

  getDefaultConfiguration = (legacyNotificationType) => {
    const { legacyTypes } = this.props;
    const { configuration } = legacyTypes[legacyNotificationType];
    const defaultConfiguration = {};

    Object.keys(configuration).forEach((configKey) => {
      defaultConfiguration[configKey] = configuration[configKey].default_value;
    });

    return defaultConfiguration;
  };

  handleSelectNotificationChange = (nextLegacyNotificationType) => {
    this.propagateMultiChange({
      callback_type: nextLegacyNotificationType,
      configuration: this.getDefaultConfiguration(nextLegacyNotificationType),
    });
  };

  handleFormFieldChange = (key, value) => {
    this.propagateChange(key, value);
  };

  renderNotificationForm(config, legacyType) {
    const { configuration } = legacyType;

    const configFields = Object.keys(configuration).map((configKey) => {
      const configField = configuration[configKey];
      const configValue = config.configuration[configKey];

      return (
        <ConfigurationFormField
          key={configKey}
          typeName={config.callback_type}
          configField={configField}
          configKey={configKey}
          configValue={configValue}
          onChange={this.handleFormFieldChange}
        />
      );
    });

    return <fieldset>{configFields}</fieldset>;
  }

  render() {
    const { config, legacyTypes, validation } = this.props;
    const callbackType = config.callback_type;
    const typeData = legacyTypes[callbackType];

    let content;

    if (typeData) {
      content = this.renderNotificationForm(config, typeData);
    } else if (callbackType) {
      content = (
        <Alert bsStyle="danger" className={commonStyles.legacyNotificationAlert}>
          未知的旧版告警回调类型: <strong>{callbackType}</strong> 请确保已安装该插件。
        </Alert>
      );
    }

    return (
      <>
        <fieldset>
          <FormGroup
            controlId="notification-legacy-select"
            validationState={validation.errors.callback_type ? 'error' : null}>
            <ControlLabel>选择传统通知</ControlLabel>
            <Select
              id="notification-legacy-select"
              placeholder="选择传统通知"
              onChange={this.handleSelectNotificationChange}
              options={formatLegacyTypes(legacyTypes)}
              value={callbackType}
            />
            <HelpBlock>
              {validation?.errors?.callback_type?.[0] ??
                'Select a Legacy Notification to use on this Event Definition.'}
            </HelpBlock>
          </FormGroup>
        </fieldset>

        <Alert bsStyle="danger" className={commonStyles.legacyNotificationAlert}>
          传统告警回调已弃用，将在下一个主要版本中移除。请尽快切换到新的通知类型！
        </Alert>

        {content}
      </>
    );
  }
}

export default LegacyNotificationForm;
