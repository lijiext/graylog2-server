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
import viewJson from 'components/security/teaser/sample-dashboards/anomalies_view.json';
import searchJson from 'components/security/teaser/sample-dashboards/anomalies_search.json';
import resultJson from 'components/security/teaser/sample-dashboards/anomalies_results.json';

const hotspots = [
  {
    positionX: '50%',
    positionY: '110px',
    description: '获取正在运行的异常摘要，包括已检测到的异常数量，以及与上一时间段的对比。',
  },
  {
    positionX: '60%',
    positionY: '550px',
    description: '置信区间可告知您行为偏离正常状态的程度。',
  },
  {
    positionX: '40%',
    positionY: '910px',
    description: '存在用于检测不同类型异常的检测器——快速查看哪些正在生成告警。',
  },
  {
    positionX: '70%',
    positionY: '910px',
    description: '识别在登录或安全事件中存在异常行为的用户账户。',
  },
];
const Anomalies = () => (
  <DocumentTitle title="异常">
    <TeaserSearch viewJson={viewJson} searchJson={searchJson} searchJobResult={resultJson} hotspots={hotspots} />
  </DocumentTitle>
);

export default Anomalies;
