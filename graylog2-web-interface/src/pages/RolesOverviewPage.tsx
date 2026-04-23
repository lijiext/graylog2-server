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
import RolesOverview from 'components/roles/RolesOverview';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import { Button, Row, Col, Alert } from 'components/bootstrap';
import { PageHeader, DocumentTitle, Icon } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';

const RolesOverviewPage = () => (
  <DocumentTitle title="角色概览">
    <PageHeader title="角色概览"
                documentationLink={{
                  title: 'Permissions documentation',
                  path: DocsHelper.PAGES.USERS_ROLES,
                }}
                topActions={(
                  <LinkContainer to={Routes.SYSTEM.AUTHZROLES.OVERVIEW}>
                    <Button bsStyle="info">角色概览</Button>
                  </LinkContainer>
                )}>
      <span>Graylog 角色概览。角色允许向用户授予权限，例如创建仪表盘或事件定义。</span>

    </PageHeader>

    <Row className="content">
      <Col xs={12}>
        <Alert bsStyle="info" title={<>授予权限</>}>
          使用 Graylog 4.0，我们更新了权限系统并更改了角色的用途。内置角色仍允许向用户授予功能，例如创建仪表盘或查看归档目录。但它们不再授予特定仪表盘或数据流的权限。现在也无法创建自定义角色。现在可以使用其 <b><Icon name="person_add" /> 共享</b> 按钮。您可以在实体概览页面等位置找到该按钮。如果您想一次向多个用户授予实体的权限，可以使用团队。了解更多信息请参阅 <DocumentationLink page={DocsHelper.PAGES.PERMISSIONS} text="documentation" />.
        </Alert>
      </Col>
    </Row>

    <RolesOverview />
  </DocumentTitle>
);

export default RolesOverviewPage;
