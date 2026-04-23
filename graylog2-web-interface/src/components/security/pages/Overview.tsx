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
import viewJson from 'components/security/teaser/sample-dashboards/overview_view.json';
import searchJson from 'components/security/teaser/sample-dashboards/overview_search.json';
import resultJson from 'components/security/teaser/sample-dashboards/overview_results.json';

const hotspots = [
  {
    positionX: '15%',
    positionY: '50px',
    description: '在“概览”标签页中快速找到您最重要的安全信息。',
  },
  {
    positionX: '50%',
    positionY: '350px',
    description: '查找高危告警、主要事件源等，助您深入了解安全态势。',
  },
  {
    positionX: '75%',
    positionY: '580px',
    description: '在此页面中悬停这些工具提示，以了解 Graylog Security 的功能',
  },
];
const Overview = () => (
  <DocumentTitle title="概述">
    <TeaserSearch viewJson={viewJson} searchJson={searchJson} searchJobResult={resultJson} hotspots={hotspots} />
  </DocumentTitle>
);

export default Overview;
