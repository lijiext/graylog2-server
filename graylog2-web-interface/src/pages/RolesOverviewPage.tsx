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
import useProductName from 'brand-customization/useProductName';

const RolesOverviewPage = () => {
  const productName = useProductName();

  return (
    <DocumentTitle title="角色概览">
      <PageHeader
        title="角色概览"
        documentationLink={{
          title: 'Permissions documentation',
          path: DocsHelper.PAGES.USERS_ROLES,
        }}
        topActions={
          <LinkContainer to={Routes.SYSTEM.AUTHZROLES.OVERVIEW}>
            <Button bsStyle="info">角色概览</Button>
          </LinkContainer>
        }>
        <span>
          所有可用角色的概述 {productName}. 角色允许向用户授予权限，例如创建仪表盘或事件定义。
        </span>
      </PageHeader>

      <Row className="content">
        <Col xs={12}>
          <Alert bsStyle="info" title={<>授予权限</>}>
            内置角色允许向用户授予能力，例如创建仪表盘或查看归档目录。但它们不会为特定仪表盘或数据流授予权限。也无法创建自定义角色。为特定实体授予权限可通过使用其{' '}
            <b>
              <Icon name="person_add" /> 分享
            </b>{' '}
            按钮。您可以在实体概览页面等位置找到该按钮。如果您希望一次性为实体授予多个用户的权限，可以使用团队。在以下位置了解更多{' '}
            <DocumentationLink page={DocsHelper.PAGES.PERMISSIONS} text="documentation" />.
          </Alert>
        </Col>
      </Row>

      <RolesOverview />
    </DocumentTitle>
  );
};

export default RolesOverviewPage;
