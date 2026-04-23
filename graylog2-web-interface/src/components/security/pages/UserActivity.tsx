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

import { DocumentTitle } from 'components/common';
import TeaserSearch from 'components/security/teaser/TeaserSearch';
import viewJson from 'components/security/teaser/sample-dashboards/user_activity_view.json';
import searchJson from 'components/security/teaser/sample-dashboards/user_activity_search.json';
import resultJson from 'components/security/teaser/sample-dashboards/user_activity_results.json';

const hotspots = [
  {
    positionX: '67%',
    positionY: '260px',
    description: '快速查看是否存在令人担忧的失败登录趋势。',
  },
  {
    positionX: '40%',
    positionY: '500px',
    description: '按用户统计的登录成功与失败情况可帮助您发现异常账户和可疑活动。',
  },
  {
    positionX: '70%',
    positionY: '500px',
    description: '这些是产生大量告警的前 15 个用户账户！',
  },
  {
    positionX: '40%',
    positionY: '940px',
    description: '您的环境中最常见的身份和访问控制变更是什么？',
  },
  {
    positionX: '50%',
    positionY: '1300px',
    description: '了解访问控制变更最频繁的目标。',
  },
];

const UserActivity = () => (
  <DocumentTitle title="用户活动">
    <TeaserSearch viewJson={viewJson} searchJson={searchJson} searchJobResult={resultJson} hotspots={hotspots} />
  </DocumentTitle>
);

export default UserActivity;
