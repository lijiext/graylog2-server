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

const WhoisAdapterDocumentation = () => {
  const style = { marginBottom: 10 };

  return (
    <div>
      <p style={style}>whois IP 查找数据适配器可以请求 IP 地址的网络所有权信息。</p>

      <h3 style={style}>配置</h3>

      <h5 style={style}>连接超时</h5>

      <p style={style}>
        套接字连接到 whois 服务器的连接超时（毫秒）。如果将其设置为高值，可能会影响处理性能。
      </p>

      <h5 style={style}>读取超时</h5>

      <p style={style}>
        到 whois 服务器的套接字连接读取超时（毫秒）。如果将其设置为高值，可能会影响处理性能。
      </p>
    </div>
  );
};

export default WhoisAdapterDocumentation;
