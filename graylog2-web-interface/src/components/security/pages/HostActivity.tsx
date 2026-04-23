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
import viewJson from 'components/security/teaser/sample-dashboards/host_activity_view.json';
import searchJson from 'components/security/teaser/sample-dashboards/host_activity_search.json';
import resultJson from 'components/security/teaser/sample-dashboards/host_activity_results.json';

const hotspots = [
  {
    positionX: '50%',
    positionY: '120px',
    description: '通过趋势信息概览您的高、中、低级别告警数量，以判断这是否是一个正常的办公日……或者不是。',
  },
  {
    positionX: '40%',
    positionY: '480px',
    description: '立即识别哪些主机正在产生高告警，以缩短平均修复时间 (MTTR)。',
  },
  {
    positionX: '65%',
    positionY: '950px',
    description: '查看哪种技术产生的登录最多。',
  },
  {
    positionX: '40%',
    positionY: '1350px',
    description: '当身份和访问控制变更来自意外机器时，启动调查。',
  },
  {
    positionX: '80%',
    positionY: '1730px',
    description: '按事件源统计的消息数量可让您每日查看数据中的常规模式，超出正常范围的峰值将触发调查以查明原因。',
  },
];

const HostActivity = () => (
  <DocumentTitle title="主机活动">
    <TeaserSearch viewJson={viewJson} searchJson={searchJson} searchJobResult={resultJson} hotspots={hotspots} />
  </DocumentTitle>
);

export default HostActivity;
