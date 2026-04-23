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
import { URLAllowListInput, KeyValueTable } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';

type Headers = { [key: string]: string };

type Config = {
  headers: Headers;
  url: string;
  single_value_jsonpath: string;
  multi_value_jsonpath: string;
  user_agent: string;
};

type Props = {
  config: Config;
  updateConfig: (config: Config) => void;
  handleFormEvent: (event: SyntheticEvent<EventTarget>) => void;
  validationState: (state: string) => 'error' | 'warning' | 'success';
  validationMessage: (field: string, message: string) => string;
};

class HTTPJSONPathAdapterFieldSet extends React.Component<Props> {
  onHTTPHeaderUpdate = (headers: Headers) => {
    const { config, updateConfig } = this.props;
    const configChange = ObjectUtils.clone(config);

    configChange.headers = headers;
    updateConfig(configChange);
  };

  render() {
    const { config, handleFormEvent, validationMessage, validationState } = this.props;

    return (
      <fieldset>
        <URLAllowListInput
          label="查找 URL"
          onChange={handleFormEvent}
          validationMessage={validationMessage(
            'url',
            'The URL for the lookup. (this is a template - see documentation)',
          )}
          validationState={validationState('url')}
          url={config.url}
          labelClassName="col-sm-3"
          wrapperClassName="col-sm-9"
          urlType="regex"
        />
        <Input
          type="text"
          id="single_value_jsonpath"
          name="single_value_jsonpath"
          label="单值 JSONPath"
          required
          onChange={handleFormEvent}
          help={validationMessage(
            'single_value_jsonpath',
            'The JSONPath string to get the single value from the response.',
          )}
          bsStyle={validationState('single_value_jsonpath')}
          value={config.single_value_jsonpath}
          labelClassName="col-sm-3"
          wrapperClassName="col-sm-9"
        />
        <Input
          type="text"
          id="multi_value_jsonpath"
          name="multi_value_jsonpath"
          label="多值 JSONPath"
          onChange={handleFormEvent}
          help={validationMessage(
            'multi_value_jsonpath',
            'The JSONPath string to get the multi value from the response. Needs to return a list or map. (optional)',
          )}
          bsStyle={validationState('multi_value_jsonpath')}
          value={config.multi_value_jsonpath}
          labelClassName="col-sm-3"
          wrapperClassName="col-sm-9"
        />
        <Input
          type="text"
          id="user_agent"
          name="user_agent"
          label="HTTP 用户代理"
          required
          onChange={handleFormEvent}
          help="用于 HTTP 请求的 User-Agent 头。"
          value={config.user_agent}
          labelClassName="col-sm-3"
          wrapperClassName="col-sm-9"
        />
        <Input
          id="http_headers"
          label="HTTP 头"
          help="用于 HTTP 请求的自定义 HTTP 头。多个值必须用逗号分隔。"
          labelClassName="col-sm-3"
          wrapperClassName="col-sm-9">
          <KeyValueTable pairs={config.headers || {}} editable onChange={this.onHTTPHeaderUpdate} />
        </Input>
      </fieldset>
    );
  }
}

export default HTTPJSONPathAdapterFieldSet;
