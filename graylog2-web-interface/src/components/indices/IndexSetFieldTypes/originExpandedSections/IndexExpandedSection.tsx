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

import type { ExpandedSectionProps } from 'components/indices/IndexSetFieldTypes/types';

const IndexExpandedSection = ({ type }: ExpandedSectionProps) => (
  <p>
    字段类型 <i>{type}</i> 来自搜索引擎索引映射。它可能是动态创建的，由 Graylog 实例设置，或者来自历史配置文件和/或自定义映射。
  </p>
);

export default IndexExpandedSection;
