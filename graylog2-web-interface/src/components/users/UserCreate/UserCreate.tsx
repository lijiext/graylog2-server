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
import React, { useState } from 'react';
import styled from 'styled-components';
import * as Immutable from 'immutable';
import { Formik, Form } from 'formik';
import { PluginStore } from 'graylog-web-plugin/plugin';

import AppConfig from 'util/AppConfig';
import type { DescriptiveItem } from 'components/common/PaginatedItemOverview';
import User from 'logic/users/User';
import UsersDomain from 'domainActions/users/UsersDomain';
import PaginatedItem from 'components/common/PaginatedItemOverview/PaginatedItem';
import RolesSelector from 'components/permissions/RolesSelector';
import { Alert, Col, Row, Input } from 'components/bootstrap';
import Routes from 'routing/Routes';
import { FormSubmit, IfPermitted, NoSearchResult, ReadOnlyFormGroup } from 'components/common';
import useHistory from 'routing/useHistory';
import { getPathnameWithoutId } from 'util/URLUtils';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import useIsGlobalTimeoutEnabled from 'hooks/useIsGlobalTimeoutEnabled';
import { Link } from 'components/common/router';
import { Headline } from 'components/common/Section/SectionComponent';
import useProductName from 'brand-customization/useProductName';

import TimezoneFormGroup from './TimezoneFormGroup';
import TimeoutFormGroup from './TimeoutFormGroup';
import FirstNameFormGroup from './FirstNameFormGroup';
import LastNameFormGroup from './LastNameFormGroup';
import EmailFormGroup from './EmailFormGroup';
import PasswordFormGroup, { validatePasswords } from './PasswordFormGroup';
import UsernameFormGroup from './UsernameFormGroup';
import ServiceAccountFormGroup from './ServiceAccountFormGroup';

const GlobalTimeoutMessage = styled(ReadOnlyFormGroup)`
  margin-bottom: 20px;

  .read-only-value-col {
    padding-top: 0;
  }
`;

const isCloud = AppConfig.isCloud();

const oktaUserForm = isCloud ? PluginStore.exports('cloud')[0].oktaUserForm : null;

type RequestError = { additional: { res: { text: string } } };

const PasswordGroup = () => {
  if (isCloud && oktaUserForm) {
    const {
      fields: { password: CloudPasswordFormGroup },
    } = oktaUserForm;

    return <CloudPasswordFormGroup />;
  }

  return <PasswordFormGroup />;
};

const UserNameGroup = () => {
  if (isCloud && oktaUserForm) {
    const {
      fields: { username: CloudUserNameFormGroup },
    } = oktaUserForm;

    return CloudUserNameFormGroup && <CloudUserNameFormGroup />;
  }

  return <UsernameFormGroup />;
};

const EmailGroup = () => {
  if (isCloud && oktaUserForm) {
    const {
      fields: { email: CloudEmailFormGroup },
    } = oktaUserForm;

    return CloudEmailFormGroup && <CloudEmailFormGroup />;
  }

  return <EmailFormGroup />;
};

const UserCreate = () => {
  const productName = useProductName();
  const initialRole = {
    name: 'Reader',
    description: `Grants basic permissions for every ${productName} user (built-in)`,
    id: '',
  };
  const [user, setUser] = useState(
    User.empty()
      .toBuilder()
      .roles(Immutable.Set([initialRole.name]))
      .build(),
  );

  const [submitError, setSubmitError] = useState<RequestError | undefined>();
  const [selectedRoles, setSelectedRoles] = useState<Immutable.Set<DescriptiveItem>>(Immutable.Set([initialRole]));
  const history = useHistory();
  const { pathname } = useLocation();
  const sendTelemetry = useSendTelemetry();
  const isGlobalTimeoutEnabled = useIsGlobalTimeoutEnabled();

  const validate = (values) => {
    let errors = {};

    const { password, password_repeat: passwordRepeat } = values;

    if (isCloud && oktaUserForm) {
      const {
        validations: { password: validateCloudPasswords },
      } = oktaUserForm;

      errors = validateCloudPasswords(errors, password, passwordRepeat);
    } else {
      errors = validatePasswords(errors, password, passwordRepeat);
    }

    return errors;
  };

  const _onAssignRole = (roles: Immutable.Set<DescriptiveItem>) => {
    setSelectedRoles(selectedRoles.union(roles));
    const roleNames = roles.map((r) => r.name);

    return Promise.resolve(setUser(user.toBuilder().roles(user.roles.union(roleNames)).build()));
  };

  const _onUnassignRole = (role: DescriptiveItem) => {
    setSelectedRoles(selectedRoles.remove(role));
    setUser(user.toBuilder().roles(user.roles.remove(role?.name)).build());
  };

  const _handleCancel = () => history.push(Routes.SYSTEM.USERS.OVERVIEW);
  const hasValidRole =
    selectedRoles.size > 0 && selectedRoles.filter((role) => role.name === 'Reader' || role.name === 'Admin');

  const showSubmitError = (errors) => {
    if (isCloud && oktaUserForm) {
      const { extractSubmitError } = oktaUserForm;

      return extractSubmitError(errors);
    }

    return errors?.additional?.res?.text;
  };

  const handleFormSubmit = (formData, roles) => {
    let data = { ...formData, roles: roles.toJS(), permissions: [] };
    delete data.password_repeat;

    if (isCloud && oktaUserForm) {
      const { onCreate } = oktaUserForm;
      data = onCreate(data);
    } else {
      data.username = data.username.trim();
    }

    setSubmitError(null);

    return UsersDomain.create(data).then(
      () => {
        history.push(Routes.SYSTEM.USERS.OVERVIEW);
      },
      (error) => setSubmitError(error),
    );
  };

  const onSubmit = (data) => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.USERS.USER_CREATED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_action_value: 'user-create-form',
    });

    return handleFormSubmit(data, user.roles);
  };

  return (
    <Row className="content">
      <Col lg={8}>
        <Formik onSubmit={onSubmit} validate={validate} validateOnBlur={false} initialValues={{}}>
          {({ isSubmitting, isValidating, isValid }) => (
            <Form className="form form-horizontal">
              <div>
                <Headline>个人资料</Headline>
                <FirstNameFormGroup />
                <LastNameFormGroup />
                <UserNameGroup />
                <EmailGroup />
              </div>
              <div>
                <Headline>设置</Headline>
                {isGlobalTimeoutEnabled ? (
                  <GlobalTimeoutMessage
                    label="会话超时"
                    value={
                      <NoSearchResult>
                        用户会话超时不可编辑，因为
                        <IfPermitted permissions={['clusterconfigentry:read']}>
                          <Link to={Routes.SYSTEM.CONFIGURATIONS}>全局会话超时</Link>
                        </IfPermitted>{' '}
                        已启用。
                      </NoSearchResult>
                    }
                  />
                ) : (
                  <TimeoutFormGroup />
                )}
                <TimezoneFormGroup />
                <ServiceAccountFormGroup />
              </div>
              <div>
                <Headline>角色</Headline>
                <Input
                  id="roles-selector-input"
                  labelClassName="col-sm-3"
                  wrapperClassName="col-sm-9"
                  label="分配角色">
                  <RolesSelector
                    onSubmit={_onAssignRole}
                    assignedRolesIds={user.roles}
                    identifier={(role) => role.name}
                    submitOnSelect
                  />
                </Input>

                <Input
                  id="selected-roles-overview"
                  labelClassName="col-sm-3"
                  wrapperClassName="col-sm-9"
                  label="已选角色">
                  <>
                    {selectedRoles
                      .map((role) => (
                        <PaginatedItem item={role} onDeleteItem={(data) => _onUnassignRole(data)} key={role.id} />
                      ))
                      .toArray()}
                    {!hasValidRole && (
                      <Alert bsStyle="danger">
                        您至少需要选择以下一项 <em>阅读器</em> or <em>管理员</em> 角色。
                      </Alert>
                    )}
                  </>
                </Input>
              </div>
              <div>
                <Headline>密码</Headline>
                <PasswordGroup />
              </div>
              {submitError && (
                <Row>
                  <Col xs={9} xsOffset={3}>
                    <Alert bsStyle="danger" title="创建用户失败">
                      {showSubmitError(submitError)}
                    </Alert>
                  </Col>
                </Row>
              )}
              <Row>
                <Col md={9} mdOffset={3}>
                  <FormSubmit
                    disabledSubmit={!isValid || !hasValidRole || isValidating}
                    submitButtonText="创建用户"
                    submitLoadingText="正在创建用户..."
                    isSubmitting={isSubmitting}
                    isAsyncSubmit
                    onCancel={_handleCancel}
                  />
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </Col>
    </Row>
  );
};

export default UserCreate;
