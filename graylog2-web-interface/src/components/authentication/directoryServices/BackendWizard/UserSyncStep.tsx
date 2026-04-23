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
import type * as Immutable from 'immutable';
import { useContext } from 'react';
import type { FormikProps } from 'formik';
import { Formik, Form, Field } from 'formik';
import styled from 'styled-components';

import type Role from 'logic/roles/Role';
import { validateField, formHasErrors } from 'util/FormsUtils';
import { FormikFormGroup, Select, InputList } from 'components/common';
import { Alert, Button, ButtonToolbar, Row, Col, Panel, Input } from 'components/bootstrap';
import { getPathnameWithoutId } from 'util/URLUtils';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

import type { WizardFormValues } from './BackendWizardContext';
import BackendWizardContext from './BackendWizardContext';

export const STEP_KEY = 'user-synchronization';
// Form validation needs to include all input names
// to be able to associate backend validation errors with the form
export const FORM_VALIDATION = {
  defaultRoles: { required: true },
  userFullNameAttribute: { required: true },
  userNameAttribute: { required: true },
  emailAttributes: {},
  userSearchBase: { required: true },
  userSearchPattern: { required: true },
  userUniqueIdAttribute: {},
};

type Props = {
  formRef: React.Ref<FormikProps<WizardFormValues>>;
  help?: { [inputName: string]: React.ReactElement | string | null | undefined };
  excludedFields?: { [inputName: string]: boolean };
  roles: Immutable.List<Role>;
  onSubmit: () => void;
  onSubmitAll: () => Promise<void>;
  submitAllError: React.ReactNode | null | undefined;
  validateOnMount: boolean;
};
const StyledInputList = styled(InputList)`
  margin: auto 15px;
`;

const UserSyncStep = ({
  help = {},
  excludedFields = {},
  formRef,
  onSubmit,
  onSubmitAll,
  submitAllError,
  validateOnMount,
  roles,
}: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setStepsState, ...stepsState } = useContext(BackendWizardContext);
  const { backendValidationErrors } = stepsState;
  const rolesOptions = roles.map((role) => ({ label: role.name, value: role.id })).toArray();
  const { pathname } = useLocation();
  const sendTelemetry = useSendTelemetry();

  const _onSubmitAll = (validateForm) => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.AUTHENTICATION.DIRECTORY_USER_SYNC_SAVE_CLICKED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_section: 'directory-service',
      app_action_value: 'usersync-save',
    });

    validateForm().then((errors) => {
      if (!formHasErrors(errors)) {
        onSubmitAll();
      }
    });
  };

  const getInitalFormValues = (values: WizardFormValues) => ({
    ...values,
    ...(!excludedFields.emailAttributes && { emailAttributes: values.emailAttributes || [] }),
  });

  return (
    <Formik
      initialValues={getInitalFormValues(stepsState.formValues)}
      initialErrors={backendValidationErrors}
      innerRef={formRef}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnChange={false}
      validateOnMount={validateOnMount}>
      {({ isSubmitting, validateForm }) => (
        <Form className="form form-horizontal">
          <FormikFormGroup
            help={help.userSearchBase}
            label="搜索基础 DN"
            error={backendValidationErrors?.userSearchBase}
            name="userSearchBase"
            placeholder="搜索基础 DN"
            validate={validateField(FORM_VALIDATION.userSearchBase)}
          />

          <FormikFormGroup
            help={help.userSearchPattern}
            label="搜索模式"
            name="userSearchPattern"
            error={backendValidationErrors?.userSearchPattern}
            placeholder="搜索模式"
            validate={validateField(FORM_VALIDATION.userSearchPattern)}
          />

          <FormikFormGroup
            help={help.userNameAttribute}
            label="名称属性"
            name="userNameAttribute"
            error={backendValidationErrors?.userNameAttribute}
            placeholder="名称属性"
            validate={validateField(FORM_VALIDATION.userNameAttribute)}
          />

          {!excludedFields.emailAttributes && (
            <Field name="emailAttributes" validate={validateField(FORM_VALIDATION.emailAttributes)}>
              {({ field: { name, value, onChange }, meta: { error } }) => (
                <Input
                  bsStyle={error ? 'error' : undefined}
                  help={help.emailAttributes}
                  error={error ?? backendValidationErrors?.emailAttributes}
                  id="email-attributes-input"
                  label="电子邮件属性"
                  labelClassName="col-sm-3"
                  wrapperClassName="col-sm-9">
                  <StyledInputList
                    id="userEmailAttributes"
                    placeholder="电子邮件属性"
                    name={name}
                    values={value}
                    isClearable
                    onChange={onChange}
                  />
                </Input>
              )}
            </Field>
          )}
          <FormikFormGroup
            help={help.userFullNameAttribute}
            label="全名属性"
            name="userFullNameAttribute"
            placeholder="全名属性"
            error={backendValidationErrors?.userFullNameAttribute}
            validate={validateField(FORM_VALIDATION.userFullNameAttribute)}
          />

          {!excludedFields.userUniqueIdAttribute && (
            <FormikFormGroup
              help={help.userUniqueIdAttribute}
              label="ID 属性"
              name="userUniqueIdAttribute"
              placeholder="ID 属性"
              error={backendValidationErrors?.userUniqueIdAttribute}
              validate={validateField(FORM_VALIDATION.userUniqueIdAttribute)}
            />
          )}

          <Row>
            <Col sm={9} smOffset={3}>
              <Panel bsStyle="info">
                更改静态角色分配将仅影响通过此方式创建的新用户{' '}
                {stepsState.authBackendMeta.serviceTitle}! 现有用户账户将在其下次登录时更新，或如果您手动编辑其角色时更新。
              </Panel>
            </Col>
          </Row>

          <Field name="defaultRoles" validate={validateField(FORM_VALIDATION.defaultRoles)}>
            {({ field: { name, value, onChange, onBlur }, meta: { error } }) => (
              <Input
                bsStyle={error ? 'error' : undefined}
                help={help.defaultRoles}
                error={error ?? backendValidationErrors?.defaultRoles}
                id="default-roles-select"
                label="默认角色"
                labelClassName="col-sm-3"
                wrapperClassName="col-sm-9">
                <Select
                  multi
                  onBlur={onBlur}
                  onChange={(selectedRoles) => onChange({ target: { value: selectedRoles, name } })}
                  options={rolesOptions}
                  placeholder="搜索角色"
                  value={value}
                />
              </Input>
            )}
          </Field>

          <Row>
            <Col sm={9} smOffset={3}>
              <Alert bsStyle="info">
                我们建议您在侧边栏面板中测试用户登录，以验证您的设置。
              </Alert>
            </Col>
          </Row>

          {submitAllError}

          <ButtonToolbar className="pull-right">
            <Button disabled={isSubmitting} onClick={() => _onSubmitAll(validateForm)} type="button">
              完成并保存身份服务
            </Button>
            <Button
              bsStyle="primary"
              disabled={isSubmitting}
              onClick={() => {
                sendTelemetry(TELEMETRY_EVENT_TYPE.AUTHENTICATION.DIRECTORY_NEXT_GROUP_SYNC_CLICKED, {
                  app_pathname: getPathnameWithoutId(pathname),
                  app_section: 'directory-service',
                  app_action_value: 'groupsync-button',
                });
              }}
              type="submit">
              下一步：组同步
            </Button>
          </ButtonToolbar>
        </Form>
      )}
    </Formik>
  );
};

export default UserSyncStep;
