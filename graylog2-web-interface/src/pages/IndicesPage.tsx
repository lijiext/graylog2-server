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

import { LinkContainer } from 'components/common/router';
import Routes from 'routing/Routes';
import { Col, Row, Button, ButtonToolbar } from 'components/bootstrap';
import HideOnCloud from 'util/conditional/HideOnCloud';
import DocsHelper from 'util/DocsHelper';
import { DocumentTitle, PageHeader } from 'components/common';
import { IndexSetsComponent, IndicesPageNavigation } from 'components/indices';
import { IndexerClusterHealth } from 'components/indexers';
import AllIndicesMaintenanceDropdown from 'components/indices/AllIndicesMaintenanceDropdown';

const IndicesPage = () => (
  <DocumentTitle title="索引和索引集">
    <IndicesPageNavigation />
    <PageHeader title="索引与索引集"
                actions={(
                  <ButtonToolbar>
                    <LinkContainer to={Routes.SYSTEM.INDEX_SETS.CREATE}>
                      <Button bsStyle="success">创建索引集</Button>
                    </LinkContainer>
                    <AllIndicesMaintenanceDropdown />
                  </ButtonToolbar>
                )}
                documentationLink={{
                  title: 'Index model documentation',
                  path: DocsHelper.PAGES.INDEX_MODEL,
                }}>
      <span>
        Graylog 数据流将消息写入索引集，索引集是存储数据的保留、分片和复制配置。通过配置索引集，例如，您可以为某些数据流设置不同的保留时间。
      </span>
    </PageHeader>

    <HideOnCloud>
      <IndexerClusterHealth minimal />
    </HideOnCloud>

    <Row className="content">
      <Col md={12}>
        <IndexSetsComponent />
      </Col>
    </Row>
  </DocumentTitle>
);

export default IndicesPage;
