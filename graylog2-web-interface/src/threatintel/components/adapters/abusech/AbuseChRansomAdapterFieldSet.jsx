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

class AbuseChRansomAdapterFieldSet extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    handleFormEvent: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    validationState: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    validationMessage: PropTypes.func.isRequired,
  };

  _update = (value, unit, enabled, name) => {
    const config = ObjectUtils.clone(this.props.config);
    config[name] = enabled ? value : 0;
    config[`${name}_unit`] = unit;
    this.props.updateConfig(config);
  };

  updateRefreshInterval = (value, unit, enabled) => {
    this._update(value, unit, enabled, 'refresh_interval');
  };

  _onBlocklistTypeSelect = (id) => {
    const config = ObjectUtils.clone(this.props.config);
    config.blocklist_type = id;
    this.props.updateConfig(config);
  };

  render() {
    const { config } = this.props;
    const blocklistTypes = [
      { label: '域名黑名单', value: 'DOMAINS' },
      { label: 'URL 黑名单', value: 'URLS' },
      { label: 'IP 黑名单', value: 'IPS' },
    ];

    return (
      <fieldset>
        <Input label="黑名单类型"
               id="blocklist-type-selector"
               required
               autoFocus
               help="选择 abuse.ch 勒索软件黑名单的类型"
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9">
          <Select placeholder="选择黑名单类型"
                  clearable={false}
                  options={blocklistTypes}
                  matchProp="label"
                  onChange={this._onBlocklistTypeSelect}
                  value={config.blocklist_type} />
        </Input>
        <TimeUnitInput label="刷新黑名单"
                       help="如果启用，abuse.ch 勒索软件黑名单将在其更新时刷新。"
                       update={this.updateRefreshInterval}
                       value={config.refresh_interval}
                       unit={config.refresh_interval_unit || 'MINUTES'}
                       defaultEnabled={config.refresh_interval > 0}
                       labelClassName="col-sm-3"
                       wrapperClassName="col-sm-9" />
      </fieldset>
    );
  }
}

export default AbuseChRansomAdapterFieldSet;
