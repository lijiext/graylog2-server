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
import createReactClass from 'create-react-class';

import { Icon } from 'components/common';
import { Col, Row, Button, Input } from 'components/bootstrap';
import ExtractorUtils from 'util/ExtractorUtils';
import FormUtils from 'util/FormsUtils';
import ToolsStore from 'stores/tools/ToolsStore';

const JSONExtractorConfiguration = createReactClass({
  displayName: 'JSONExtractorConfiguration',

  propTypes: {
    configuration: PropTypes.object.isRequired,
    exampleMessage: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onExtractorPreviewLoad: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      trying: false,
      configuration: this._getEffectiveConfiguration(this.props.configuration),
    };
  },

  componentDidMount() {
    this.props.onChange(this.state.configuration);
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ configuration: this._getEffectiveConfiguration(nextProps.configuration) });
  },

  DEFAULT_CONFIGURATION: {
    list_separator: ', ',
    key_separator: '_',
    kv_separator: '=',
    key_prefix: '',
    replace_key_whitespace: false,
    key_whitespace_replacement: '_',
  },

  _getEffectiveConfiguration(configuration) {
    return ExtractorUtils.getEffectiveConfiguration(this.DEFAULT_CONFIGURATION, configuration);
  },

  _onChange(key) {
    return (event) => {
      this.props.onExtractorPreviewLoad(undefined);
      const newConfig = this.state.configuration;

      newConfig[key] = FormUtils.getValueFromInput(event.target);
      this.props.onChange(newConfig);
    };
  },

  _onTryClick() {
    this.setState({ trying: true });

    const { configuration } = this.state;
    const promise = ToolsStore.testJSON(configuration.flatten, configuration.list_separator, configuration.key_separator, configuration.kv_separator, configuration.replace_key_whitespace, configuration.key_whitespace_replacement, configuration.key_prefix, this.props.exampleMessage);

    promise.then((result) => {
      const matches = [];

      for (const match in result.matches) {
        if (result.matches.hasOwnProperty(match)) {
          matches.push(<dt key={`${match}-name`}>{match}</dt>);
          matches.push(<dd key={`${match}-value`}><samp>{result.matches[match]}</samp></dd>);
        }
      }

      const preview = (matches.length === 0 ? '' : <dl>{matches}</dl>);

      this.props.onExtractorPreviewLoad(preview);
    });

    promise.finally(() => this.setState({ trying: false }));
  },

  _isTryButtonDisabled() {
    return this.state.trying || !this.props.exampleMessage;
  },

  render() {
    return (
      <div>
        <Input type="checkbox"
               id="flatten"
               label="展平结构"
               wrapperClassName="col-md-offset-2 col-md-10"
               defaultChecked={this.state.configuration.flatten}
               onChange={this._onChange('flatten')}
               help="是否将 JSON 对象扁平化为单个消息字段，或扩展为多个字段。" />

        <Input type="text"
               id="list_separator"
               label="列表项分隔符"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.list_separator}
               required
               onChange={this._onChange('list_separator')}
               help="要用于连接 JSON 列表项的字符串。" />

        <Input type="text"
               id="key_separator"
               label="键分隔符"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.key_separator}
               required
               onChange={this._onChange('key_separator')}
               help={<span>用于连接嵌套 JSON 对象中不同键的字符串（仅在 <em>not</em> 扁平化）。</span>} />

        <Input type="text"
               id="kv_separator"
               label="键/值分隔符"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.kv_separator}
               required
               onChange={this._onChange('kv_separator')}
               help="用于连接 JSON 对象键值对的字符串（仅在扁平化时使用）。" />

        <Input type="text"
               id="key_prefix"
               label="键前缀"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.key_prefix}
               onChange={this._onChange('key_prefix')}
               help="从 JSON 对象中提取的每个键前添加的文本。" />

        <Input type="checkbox"
               id="replace_key_whitespace"
               label="替换键中的空格"
               wrapperClassName="col-md-offset-2 col-md-10"
               defaultChecked={this.state.configuration.replace_key_whitespace}
               onChange={this._onChange('replace_key_whitespace')}
               help="存储提取的消息时，包含空白的字段键将被丢弃。选中此框以将 JSON 键中的空白替换为另一个字符。" />

        <Input type="text"
               id="key_whitespace_replacement"
               label="键值空格替换"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.key_whitespace_replacement}
               disabled={!this.state.configuration.replace_key_whitespace}
               required
               onChange={this._onChange('key_whitespace_replacement')}
               help="What character to use when replacing whitespaces in message keys. Please ensure the replacement character is valid in Lucene, e.g. '-' or '_'." />

        <Row>
          <Col mdOffset={2} md={10}>
            <Button bsStyle="info" onClick={this._onTryClick} disabled={this._isTryButtonDisabled()}>
              {this.state.trying ? <Icon name="progress_activity" spin /> : '尝试'}
            </Button>
          </Col>
        </Row>
      </div>
    );
  },
});

export default JSONExtractorConfiguration;
