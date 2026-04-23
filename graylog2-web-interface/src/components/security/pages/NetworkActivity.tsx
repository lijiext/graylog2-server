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
import viewJson from 'components/security/teaser/sample-dashboards/network_activity_view.json';
import searchJson from 'components/security/teaser/sample-dashboards/network_activity_search.json';
import resultJson from 'components/security/teaser/sample-dashboards/network_activity_results.json';

const hotspots = [
  {
    positionX: '50%',
    positionY: '230px',
    description: '立即查看网络中数据流的峰值。',
  },
  {
    positionX: '70%',
    positionY: '600px',
    description: '快速查看数据的来源和去向。',
  },
  {
    positionX: '70%',
    positionY: '1030px',
    description: '识别哪些用户通过网络发送了最多的数据。',
  },
  {
    positionX: '70%',
    positionY: '1450px',
    description: '检查 DNS 查询结果中是否存在异常模式，例如某个特定错误代码突然出现在前 15 名列表中。',
  },
  {
    positionX: '40%',
    positionY: '1850px',
    description: '按事件源生成的 DNS 请求最多的前 15 个平台。',
  },
];

const NetworkActivity = () => (
  <DocumentTitle title="网络活动">
    <TeaserSearch viewJson={viewJson} searchJson={searchJson} searchJobResult={resultJson} hotspots={hotspots} />
  </DocumentTitle>
);

export default NetworkActivity;
