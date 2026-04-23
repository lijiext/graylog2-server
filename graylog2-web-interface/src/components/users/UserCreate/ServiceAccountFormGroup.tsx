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
import { Field } from 'formik';

import { Input, BootstrapModalConfirm } from 'components/bootstrap';
import { getValueFromInput } from 'util/FormsUtils';

const ServiceAccountFormGroup = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <Field name="service_account">
      {({ field: { name, value, onChange } }) => {
        const onValueChange = (newValue) => {
          const serviceAccountNewValue = getValueFromInput(newValue.target);

          if (serviceAccountNewValue) {
            setShowModal(true);
          } else {
            onChange(newValue);
          }
        };

        const handleCheckServiceAccount = () => {
          onChange({ target: { name, value: true } });
          setShowModal(false);
        };

        const handleCancel = () => {
          onChange({ target: { name, value: false } });
          setShowModal(false);
        };

        return (
          <>
            <Input
              id="service-account-controls"
              labelClassName="col-sm-3"
              wrapperClassName="col-sm-9"
              label="服务账户">
              <Input
                label="用户是服务账号"
                id="service_account"
                type="checkbox"
                wrapperClassName="col-sm-9"
                name="service_account"
                checked={value ?? false}
                help="选中后，该用户将成为服务账户，无法登录 Web 界面并编辑其设置。（例如：API 令牌）"
                onChange={(newValue) => onValueChange(newValue)}
              />
            </Input>
            <BootstrapModalConfirm
              showModal={showModal}
              title="您确定吗？"
              onConfirm={handleCheckServiceAccount}
              onCancel={handleCancel}>
              将此用户更改为服务账户将阻止该用户登录 Web 界面并编辑其设置（例如 API 令牌）。您确定要继续吗？
            </BootstrapModalConfirm>
          </>
        );
      }}
    </Field>
  );
};

export default ServiceAccountFormGroup;
