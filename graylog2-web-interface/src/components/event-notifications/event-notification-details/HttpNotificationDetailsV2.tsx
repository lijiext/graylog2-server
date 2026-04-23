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
import type { HttpEventNotificationV2 } from 'components/event-notifications/types';
import { Well } from 'components/bootstrap';

import styles from '../event-notification-types/EmailNotificationSummary.css';

type Props = {
  notification: HttpEventNotificationV2;
};

const HttpNotificationDetailsV2 = ({ notification }: Props) => {
  const apiKeySet: boolean = notification.config.api_secret?.is_set;
  const apiSentAs: string = notification.config.api_key_as_header ? 'Header' : 'Query Parameter';

  return (
    <>
      <ReadOnlyFormGroup label="URL" value={notification.config.url} />
      <ReadOnlyFormGroup
        label="基本认证"
        value={notification.config.basic_auth?.is_set ? '******' : null}
      />
      <ReadOnlyFormGroup label="API 密钥/密钥作为" value={apiKeySet ? apiSentAs : null} />
      <ReadOnlyFormGroup label="API 密钥" value={notification.config.api_key} />
      <ReadOnlyFormGroup label="API 密钥" value={apiKeySet ? '******' : null} />
      <ReadOnlyFormGroup label="方法" value={notification.config.method} />
      {notification.config.time_zone && <ReadOnlyFormGroup label="时区" value={notification.config.time_zone} />}
      {notification.config.content_type && (
        <ReadOnlyFormGroup label="内容类型" value={notification.config.content_type} />
      )}
      {notification.config.headers && <ReadOnlyFormGroup label="表头" value={notification.config.headers} />}
      {notification.config.body_template && (
        <ReadOnlyFormGroup
          label="主体模板"
          value={
            <Well bsSize="small" className={styles.bodyPreview}>
              {notification.config.body_template}
            </Well>
          }
        />
      )}
    </>
  );
};

export default HttpNotificationDetailsV2;
