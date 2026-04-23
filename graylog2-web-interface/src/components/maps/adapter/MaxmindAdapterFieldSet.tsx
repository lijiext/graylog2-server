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

import AppConfig from 'util/AppConfig';
import ObjectUtils from 'util/ObjectUtils';
import { Input } from 'components/bootstrap';
import { Select, TimeUnitInput } from 'components/common';

export type Config = {
  path: string,
  database_type: string,
  check_interval: number,
  check_interval_unit: string,
};
type MaxmindAdapterFieldSetProps = {
  config: Config;
  updateConfig: (newConfig: object) => void,
  handleFormEvent: (e: { target: { name: string; value?: string } }) => void;
  validationState: (key: string) => string | undefined,
  validationMessage: (key: string, message: string) => string | undefined,
};

const MaxmindAdapterFieldSet = ({ config, updateConfig, handleFormEvent, validationState, validationMessage }: MaxmindAdapterFieldSetProps) => {
  const isCloud = AppConfig.isCloud();

  const pathsForCloud = {
    IPINFO_STANDARD_LOCATION: '/etc/graylog/server/standard_location.mmdb',
    IPINFO_ASN: '/etc/graylog/server/asn.mmdb',
  };

  const ipInfoDatabaseTypes = [
    { label: 'IPinfo 位置数据库', value: 'IPINFO_STANDARD_LOCATION' },
    { label: 'IPinfo ASN 数据库', value: 'IPINFO_ASN' },
  ];

  let databaseTypes = [
    { label: 'ASN 数据库', value: 'MAXMIND_ASN' },
    { label: '城市数据库', value: 'MAXMIND_CITY' },
    { label: '国家数据库', value: 'MAXMIND_COUNTRY' },
  ];

  if (isCloud) {
    databaseTypes = ipInfoDatabaseTypes;
  } else {
    databaseTypes = databaseTypes.concat(ipInfoDatabaseTypes);
  }

  const update = (value: number, unit: string, enabled: boolean, name: string) => {
    const newConfig = ObjectUtils.clone(config);

    newConfig[name] = enabled ? value : 0;
    newConfig[`${name}_unit`] = unit;
    updateConfig(newConfig);
  };

  const updateCheckInterval = (value: number, unit: string, enabled: boolean) => {
    update(value, unit, enabled, 'check_interval');
  };

  const onDbTypeSelect = (id: string) => {
    const newConfig = ObjectUtils.clone(config);

    if (isCloud) {
      newConfig.path = pathsForCloud[id];
    }

    newConfig.database_type = id;
    updateConfig(newConfig);
  };

  return (
    <fieldset>
      {!isCloud && (
      <Input type="text"
             id="path"
             name="path"
             label="文件路径"
             autoFocus
             required
             onChange={handleFormEvent}
             help={validationMessage('path', 'The path to the database file.')}
             bsStyle={validationState('path')}
             value={config.path}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      )}
      <Input id="database-type-select"
             label="数据库类型"
             required
             autoFocus
             help="选择数据库文件的类型"
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9">
        <Select placeholder="选择数据库文件类型"
                clearable={false}
                options={databaseTypes}
                matchProp="label"
                onChange={onDbTypeSelect}
                value={config.database_type} />
      </Input>
      <TimeUnitInput label="刷新文件"
                     help="如果启用，将检查数据库文件是否被修改，并在磁盘上发生变化时刷新。"
                     update={updateCheckInterval}
                     value={config.check_interval}
                     unit={config.check_interval_unit || 'MINUTES'}
                     defaultEnabled={config.check_interval > 0}
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" />
    </fieldset>
  );
};

MaxmindAdapterFieldSet.propTypes = {
  config: PropTypes.object.isRequired,
  updateConfig: PropTypes.func.isRequired,
  handleFormEvent: PropTypes.func.isRequired,
  validationState: PropTypes.func.isRequired,
  validationMessage: PropTypes.func.isRequired,
};

export default MaxmindAdapterFieldSet;
