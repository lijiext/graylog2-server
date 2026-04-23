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
import type { FieldValueProvider } from 'graylog-web-plugin';

import { IfPermitted } from 'components/common';

import CommonFieldValueProviderSummary from './CommonFieldValueProviderSummary';

type Props = React.ComponentProps<FieldValueProvider['summaryComponent']>;

const LookupTableFieldValueProviderSummary = ({ ...props }: Props) => {
  const provider = props.config.providers[0];

  return (
    <CommonFieldValueProviderSummary {...props}>
      <IfPermitted permissions="lookuptables:read">
        <>
          <tr>
            <td>值源</td>
            <td>查找表</td>
          </tr>
          <tr>
            <td>查找表</td>
            <td>{provider.table_name}</td>
          </tr>
          <tr>
            <td>查找表键字段</td>
            <td>{provider.key_field}</td>
          </tr>
        </>
      </IfPermitted>
    </CommonFieldValueProviderSummary>
  );
};

export default LookupTableFieldValueProviderSummary;
