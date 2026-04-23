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
import type { SyntheticEvent } from 'react';
import React from 'react';

import { Input } from 'components/bootstrap';
import type { LookupTableDataAdapterConfig } from 'logic/lookup-tables/types';

type Props = {
  config: LookupTableDataAdapterConfig,
  handleFormEvent: (event: SyntheticEvent<EventTarget>) => void,
  validationState: (state: string) => string,
  validationMessage: (field: string, message: string) => string,
};

const CSVFileAdapterFieldSet = ({ config, handleFormEvent, validationState, validationMessage }: Props) => (
  <fieldset>
    <Input type="text"
           id="path"
           name="path"
           label="文件路径"
           autoFocus
           required
           onChange={handleFormEvent}
           help={validationMessage('path', 'The path to the CSV file.')}
           bsStyle={validationState('path')}
           value={config.path}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="number"
           id="check_interval"
           name="check_interval"
           label="检查间隔"
           required
           onChange={handleFormEvent}
           help="检查 CSV 文件是否需要重新加载的间隔（秒）。"
           value={config.check_interval}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="separator"
           name="separator"
           label="分隔符"
           required
           onChange={handleFormEvent}
           help="用于分隔条目的分隔符。"
           value={config.separator}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="quotechar"
           name="quotechar"
           label="引号字符"
           required
           onChange={handleFormEvent}
           help="用于引用元素的字符。"
           value={config.quotechar}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="key_column"
           name="key_column"
           label="密钥列"
           required
           onChange={handleFormEvent}
           help="应用作键查找的列名。"
           value={config.key_column}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="value_column"
           name="value_column"
           label="值列"
           required
           onChange={handleFormEvent}
           help="应用作键值的列名。"
           value={config.value_column}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="checkbox"
           id="case_insensitive_lookup"
           name="case_insensitive_lookup"
           label="允许不区分大小写的查找"
           checked={config.case_insensitive_lookup}
           onChange={handleFormEvent}
           help="如果查找表的键查找应不区分大小写，请启用。"
           wrapperClassName="col-md-offset-3 col-md-9" />
    <Input type="checkbox"
           id="cidr_lookup"
           name="cidr_lookup"
           label="CIDR 查找"
           checked={config.cidr_lookup}
           onChange={handleFormEvent}
           help="如果查找表中的键采用 CIDR 表示法且将通过 IP 进行查找，请启用。"
           wrapperClassName="col-md-offset-3 col-md-9" />
  </fieldset>
);

export default CSVFileAdapterFieldSet;
