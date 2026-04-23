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

import { ExternalLink } from 'components/common';

const GreyNoiseAdapterDocumentation = () => (
  <div>
    <p style={{ marginBottom: 10 }}>
      GrayNoise 快速 IP 查找数据适配器使用{' '}
      <ExternalLink href="https://developer.greynoise.io/">Greynoise API</ExternalLink> 查找给定键的指标并返回 IP 快速上下文端点的值。参见{' '}
      <ExternalLink href="https://developer.greynoise.io/reference/ip-lookup-1#quickcheck-1">
        IP 快速上下文
      </ExternalLink>
    </p>
  </div>
);

export default GreyNoiseAdapterDocumentation;
