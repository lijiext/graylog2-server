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

import { BootstrapModalForm, Input } from 'components/bootstrap';
import { InputStaticFieldsStore } from 'stores/inputs/InputStaticFieldsStore';

class StaticFieldForm extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
    };
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  open = () => {
    this.setState({ showModal: true });
  };

  close = () => {
    this.setState({ showModal: false });
  };

  _addStaticField = () => {
    const fieldName = this.fieldName.getValue();
    const fieldValue = this.fieldValue.getValue();

    InputStaticFieldsStore.create(this.props.input, fieldName, fieldValue).then(() => this.close());
  };

  render() {
    return (
      <BootstrapModalForm show={this.state.showModal}
                          title="添加静态字段"
                          submitButtonText="添加字段"
                          onCancel={this.close}
                          onSubmitForm={this._addStaticField}>
        <p>定义一个静态字段，该字段将添加到通过此输入端进入的每条消息中。如果消息已包含该键，则不会覆盖该字段。键只能包含字母数字字符或下划线，且不能是保留字段。
        </p>
        <Input ref={(fieldName) => { this.fieldName = fieldName; }}
               type="text"
               id="field-name"
               label="字段名称"
               required
               pattern="[A-Za-z0-9_]*"
               title="应仅包含字母数字字符和下划线。"
               autoFocus />
        <Input ref={(fieldValue) => { this.fieldValue = fieldValue; }}
               type="text"
               id="field-value"
               label="字段值"
               required />
      </BootstrapModalForm>
    );
  }
}

export default StaticFieldForm;
