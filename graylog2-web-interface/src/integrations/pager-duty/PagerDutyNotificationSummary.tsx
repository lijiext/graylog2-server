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

import CommonNotificationSummary from 'components/event-notifications/event-notification-types/CommonNotificationSummary';

import type { PagerDutyConfig } from './PagerDutyConfig';

type PagerDutyNotificationSummaryProps = {
  type: string;
  notification: {
    config: PagerDutyConfig;
  };
  definitionNotification: any;
};

function PagerDutyNotificationSummary({ notification, ...restProps }: PagerDutyNotificationSummaryProps) {
  return (
    <CommonNotificationSummary {...restProps} notification={notification}>
      <tr>
        <td>路由键</td>
        <td>
          <code>{notification?.config?.routing_key}</code>
        </td>
      </tr>
      <tr>
        <td>事件标题</td>
        <td>
          <code>{notification?.config?.pager_duty_title ?? 'Default'}</code>
        </td>
      </tr>
      <tr>
        <td>使用自定义事件键</td>
        <td>
          <code>{notification?.config?.custom_incident ? 'Yes' : 'No'}</code>
        </td>
      </tr>
      {notification?.config?.custom_incident && notification?.config?.key_prefix && (
        <tr>
          <td>事件键前缀</td>
          <td>
            <code>{notification?.config?.key_prefix}</code>
          </td>
        </tr>
      )}
      {notification?.config?.custom_incident && notification?.config?.incident_key && (
        <tr>
          <td>事件键</td>
          <td>
            <code>{notification?.config?.incident_key}</code>
          </td>
        </tr>
      )}
      <tr>
        <td>客户端名称</td>
        <td>
          <code>{notification?.config?.client_name}</code>
        </td>
      </tr>
      <tr>
        <td>客户端 URL</td>
        <td>
          <code>{notification?.config?.client_url}</code>
        </td>
      </tr>
    </CommonNotificationSummary>
  );
}

export default PagerDutyNotificationSummary;
