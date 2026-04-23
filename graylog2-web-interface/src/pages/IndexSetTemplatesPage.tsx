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
import React from 'react';

import { DocumentTitle, PageHeader, IfPermitted } from 'components/common';
import { Alert, Row, Col } from 'components/bootstrap';
import IndexSetTemplatesList from 'components/indices/IndexSetTemplates/IndexSetTemplatesList';
import CreateIndexSetTemplateButton from 'components/indices/IndexSetTemplates/CreateIndexSetTemplateButton';
import { IndicesPageNavigation } from 'components/indices';

const IndexSetTemplatesPage = () => (
  <DocumentTitle title="索引集模板">
    <IndicesPageNavigation />
    <PageHeader
      title="索引集模板"
      actions={
        <IfPermitted permissions="indexset_templates:create">
          <CreateIndexSetTemplateButton />
        </IfPermitted>
      }>
      <span>
        查看和管理您的索引集模板。这些模板允许在创建新索引集时保存和重用索引集配置。
      </span>
    </PageHeader>

    <Row className="content">
      <Col md={12}>
        <Alert>
          在此处定义默认模板，以控制由 Illuminate 内容包创建的索引集的配置。
        </Alert>

        <IndexSetTemplatesList />
      </Col>
    </Row>
  </DocumentTitle>
);

export default IndexSetTemplatesPage;
