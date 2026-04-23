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
import PropTypes from 'prop-types';
import lodash from 'lodash';

import { Input } from 'components/bootstrap';
import { Select } from 'components/common';

const OTX_INDICATORS = [
  { label: 'IP 自动检测', value: 'IPAutoDetect' },
  { label: 'IP v4', value: 'IPv4' },
  { label: 'IPv6', value: 'IPv6' },
  { label: '域名', value: 'domain' },
  { label: '主机名', value: 'hostname' },
  { label: 'File', value: 'file' },
  { label: 'URL', value: 'url' },
  { label: 'CVE', value: 'cve' },
  { label: 'NIDS', value: 'nids' },
  { label: '关联规则', value: 'correlation-rule' },
];

class OTXAdapterFieldSet extends React.Component {
  static propTypes = {
    config: PropTypes.shape({
      indicator: PropTypes.string.isRequired,
      api_key: PropTypes.string,
      api_url: PropTypes.string.isRequired,
      http_user_agent: PropTypes.string.isRequired,
      http_connect_timeout: PropTypes.number.isRequired,
      http_write_timeout: PropTypes.number.isRequired,
      http_read_timeout: PropTypes.number.isRequired,
    }).isRequired,
    updateConfig: PropTypes.func.isRequired,
    handleFormEvent: PropTypes.func.isRequired,
    validationState: PropTypes.func.isRequired,
    validationMessage: PropTypes.func.isRequired,
  };

  handleSelect = (fieldName) => (selectedIndicator) => {
    const config = lodash.cloneDeep(this.props.config);
    config[fieldName] = selectedIndicator;
    this.props.updateConfig(config);
  };

  render() {
    const { config } = this.props;

    return (
      <fieldset>
        <Input id="indicator"
               label="指标"
               required
               onChange={this.props.handleFormEvent}
               help={this.props.validationMessage('indicator', 'The OTX indicator type that should be used for lookups.')}
               bsStyle={this.props.validationState('indicator')}
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9">
          <Select placeholder="选择指标"
                  clearable={false}
                  options={OTX_INDICATORS}
                  matchProp="label"
                  onChange={this.handleSelect('indicator')}
                  value={config.indicator} />
        </Input>
        <Input type="text"
               id="api_key"
               name="api_key"
               label="OTX API 密钥"
               onChange={this.props.handleFormEvent}
               help={this.props.validationMessage('api_key', 'Your OTX API key.')}
               bsStyle={this.props.validationState('api_key')}
               value={config.api_key}
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9" />
        <Input type="text"
               id="api_url"
               name="api_url"
               label="OTX API URL"
               onChange={this.props.handleFormEvent}
               help={this.props.validationMessage('api_url', 'URL of the OTX API server.')}
               bsStyle={this.props.validationState('api_url')}
               value={config.api_url}
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9" />
        <Input type="text"
               id="http_user_agent"
               name="http_user_agent"
               label="HTTP User-Agent"
               required
               onChange={this.props.handleFormEvent}
               help={this.props.validationMessage('http_user_agent', 'The User-Agent header that should be used for the HTTP request.')}
               bsStyle={this.props.validationState('http_user_agent')}
               value={config.http_user_agent}
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9" />
        <Input type="number"
               id="http_connect_timeout"
               name="http_connect_timeout"
               label="HTTP 连接超时"
               required
               onChange={this.props.handleFormEvent}
               help={this.props.validationMessage('http_connect_timeout', 'HTTP connection timeout in milliseconds.')}
               bsStyle={this.props.validationState('http_connect_timeout')}
               value={config.http_connect_timeout}
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9" />
        <Input type="number"
               id="http_write_timeout"
               name="http_write_timeout"
               label="HTTP 写入超时"
               required
               onChange={this.props.handleFormEvent}
               help={this.props.validationMessage('http_write_timeout', 'HTTP write timeout in milliseconds.')}
               bsStyle={this.props.validationState('http_write_timeout')}
               value={config.http_write_timeout}
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9" />
        <Input type="number"
               id="http_read_timeout"
               name="http_read_timeout"
               label="HTTP 读取超时"
               required
               onChange={this.props.handleFormEvent}
               help={this.props.validationMessage('http_read_timeout', 'HTTP read timeout in milliseconds.')}
               bsStyle={this.props.validationState('http_read_timeout')}
               value={config.http_read_timeout}
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9" />
      </fieldset>
    );
  }
}

export default OTXAdapterFieldSet;
