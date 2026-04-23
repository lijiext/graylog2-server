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
    <PageHeader
      title="创建新用户"
      actions={
        <LinkContainer to={Routes.SYSTEM.USERS.CREATE}>
          <Button bsStyle="primary">创建用户</Button>
        </LinkContainer>
      }
      documentationLink={{
        title: 'Permissions documentation',
        path: DocsHelper.PAGES.USERS_ROLES,
      }}>
      <span>使用此页面为 Web 界面或 REST API 创建新用户。</span>
    </PageHeader>

    <UserCreate />
  </DocumentTitle>
);

export default UserCreatePage;
