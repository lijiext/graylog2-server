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

import { Col, Row } from 'components/bootstrap';
import { DocumentTitle, PageHeader } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import SidecarsPageNavigation from 'components/sidecars/common/SidecarsPageNavigation';
import SidecarFailureTrackingListContainer from 'components/sidecars/failure-tracking/SidecarFailureTrackingListContainer';

const SidecarFailureTrackingPage = () => (
  <DocumentTitle title="Sidecars">
    <SidecarsPageNavigation />
    <PageHeader
      title="故障跟踪"
      documentationLink={{
        title: 'Sidecar documentation',
        path: DocsHelper.PAGES.COLLECTOR_SIDECAR,
      }}>
      <span>
        Sidecar 故障跟踪提供了有关故障原因的额外有用信息，可帮助您缩短故障排除时间，使采集器更快恢复在线。
      </span>
    </PageHeader>

    <Row className="content">
      <Col md={12}>
        <SidecarFailureTrackingListContainer />
      </Col>
    </Row>
  </DocumentTitle>
);

export default SidecarFailureTrackingPage;
