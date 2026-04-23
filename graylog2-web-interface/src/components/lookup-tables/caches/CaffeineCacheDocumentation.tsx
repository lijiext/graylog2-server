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

import { Alert } from 'components/bootstrap';

const CaffeineCacheDocumentation = () => (
  <div>
    <p>内存缓存维护来自数据适配器的最近使用值。</p>
    <p>请确保您的 Graylog 服务器有足够的堆内存来容纳缓存条目，并监控缓存效率。</p>

    <Alert style={{ marginBottom: 10 }} bsStyle="info" title="实现细节">
      <p>缓存位于每个 Graylog 服务器本地，它们不共享条目。</p>
      <p>例如，如果您有两台服务器，它们将维护彼此完全独立的缓存。</p>
    </Alert>

    <hr />

    <h3 style={{ marginBottom: 10 }}>缓存大小</h3>
    <p>每个缓存都有最大条目数，不支持无界缓存。</p>

    <h3 style={{ marginBottom: 10 }}>基于时间的过期</h3>

    <h5 style={{ marginBottom: 10 }}>访问后过期</h5>
    <p style={{ marginBottom: 10, padding: 0 }}>
      缓存将在条目上次使用后的固定时间后移除它们。<br />
      这会导致缓存表现为空间受限的最近最少使用缓存。
    </p>

    <h5 style={{ marginBottom: 10 }}>写入后过期</h5>
    <p style={{ marginBottom: 10, padding: 0 }}>
      缓存将在条目进入缓存后经过固定时间后移除它们。<br />
      这会导致条目永远不会比给定时间更早，这对于经常变化的数据（如外部系统的配置状态）可能很重要。
    </p>

  </div>
);

export default CaffeineCacheDocumentation;
