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
import type User from 'logic/users/User';
import SectionComponent from 'components/common/Section/SectionComponent';

type Props = {
  user: User,
};

const ProfileSection = ({
  user: {
    username,
    fullName,
    firstName,
    lastName,
    email,
    clientAddress,
    lastActivity,
    sessionActive,
    accountStatus,
    authServiceEnabled,
  },
}: Props) => {
  const isOldUser = () => fullName && (!firstName && !lastName);

  return (
    <SectionComponent title="配置文件">
      <ReadOnlyFormGroup label="用户名" value={username} />
      {isOldUser() && <ReadOnlyFormGroup label="全名" value={fullName} />}
      <ReadOnlyFormGroup label="名" value={firstName} />
      <ReadOnlyFormGroup label="姓" value={lastName} />
      <ReadOnlyFormGroup label="电子邮件地址" value={email} />
      <ReadOnlyFormGroup label="客户端地址" value={clientAddress} />
      <ReadOnlyFormGroup label="最后活动" value={lastActivity} />
      <ReadOnlyFormGroup label="已登录" value={sessionActive} />
      <ReadOnlyFormGroup label="已启用"
                         value={accountStatus === 'enabled'}
                         help={(!authServiceEnabled && accountStatus === 'enabled') ? '认证服务已禁用，用户无法登录' : ''} />
    </SectionComponent>
  );
};

export default ProfileSection;
