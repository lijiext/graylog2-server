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

const OverriddenProfileExpandedSection = ({ type }: ExpandedSectionProps) => (
  <span>
    字段类型 <i>{type}</i> 来自单个自定义字段类型映射。它覆盖了来自搜索引擎索引映射的可能映射，要么立即生效（如果索引已轮转），要么在下次轮转期间生效。
  </span>
);

export default OverriddenProfileExpandedSection;
