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

import { Col, Row } from 'components/bootstrap';
import { DocumentTitle, PageHeader } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import usePluginEntities from 'hooks/usePluginEntities';
import usePluggableLicenseCheck from 'hooks/usePluggableLicenseCheck';
import EventsPageNavigation from 'components/events/EventsPageNavigation';
import EventsEntityTable from 'components/events/EventsEntityTable';

const AlertsPageComponent = () => {
  const {
    data: { valid: validSecurityLicense },
  } = usePluggableLicenseCheck('/license/security');
  const pluggableSecurityEventsPage = usePluginEntities('views.components.securityEventsPage');

  if (!validSecurityLicense) {
    return <EventsEntityTable />;
  }

  return (
    <>
      {pluggableSecurityEventsPage.map(({ component: PluggableSecurityEventsPage }) => (
        <PluggableSecurityEventsPage />
      ))}
    </>
  );
};

const EventsPage = () => (
  <DocumentTitle title="告警与事件">
    <EventsPageNavigation />
    <PageHeader
      title="告警与事件"
      documentationLink={{
        title: 'Alerts documentation',
        path: DocsHelper.PAGES.ALERTS,
      }}>
      <span>
        通过不同条件定义事件。为需要您关注的事件添加通知以创建告警。
      </span>
    </PageHeader>

    <Row className="content">
      <Col md={12}>{AlertsPageComponent()}</Col>
    </Row>
  </DocumentTitle>
);

export default EventsPage;
