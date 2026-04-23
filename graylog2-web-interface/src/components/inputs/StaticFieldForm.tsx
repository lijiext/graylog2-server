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
import * as React from 'react';
import { useState } from 'react';

import { BootstrapModalForm, Input } from 'components/bootstrap';
import type { Input as InputType } from 'components/messageloaders/Types';
import { InputStaticFieldsStore } from 'stores/inputs/InputStaticFieldsStore';

type Props = {
  input: InputType;
  setShowModal: (show: boolean) => void;
};

const StaticFieldForm = ({ input, setShowModal }: Props) => {
  const [fieldName, setFieldName] = useState<string>('');
  const [fieldValue, setFieldValue] = useState<string>('');

  const addStaticField = () => {
    InputStaticFieldsStore.create(input, fieldName, fieldValue).then(() => setShowModal(false));
  };

  const handleFieldChange = (name: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (name === 'name') {
      setFieldName(value);
    }

    if (name === 'value') {
      setFieldValue(value);
    }
  };

  return (
    <BootstrapModalForm
      show
      title="添加静态字段"
      submitButtonText="添加字段"
      onCancel={() => {
        setShowModal(false);
      }}
      onSubmitForm={addStaticField}>
      <p>
        定义一个静态字段，该字段将添加到通过此输入端进入的每条消息中。如果消息已包含该键，则不会覆盖该字段。键只能包含字母数字字符或下划线，且不能是保留字段。
      </p>
      <Input
        type="text"
        value={fieldName}
        onChange={(event) => {
          handleFieldChange('name', event);
        }}
        id="field-name"
        label="字段名称"
        required
        pattern="[A-Za-z0-9_]*"
        title="应仅包含字母数字字符和下划线。"
        autoFocus
      />
      <Input
        value={fieldValue}
        onChange={(event) => {
          handleFieldChange('value', event);
        }}
        type="text"
        id="field-value"
        label="字段值"
        required
      />
    </BootstrapModalForm>
  );
};

export default StaticFieldForm;
