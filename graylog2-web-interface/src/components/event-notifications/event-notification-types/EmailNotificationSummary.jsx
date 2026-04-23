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
import PropTypes from 'prop-types';

import { Well } from 'components/bootstrap';

import CommonNotificationSummary from './CommonNotificationSummary';
import styles from './EmailNotificationSummary.css';

const EmailNotificationSummary = ({ notification, ...otherProps }) => (
  <CommonNotificationSummary notification={notification} {...otherProps}>
    <>
      <tr>
        <td>使用查找表进行发件人</td>
        <td>{notification.config.lookup_sender_email ? '是' : '否'}</td>
      </tr>
      {notification.config.lookup_sender_email ? (
        <>
          <tr>
            <td>发件人邮箱查找表名称</td>
            <td>{notification.config.sender_lut_name}</td>
          </tr>
          <tr>
            <td>发件人邮箱查找表键</td>
            <td>{notification.config.sender_lut_key}</td>
          </tr>
        </>
      )
        : (
          <tr>
            <td>发送者</td>
            <td>{notification.config.sender}</td>
          </tr>
        )}
      <tr>
        <td>主题</td>
        <td>{notification.config.subject}</td>
      </tr>
      <tr>
        <td>使用查找表作为回复地址</td>
        <td>{notification.config.lookup_reply_to_email ? '是' : '否'}</td>
      </tr>
      {notification.config.lookup_reply_to_email ? (
        <>
          <tr>
            <td>回复邮箱查找表名称</td>
            <td>{notification.config.reply_to_lut_name}</td>
          </tr>
          <tr>
            <td>回复邮箱查找表键</td>
            <td>{notification.config.reply_to_lut_key}</td>
          </tr>
        </>
      )
        : (
          <tr>
            <td>回复至</td>
            <td>{notification.config.reply_to}</td>
          </tr>
        )}

      <tr>
        <td>用户收件人</td>
        <td>{notification.config.user_recipients.join(', ') || 'No users will receive this notification.'}</td>
      </tr>
      <tr>
        <td>使用查找表作为电子邮件收件人</td>
        <td>{notification.config.lookup_recipient_emails ? '是' : '否'}</td>
      </tr>
      {notification.config.lookup_recipient_emails ? (
        <>
          <tr>
            <td>收件人邮箱查找表名称</td>
            <td>{notification.config.recipients_lut_name}</td>
          </tr>
          <tr>
            <td>收件人邮箱查找表键</td>
            <td>{notification.config.recipients_lut_key}</td>
          </tr>
        </>
      )
        : (
          <tr>
            <td>邮件收件人</td>
            <td>
              {notification.config.email_recipients.join(', ') || 'No email addresses are configured to receive this notification.'}
            </td>
          </tr>
        )}
      <tr>
        <td>邮件正文</td>
        <td>
          <Well bsSize="small" className={styles.bodyPreview}>
            {notification.config.body_template || <em>空主体</em>}
          </Well>
        </td>
      </tr>
      <tr>
        <td>电子邮件 HTML 正文</td>
        <td>
          <Well bsSize="small" className={styles.bodyPreview}>
            {notification.config.html_body_template || <em>空的 HTML 正文</em>}
          </Well>
        </td>
      </tr>
    </>
  </CommonNotificationSummary>
);

EmailNotificationSummary.propTypes = {
  type: PropTypes.string.isRequired,
  notification: PropTypes.object,
  definitionNotification: PropTypes.object.isRequired,
};

EmailNotificationSummary.defaultProps = {
  notification: {},
};

export default EmailNotificationSummary;
