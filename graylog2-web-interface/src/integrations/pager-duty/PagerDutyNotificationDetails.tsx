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

import { ReadOnlyFormGroup } from 'components/common';

import type { PagerDutyConfig } from './PagerDutyConfig';

type PagerDutyNotificationDetailsProps = {
  notification: {
    config: PagerDutyConfig;
  };
};

const PagerDutyNotificationDetails = ({ notification }: PagerDutyNotificationDetailsProps) => (
  <>
    <ReadOnlyFormGroup label="路由键" value={notification.config?.routing_key} />
    <ReadOnlyFormGroup label="事件标题" value={notification.config?.pager_duty_title} />
    <ReadOnlyFormGroup label="自定义事件" value={notification.config?.custom_incident} />
    {notification?.config?.custom_incident && notification.config?.key_prefix && (
      <ReadOnlyFormGroup label="键前缀" value={notification.config?.key_prefix} />
    )}
    {notification?.config?.custom_incident && notification.config?.incident_key && (
      <ReadOnlyFormGroup label="事件键" value={notification.config?.incident_key} />
    )}
    <ReadOnlyFormGroup label="客户端名称" value={notification.config?.client_name} />
    <ReadOnlyFormGroup label="客户端 URL" value={notification.config?.client_url} />
  </>
);

export default PagerDutyNotificationDetails;
