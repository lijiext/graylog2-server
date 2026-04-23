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
import { Well } from 'components/bootstrap';
import usePluggableLicenseCheck from 'hooks/usePluggableLicenseCheck';

import styles from '../event-notification-types/EmailNotificationSummary.css';

type EmailNotificationDetailsProps = {
  notification: any;
};

const EmailNotificationDetails = ({ notification }: EmailNotificationDetailsProps) => {
  const recipients = (
    <ReadOnlyFormGroup
      label="邮件收件人"
      value={
        notification.config.email_recipients.join(', ') ||
        'No email addresses are configured to receive this notification.'
      }
    />
  );
  const recipientLookupInfo = (
    <>
      <ReadOnlyFormGroup label="收件人邮箱查找表名称" value={notification.config.recipients_lut_name} />
      <ReadOnlyFormGroup label="收件人邮箱查找表键" value={notification.config.recipients_lut_key} />
    </>
  );
  const ccEmails = (
    <ReadOnlyFormGroup
      label="抄送邮箱"
      value={
        notification.config.cc_emails.join(', ') || "No email addresses are configured to be cc'd on this notification."
      }
    />
  );
  const ccLookupInfo = (
    <>
      <ReadOnlyFormGroup label="抄送邮箱查找表名称" value={notification.config.cc_emails_lut_name} />
      <ReadOnlyFormGroup label="抄送邮箱 查找表键" value={notification.config.cc_emails_lut_key} />
    </>
  );

  const bccEmails = (
    <ReadOnlyFormGroup
      label="密送邮箱"
      value={
        notification.config.bcc_emails.join(', ') ||
        "No email addresses are configured to be bcc'd on this notification."
      }
    />
  );
  const bccLookupInfo = (
    <>
      <ReadOnlyFormGroup label="BCC 邮件查找表名称" value={notification.config.bcc_emails_lut_name} />
      <ReadOnlyFormGroup label="BCC 电子邮件查找表键" value={notification.config.bcc_emails_lut_key} />
    </>
  );
  const sender = <ReadOnlyFormGroup label="发送者" value={notification.config.sender} />;
  const senderLookupInfo = (
    <>
      <ReadOnlyFormGroup label="发送方查找表名称" value={notification.config.sender_lut_name} />
      <ReadOnlyFormGroup label="发送方查找表键" value={notification.config.sender_lut_key} />
    </>
  );
  const replyTo = <ReadOnlyFormGroup label="回复至" value={notification.config.reply_to} />;
  const replyToLookupInfo = (
    <>
      <ReadOnlyFormGroup label="回复目标查找表名称" value={notification.config.reply_to_lut_name} />
      <ReadOnlyFormGroup label="回复查找表键" value={notification.config.reply_to_lut_key} />
    </>
  );

  return (
    <>
      <ReadOnlyFormGroup label="作为单封邮件发送" value={notification.config.single_email ? 'Yes' : 'No'} />
      <ReadOnlyFormGroup
        label="使用查找表进行发件人"
        value={notification.config.lookup_sender_email ? 'Yes' : 'No'}
      />
      {notification.config.lookup_sender_email ? senderLookupInfo : sender}
      <ReadOnlyFormGroup label="主题" value={notification.config.subject} />
      <ReadOnlyFormGroup
        label="使用查找表作为回复地址"
        value={notification.config.lookup_reply_to_email ? 'Yes' : 'No'}
      />
      {notification.config.lookup_reply_to_email ? replyToLookupInfo : replyTo}
      <ReadOnlyFormGroup
        label="用户收件人"
        value={notification.config.user_recipients.join(', ') || 'No users will receive this notification.'}
      />
      <ReadOnlyFormGroup
        label="使用查找表作为电子邮件收件人"
        value={notification.config.lookup_recipient_emails ? 'Yes' : 'No'}
      />
      {notification.config.lookup_recipient_emails ? recipientLookupInfo : recipients}
      <ReadOnlyFormGroup
        label="抄送用户"
        value={notification.config.cc_users.join(', ') || "No users will be cc'd on this notification."}
      />
      <ReadOnlyFormGroup
        label="使用查找表处理抄送邮箱"
        value={notification.config.lookup_cc_emails ? 'Yes' : 'No'}
      />
      {notification.config.lookup_cc_emails ? ccLookupInfo : ccEmails}
      <ReadOnlyFormGroup
        label="BCC 用户"
        value={notification.config.bcc_users.join(', ') || "No users will be bcc'd on this notification."}
      />
      <ReadOnlyFormGroup
        label="使用查找表处理密送邮箱"
        value={notification.config.lookup_bcc_emails ? 'Yes' : 'No'}
      />
      {notification.config.lookup_bcc_emails ? bccLookupInfo : bccEmails}
      <ReadOnlyFormGroup label="时区" value={notification.config.time_zone} />
      <ReadOnlyFormGroup
        label="邮件正文"
        value={
          <Well bsSize="small" className={styles.bodyPreview}>
            {notification.config.body_template || <em>空主体</em>}
          </Well>
        }
      />
      <ReadOnlyFormGroup
        label="电子邮件 HTML 正文"
        value={
          <Well bsSize="small" className={styles.bodyPreview}>
            {notification.config.html_body_template || <em>空主体</em>}
          </Well>
        }
      />
      {usePluggableLicenseCheck('/license/security')?.data?.valid && (
        <ReadOnlyFormGroup
          label="在邮件正文中包含事件过程"
          value={notification.config.include_event_procedure ? 'Yes' : 'No'}
        />
      )}
    </>
  );
};

export default EmailNotificationDetails;
