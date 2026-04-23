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
import { Row, Col } from 'components/bootstrap';
import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';
import ProfilesList from 'components/indices/IndexSetFieldTypeProfiles/ProfilesList';
import CreateProfileButton from 'components/indices/IndexSetFieldTypeProfiles/CreateProfileButton';
import { IndicesPageNavigation } from 'components/indices';
import useHasTypeMappingPermission from 'hooks/useHasTypeMappingPermission';
import { IndexSetsActions } from 'stores/indices/IndexSetsStore';

const IndexSetFieldTypeProfilesPage = () => {
  const navigate = useNavigate();
  const hasMappingPermission = useHasTypeMappingPermission();

  useEffect(() => {
    if (!hasMappingPermission) {
      navigate(Routes.NOTFOUND);
    } else {
      IndexSetsActions.list(false);
    }
  }, [hasMappingPermission, navigate]);

  return (
    <DocumentTitle title="索引集字段类型配置文件">
      <IndicesPageNavigation />
      <PageHeader title="索引集字段类型配置文件"
                  documentationLink={{
                    title: '索引模型文档',
                    path: DocsHelper.PAGES.INDEX_MODEL,
                  }}
                  actions={<CreateProfileButton />}>
        <span>
          通过索引集字段类型配置文件，您可以将自定义字段类型打包为配置文件。然后，您可以将此配置文件分配给任何索引集。您可以查看和编辑现有配置文件，或创建新的配置文件。
        </span>
      </PageHeader>

      <Row className="content">
        <Col md={12}>
          <ProfilesList />
        </Col>
      </Row>
    </DocumentTitle>
  );
};

export default IndexSetFieldTypeProfilesPage;
