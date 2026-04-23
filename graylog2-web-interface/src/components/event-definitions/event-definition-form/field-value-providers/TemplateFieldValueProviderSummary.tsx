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

import CommonFieldValueProviderSummary from './CommonFieldValueProviderSummary';

type Props = React.ComponentProps<FieldValueProvider['summaryComponent']>;

const TemplateFieldValueProviderSummary = ({ ...props }: Props) => {
  const { config } = props;

  return (
    <CommonFieldValueProviderSummary {...props}>
      <>
        <tr>
          <td>值源</td>
          <td>模板</td>
        </tr>
        <tr>
          <td>模板</td>
          <td>{config.providers[0].template}</td>
        </tr>
        <tr>
          <td>验证所有模板值是否已设置</td>
          <td>{config.providers[0].require_values ? 'Yes' : 'No'}</td>
        </tr>
      </>
    </CommonFieldValueProviderSummary>
  );
};

export default TemplateFieldValueProviderSummary;
