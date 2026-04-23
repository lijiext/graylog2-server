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

import DocsHelper from 'util/DocsHelper';
import DocumentationLink from 'components/support/DocumentationLink';
import { Col, Row, Alert } from 'components/bootstrap';
import { Icon } from 'components/common';

const PermissionsUpdateInfo = () => (
  <Row className="content">
    <Col xs={12}>
      <Alert bsStyle="info" title="授予权限">
        使用 Graylog 4.0，我们更新了权限系统。为实体（如数据流和仪表盘）授予权限不再是用户编辑页面的一部分。现在可以使用 <b><Icon name="person_add" /> 共享</b> 实体的按钮。您可以在实体概览页面等位置找到该按钮。了解更多信息请参阅 <DocumentationLink page={DocsHelper.PAGES.PERMISSIONS} text="documentation" />.
      </Alert>
    </Col>
  </Row>
);

export default PermissionsUpdateInfo;
