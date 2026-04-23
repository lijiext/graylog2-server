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
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { DocumentTitle, PageHeader } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';
import { Col, Row } from 'components/bootstrap';
import CreateProfile from 'components/indices/IndexSetFieldTypeProfiles/CreateProfile';
import useHasTypeMappingPermission from 'hooks/useHasTypeMappingPermission';
import { IndicesPageNavigation } from 'components/indices';

const IndexSetFieldTypeProfileCreatePage = () => {
  const navigate = useNavigate();
  const hasMappingPermission = useHasTypeMappingPermission();

  useEffect(() => {
    if (!hasMappingPermission) {
      navigate(Routes.NOTFOUND);
    }
  }, [hasMappingPermission, navigate]);

  return (
    <DocumentTitle title="创建索引集字段类型配置文件">
      <IndicesPageNavigation />
      <PageHeader title="创建索引集字段类型配置文件"
                  documentationLink={{
                    title: '索引模型文档',
                    path: DocsHelper.PAGES.INDEX_MODEL,
                  }}>
        <span>
          通过索引集字段类型配置文件，您可以将自定义字段类型打包为配置文件。然后，您可以将此配置文件分配给任何索引集。在此页面上，您可以创建新的配置文件。
        </span>
      </PageHeader>
      <Row className="content">
        <Col md={12}>
          <CreateProfile />
        </Col>
      </Row>
    </DocumentTitle>
  );
};

export default IndexSetFieldTypeProfileCreatePage;
