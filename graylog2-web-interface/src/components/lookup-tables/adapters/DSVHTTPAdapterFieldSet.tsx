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

import { Input } from 'components/bootstrap';
import { URLAllowListInput } from 'components/common';
import type { ValidationState } from 'components/common/types';

type DSVHTTPAdapterFieldSetProps = {
  config: any;
  handleFormEvent: (...args: any[]) => void;
  validationState: (type: string) => ValidationState;
  validationMessage: (type: string, message: string) => ValidationState;
};

const DSVHTTPAdapterFieldSet = ({
  handleFormEvent,
  validationState,
  validationMessage,
  config,
}: DSVHTTPAdapterFieldSetProps) => (
  <fieldset>
    <URLAllowListInput
      label="文件 URL"
      onChange={handleFormEvent}
      validationMessage={validationMessage('url', 'The URL of the DSV file.')}
      validationState={validationState('url')}
      url={config.url}
      labelClassName="col-sm-3"
      wrapperClassName="col-sm-9"
    />
    <Input
      type="number"
      id="refresh_interval"
      name="refresh_interval"
      label="刷新间隔"
      required
      onChange={handleFormEvent}
      help="检查 DSV 文件是否需要重新加载的间隔时间（秒）。"
      value={config.refresh_interval}
      labelClassName="col-sm-3"
      wrapperClassName="col-sm-9"
    />
    <Input
      type="text"
      id="separator"
      name="separator"
      label="分隔符"
      required
      onChange={handleFormEvent}
      help="用于分隔条目列的分隔符。"
      value={config.separator}
      labelClassName="col-sm-3"
      wrapperClassName="col-sm-9"
    />
    <Input
      type="text"
      id="line_separator"
      name="line_separator"
      label="行分隔符"
      required
      onChange={handleFormEvent}
      help="用于分隔行的分隔符。"
      value={config.line_separator}
      labelClassName="col-sm-3"
      wrapperClassName="col-sm-9"
    />
    <Input
      type="text"
      id="quotechar"
      name="quotechar"
      label="引号字符"
      required
      onChange={handleFormEvent}
      help="用于引用元素的字符。"
      value={config.quotechar}
      labelClassName="col-sm-3"
      wrapperClassName="col-sm-9"
    />
    <Input
      type="text"
      id="ignorechar"
      name="ignorechar"
      label="忽略字符"
      required
      onChange={handleFormEvent}
      help="忽略以这些字符开头的行。"
      value={config.ignorechar}
      labelClassName="col-sm-3"
      wrapperClassName="col-sm-9"
    />
    <Input
      type="text"
      id="key_column"
      name="key_column"
      label="键列"
      required
      onChange={handleFormEvent}
      help="应使用哪一列进行键查找。"
      value={config.key_column}
      labelClassName="col-sm-3"
      wrapperClassName="col-sm-9"
    />
    <Input
      type="text"
      id="value_column"
      name="value_column"
      label="值列"
      required
      onChange={handleFormEvent}
      help="应作为键值的列号。"
      value={config.value_column}
      labelClassName="col-sm-3"
      wrapperClassName="col-sm-9"
    />
    <Input
      type="checkbox"
      id="case_insensitive_lookup"
      name="case_insensitive_lookup"
      label="允许不区分大小写的查找"
      checked={config.case_insensitive_lookup}
      onChange={handleFormEvent}
      help="如果密钥查找应不区分大小写，请启用。"
      wrapperClassName="col-md-offset-3 col-md-9"
    />
    <Input
      type="checkbox"
      id="check_presence_only"
      name="check_presence_only"
      label="仅检查存在性"
      checked={config.check_presence_only}
      onChange={handleFormEvent}
      help="仅检查键是否存在于表中，返回布尔值而非值。"
      wrapperClassName="col-md-offset-3 col-md-9"
    />
  </fieldset>
);

export default DSVHTTPAdapterFieldSet;
