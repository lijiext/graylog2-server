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

import { Link } from 'components/common/router';
import Routes from 'routing/Routes';
import useIndexProfileWithMappingsByField from 'components/indices/IndexSetFieldTypes/hooks/useIndexProfileWithMappingsByField';
import type { ExpandedSectionProps } from 'components/indices/IndexSetFieldTypes/types';

const OverriddenProfileExpandedSection = ({ type, fieldName }: ExpandedSectionProps) => {
  const { customFieldMappingsByField, name: profileName } = useIndexProfileWithMappingsByField();
  const profileFieldType = customFieldMappingsByField?.[fieldName];

  return (
    <div>
      字段类型 <i>{type}</i> 来自单个自定义字段类型映射。它不仅覆盖来自搜索引擎索引映射的可能映射，还覆盖映射 <b>{fieldName}: </b>
      <i>{profileFieldType}</i> 存在于个人资料中 <Link to={Routes.SYSTEM.INDICES.LIST}>{profileName}</Link>
    </div>
  );
};

export default OverriddenProfileExpandedSection;
