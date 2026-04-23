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

import { DocumentTitle } from 'components/common';
import { getEnterpriseGroupSyncPlugin } from 'util/AuthenticationService';
import type { WizardFormValues } from 'components/authentication/directoryServices/BackendWizard/BackendWizardContext';

import WizardPageHeader from './WizardPageHeader';

import handleCreate from '../HandleCreate';
import BackendWizard from '../BackendWizard';

export const AUTH_BACKEND_META = {
  serviceType: 'ldap',
  serviceTitle: 'LDAP',
};

export const HELP = {
  // server config help
  systemUserDn: (
    <span>
      用于初始连接到 LDAP 服务器的用户名，例如： <code>cn=admin,dc=example,dc=com</code>，这可能是可选的，具体取决于您的 LDAP 服务器。
    </span>
  ),
  systemUserPassword: 'The password for the initial connection to the LDAP server.',
  // user sync help
  userSearchBase: (
    <span>
      LDAP 搜索查询的基准树，例如 <code>cn=users,dc=example,dc=com</code>.
    </span>
  ),
  userSearchPattern: (
    <span>
      例如 <code className="text-nowrap">{'(&(uid={0})(objectClass=inetOrgPerson))'}</code>.{' '}
      该字符串 <code>{'{0}'}</code> 将被输入的用户名替换。
    </span>
  ),
  userNameAttribute: (
    <span>
      要使用哪个 LDAP 属性作为 Graylog 中用户的用户名，例如 <code>uid</code>.<br />
      尝试在侧边栏部分加载测试用户 <i>用户登录测试</i>，如果您不确定要使用哪个属性。
    </span>
  ),
  userFullNameAttribute: (
    <span>
      用于同步的 Graylog 用户全名的 LDAP 属性，例如： <code>cn</code>.<br />
    </span>
  ),
  userUniqueIdAttribute: (
    <span>
      用于同步的 Graylog 用户 ID 的 LDAP 属性，例如： <code>entryUUID</code>.<br />
    </span>
  ),
  defaultRoles: (
    <span>同步用户将获得的默认 Graylog 角色。所有用户都需要 <code>读取器</code> 角色，以使用 Graylog Web 界面</span>
  ),
  emailAttributes: (
    <span>
      用于用户电子邮件地址的 LDAP 属性，例如： <code>mail</code>.<br />
      您可以指定多个属性，输入 <kbd>标签页</kbd> or <kbd>输入</kbd> 以接受您的值。
    </span>
  ),
};

const INITIAL_VALUES: Partial<WizardFormValues> = {
  title: AUTH_BACKEND_META.serviceTitle,
  serverHost: 'localhost',
  serverPort: 636,
  transportSecurity: 'tls',
  userFullNameAttribute: 'cn',
  emailAttributes: ['mail', 'rfc822Mailbox'],
  userNameAttribute: 'uid',
  userUniqueIdAttribute: 'entryUUID',
  verifyCertificates: true,
};

const BackendCreate = () => {
  const enterpriseGroupSyncPlugin = getEnterpriseGroupSyncPlugin();
  const {
    help: groupSyncHelp = {},
    initialValues: initialGroupSyncValues = {},
  } = enterpriseGroupSyncPlugin?.wizardConfig?.ldap ?? {};
  const help = { ...HELP, ...groupSyncHelp };
  const initialValues = { ...INITIAL_VALUES, ...initialGroupSyncValues };

  return (
    <DocumentTitle title="创建 LDAP 认证服务">
      <WizardPageHeader />
      <BackendWizard onSubmit={handleCreate}
                     help={help}
                     authBackendMeta={AUTH_BACKEND_META}
                     initialValues={initialValues} />
    </DocumentTitle>
  );
};

export default BackendCreate;
