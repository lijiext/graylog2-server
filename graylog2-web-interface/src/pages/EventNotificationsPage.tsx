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
import { Button, Col, Row } from 'components/bootstrap';
import { DocumentTitle, IfPermitted, PageHeader } from 'components/common';
import EventNotificationsContainer from 'components/event-notifications/event-notifications/EventNotificationsContainer';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import EventsPageNavigation from 'components/events/EventsPageNavigation';

const EventNotificationsPage = () => (
  <DocumentTitle title="通知">
    <EventsPageNavigation />
    <PageHeader title="通知"
                actions={(
                  <IfPermitted permissions="eventnotifications:create">
                    <LinkContainer to={Routes.ALERTS.NOTIFICATIONS.CREATE}>
                      <Button bsStyle="success">创建通知</Button>
                    </LinkContainer>
                  </IfPermitted>
                  )}
                documentationLink={{
                  title: '告警文档',
                  path: DocsHelper.PAGES.ALERTS,
                }}>
      <span>
        当配置的事件发生时，通知会提醒您。Graylog 可直接向您或您用于此目的的其他系统发送通知。创建或编辑事件定义时，请记得分配通知。
      </span>
    </PageHeader>

    <Row className="content">
      <Col md={12}>
        <EventNotificationsContainer />
      </Col>
    </Row>
  </DocumentTitle>
);

export default EventNotificationsPage;
