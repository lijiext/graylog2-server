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

import ObjectUtils from 'util/ObjectUtils';
import { Input } from 'components/bootstrap';
import { Select, TimeUnitInput } from 'components/common';

class DnsAdapterFieldSet extends React.Component {
  static propTypes = {
    config: PropTypes.shape({
      request_timeout: PropTypes.number.isRequired,
      server_ips: PropTypes.string,
    }).isRequired,
    updateConfig: PropTypes.func.isRequired,
    handleFormEvent: PropTypes.func.isRequired,
    validationMessage: PropTypes.func.isRequired,
    validationState: PropTypes.func.isRequired,
  };

  _onLookupTypeSelect = (id) => {
    const { config, updateConfig } = this.props;
    const newConfig = ObjectUtils.clone(config);

    newConfig.lookup_type = id;
    updateConfig(newConfig);
  };

  updateCacheTTLOverride = (value, unit, enabled) => {
    this._updateCacheTTLOverride(value, unit, enabled, 'cache_ttl_override');
  };

  _updateCacheTTLOverride = (value, unit, enabled, fieldPrefix) => {
    const { config, updateConfig } = this.props;
    const newConfig = ObjectUtils.clone(config);

    // If Cache TTL Override box is checked, then save the value. If not, then do not save it.
    if (enabled && value) {
      newConfig[fieldPrefix] = enabled && value ? value : null;
      newConfig[`${fieldPrefix}_enabled`] = enabled;
    } else {
      newConfig[fieldPrefix] = null;
      newConfig[`${fieldPrefix}_enabled`] = false;
    }

    newConfig[`${fieldPrefix}_unit`] = enabled ? unit : null;
    updateConfig(newConfig);
  };

  render() {
    const {
      config,
      handleFormEvent,
      validationMessage,
      validationState,
    } = this.props;
    const lookupTypes = [
      { label: '将主机名解析为 IPv4 地址 (A)', value: 'A' },
      { label: '将主机名解析为 IPv6 地址 (AAAA)', value: 'AAAA' },
      { label: '将主机名解析为 IPv4 和 IPv6 地址（A 和 AAAA）', value: 'A_AAAA' },
      { label: '反向查找 (PTR)', value: 'PTR' },
      { label: '文本查找 (TXT)', value: 'TXT' },
    ];

    return (
      <fieldset>
        <Input label="DNS 查找类型"
               id="lookup-type"
               required
               autoFocus
               help="选择要执行的 DNS 查找类型。"
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9">
          <Select placeholder="选择 DNS 查找类型"
                  clearable={false}
                  options={lookupTypes}
                  matchProp="label"
                  onChange={this._onLookupTypeSelect}
                  value={config.lookup_type} />
        </Input>
        <Input type="text"
               id="server_ips"
               name="server_ips"
               label="DNS 服务器 IP 地址"
               onChange={handleFormEvent}
               help={validationMessage(
                 'server_ips',
                 'An optional comma-separated list of DNS server IP addresses.',
               )}
               bsStyle={validationState('server_ips')}
               value={config.server_ips}
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9" />
        <Input type="number"
               id="request_timeout"
               name="request_timeout"
               label="DNS 请求超时"
               required
               onChange={handleFormEvent}
               help={validationMessage(
                 'request_timeout',
                 'DNS request timeout in milliseconds.',
               )}
               bsStyle={validationState('request_timeout')}
               value={config.request_timeout}
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9" />
        <TimeUnitInput label="缓存TTL覆盖"
                       help="如果启用，缓存TTL将被指定的值覆盖。"
                       update={this.updateCacheTTLOverride}
                       value={config.cache_ttl_override}
                       unit={config.cache_ttl_override_unit || 'MINUTES'}
                       units={['MILLISECONDS', 'SECONDS', 'MINUTES', 'HOURS', 'DAYS']}
                       enabled={config.cache_ttl_override_enabled}
                       labelClassName="col-sm-3"
                       wrapperClassName="col-sm-9" />
      </fieldset>
    );
  }
}

export default DnsAdapterFieldSet;
