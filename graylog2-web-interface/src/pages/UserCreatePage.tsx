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

import { LinkContainer } from 'components/common/router';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import { Button } from 'components/bootstrap';
import { PageHeader, DocumentTitle } from 'components/common';
import UserCreate from 'components/users/UserCreate';
import UsersPageNavigation from 'components/users/navigation/UsersPageNavigation';

const UserCreatePage = () => (
  <DocumentTitle title="创建新用户">
    <UsersPageNavigation />
    <PageHeader title="创建新用户"
                actions={(
                  <LinkContainer to={Routes.SYSTEM.USERS.CREATE}>
                    <Button bsStyle="success">创建用户</Button>
                  </LinkContainer>
                )}
                documentationLink={{
                  title: 'Permissions documentation',
                  path: DocsHelper.PAGES.USERS_ROLES,
                }}>
      <span>
        使用此页面创建新的 Graylog 用户。在此处创建的用户及其权限不仅适用于 Web 界面，也适用于 Graylog 服务器节点的 REST API。
      </span>
    </PageHeader>

    <UserCreate />
  </DocumentTitle>
);

export default UserCreatePage;
