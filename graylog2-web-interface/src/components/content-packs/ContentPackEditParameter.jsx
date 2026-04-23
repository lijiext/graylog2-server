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

import { Input } from 'components/bootstrap';
import * as FormsUtils from 'util/FormsUtils';
import ObjectUtils from 'util/ObjectUtils';

import ContentPackUtils from './ContentPackUtils';

class ContentPackEditParameter extends React.Component {
  static propTypes = {
    onUpdateParameter: PropTypes.func,
    parameters: PropTypes.array,
    parameterToEdit: PropTypes.object,
  };

  static defaultProps = {
    onUpdateParameter: () => { },
    parameters: [],
    parameterToEdit: undefined,
  };

  static emptyParameter = {
    name: '',
    title: '',
    description: '',
    type: 'string',
    default_value: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      newParameter: props.parameterToEdit || ObjectUtils.clone(ContentPackEditParameter.emptyParameter),
      defaultValueError: undefined,
      nameError: undefined,
      titleError: undefined,
      descrError: undefined,
    };
  }

  addNewParameter = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!this._validateParameter()) {
      return;
    }

    const realDefaultValue = ContentPackUtils.convertValue(this.state.newParameter.type,
      this.state.newParameter.default_value);
    const updatedParameter = ObjectUtils.clone(this.state.newParameter);

    updatedParameter.default_value = realDefaultValue;
    this.props.onUpdateParameter(updatedParameter);

    this.titleInput.getInputDOMNode().focus();
    this.setState({ newParameter: ObjectUtils.clone(ContentPackEditParameter.emptyParameter) });
  };

  _updateField = (name, value) => {
    const updatedParameter = ObjectUtils.clone(this.state.newParameter);

    updatedParameter[name] = value;
    this.setState({ newParameter: updatedParameter });
  };

  _bindValue = (event) => {
    this._updateField(event.target.name, FormsUtils.getValueFromInput(event.target));
  };

  _validateParameter() {
    const param = this.state.newParameter;

    if (!param.name) {
      this.setState({ nameError: 'Name must be set.' });

      return false;
    }

    this.setState({ nameError: undefined });

    if (!param.title) {
      this.setState({ titleError: 'Title must be set.' });

      return false;
    }

    this.setState({ titleError: undefined });

    if (!param.description) {
      this.setState({ descrError: 'Description must be set.' });

      return false;
    }

    this.setState({ descrError: undefined });

    return this._validateDefaultValue() && this._validateName();
  }

  _validateName = () => {
    const value = this.state.newParameter.name;

    if (value.match(/\W/)) {
      this.setState({ nameError: 'The parameter name must only contain A-Z, a-z, 0-9 and _' });

      return false;
    }

    if ((this.props.parameterToEdit || {}).name !== value
      && this.props.parameters.findIndex((parameter) => parameter.name === value) >= 0) {
      this.setState({ nameError: 'The parameter name must be unique.' });

      return false;
    }

    this.setState({ nameError: undefined });

    return true;
  };

  _validateDefaultValue = () => {
    const value = this.state.newParameter.default_value;

    if (value) {
      switch (this.state.newParameter.type) {
        case 'integer': {
          if (`${parseInt(value, 10)}` !== value) {
            this.setState({ defaultValueError: 'This is not an integer value.' });

            return false;
          }

          break;
        }

        case 'double': {
          if (isNaN(value)) {
            this.setState({ defaultValueError: 'This is not a double value.' });

            return false;
          }

          break;
        }

        case 'boolean': {
          if (value !== 'true' && value !== 'false') {
            this.setState({ defaultValueError: 'This is not a boolean value. It must be either true or false.' });

            return false;
          }

          break;
        }

        default:
          break;
      }
    }

    this.setState({ defaultValueError: undefined });

    return true;
  };

  render() {
    const header = this.props.parameterToEdit ? '编辑参数' : '创建参数';
    const disableType = !!this.props.parameterToEdit;

    return (
      <div>
        <h2>{header}</h2>
        <br />
        <form className="parameter-form" id="parameter-form" onSubmit={this.addNewParameter}>
          <fieldset>
            <Input ref={(node) => { this.titleInput = node; }}
                   name="title"
                   id="title"
                   type="text"
                   maxLength={250}
                   value={this.state.newParameter.title}
                   onChange={this._bindValue}
                   bsStyle={this.state.titleError ? 'error' : null}
                   label="标题"
                   help={this.state.titleError ? this.state.titleError
                     : '为此内容包提供一个描述性标题。'}
                   required />
            <Input name="name"
                   id="name"
                   type="text"
                   maxLength={250}
                   bsStyle={this.state.nameError ? 'error' : null}
                   value={this.state.newParameter.name}
                   onChange={this._bindValue}
                   label="名称"
                   help={this.state.nameError ? this.state.nameError
                     : '此参数参考不得包含空格。'}
                   required />
            <Input name="description"
                   id="description"
                   type="text"
                   bsStyle={this.state.descrError ? 'error' : null}
                   maxLength={250}
                   value={this.state.newParameter.description}
                   onChange={this._bindValue}
                   label="描述"
                   help={this.state.descrError ? this.state.descrError
                     : '提供描述，说明将如何处理此参数。'}
                   required />
            <Input name="type"
                   id="type"
                   type="select"
                   disabled={disableType}
                   value={this.state.newParameter.type}
                   onChange={this._bindValue}
                   label="值类型"
                   help="指定参数的类型。"
                   required>
              <option value="string">字符串</option>
              <option value="integer">整数</option>
              <option value="double">双</option>
              <option value="boolean">布尔值</option>
            </Input>
            <Input name="default_value"
                   id="default_value"
                   type="text"
                   maxLength={250}
                   bsStyle={this.state.defaultValueError ? 'error' : null}
                   value={this.state.newParameter.default_value}
                   onChange={this._bindValue}
                   label="默认值"
                   help={this.state.defaultValueError ? this.state.defaultValueError
                     : '如果参数不是可选的，请提供默认值。'} />
          </fieldset>
        </form>
      </div>
    );
  }
}

export default ContentPackEditParameter;
