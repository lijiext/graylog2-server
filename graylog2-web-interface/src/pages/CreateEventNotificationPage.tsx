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
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import { isPermitted } from 'util/PermissionsMixin';
import EventNotificationFormContainer from 'components/event-notifications/event-notification-form/EventNotificationFormContainer';
import EventsPageNavigation from 'components/events/EventsPageNavigation';
import useCurrentUser from 'hooks/useCurrentUser';
import useHistory from 'routing/useHistory';

const CreateEventDefinitionPage = () => {
  const currentUser = useCurrentUser();
  const history = useHistory();

  if (!isPermitted(currentUser.permissions, 'eventnotifications:create')) {
    history.push(Routes.NOTFOUND);
  }

  return (
    <DocumentTitle title="新通知">
      <EventsPageNavigation />
      <PageHeader title="新通知"
                  documentationLink={{
                    title: '告警文档',
                    path: DocsHelper.PAGES.ALERTS,
                  }}>
        <span>
          当配置的事件发生时，通知会提醒您。Graylog 可直接向您或您用于此目的的其他系统发送通知。
        </span>
      </PageHeader>

      <Row className="content">
        <Col md={12}>
          <EventNotificationFormContainer action="create" />
        </Col>
      </Row>
    </DocumentTitle>
  );
};

export default CreateEventDefinitionPage;
