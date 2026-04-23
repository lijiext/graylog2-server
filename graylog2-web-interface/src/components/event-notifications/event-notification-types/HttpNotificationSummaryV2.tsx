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

import { Well } from 'components/bootstrap';

import CommonNotificationSummary from './CommonNotificationSummary';
import styles from './EmailNotificationSummary.css';

type Props = {
  type: string,
  notification: any,
  definitionNotification: any,
};

const HttpNotificationSummaryV2 = ({ type, notification, definitionNotification } : Props) => (
  <CommonNotificationSummary type={type}
                             notification={notification}
                             definitionNotification={definitionNotification}>
    <tr>
      <td>URL</td>
      <td><code>{notification.config.url}</code></td>
    </tr>
    <tr>
      <td>方法</td>
      <td><code>{notification.config.method}</code></td>
    </tr>
    {notification.config.content_type && (
    <tr>
      <td>内容类型</td>
      <td><code>{notification.config.content_type}</code></td>
    </tr>
    )}
    {notification.config.headers && (
    <tr>
      <td>标头</td>
      <td><code>{notification.config.headers}</code></td>
    </tr>
    )}
    {notification.config.body_template && (
    <tr>
      <td>正文模板</td>
      <td>
        <Well bsSize="small" className={styles.bodyPreview}>
          {notification.config.body_template}
        </Well>
      </td>
    </tr>
    )}
  </CommonNotificationSummary>
);

export default HttpNotificationSummaryV2;
