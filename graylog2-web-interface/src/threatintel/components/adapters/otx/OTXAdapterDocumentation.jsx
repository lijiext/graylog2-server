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
/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { ExternalLink } from 'components/common';

class OTXAdapterDocumentation extends React.Component {
  render() {
    const style = { marginBottom: 10 };

    return (
      <div>
        <p style={style}>
          AlienVault OTX 数据适配器使用 <ExternalLink href="https://otx.alienvault.com/api">OTX API</ExternalLink> 查找给定键的指标。
        </p>

        <h3 style={style}>配置</h3>

        <h5 style={style}>指标</h5>

        <p style={style}>
          OTX API 提供多种不同的入侵指标 (IOCs)。您必须选择此数据适配器应使用哪个指标。
        </p>
        <p style={style}>
          该 <code>IP 自动检测</code> 该指示器并非官方标准。我们添加此功能是为了能够自动检测 IP 地址类型，从而允许使用相同的数据适配器处理 IPv4 和 IPv6 地址。
        </p>

        <h5 style={style}>OTX API 密钥</h5>

        <p style={style}>
          OTX API 密钥用于对 API 请求进行认证。即使不输入 API 密钥，请求也能正常工作，但您很可能会受到更小的请求限制。 <strong>如果您使用此数据适配器处理生产流量，请注册 OTX 账户并获取 API 密钥。
                                                              </strong>
        </p>

        <h5 style={style}>OTX API URL</h5>

        <p style={style}>
          OTX API 服务器的 HTTP URL。默认设置为 <code>https://otx.alienvault.com</code> 除非您想使用自定义服务器运行某些测试，否则不应更改此内容。
        </p>

        <h5 style={style}>HTTP User-Agent</h5>

        <p style={style}>
          这将设置 <code>用户代理</code> OTX API 请求的 HTTP 请求头。您可以修改此内容以包含您的联系方式，以便在您的 API 请求出现问题时，OTX API 操作员能够联系您。
        </p>

        <h5 style={style}>HTTP 连接超时</h5>

        <p style={style}>
          OTX API 请求的 HTTP 连接超时时间（毫秒）。如果将其设置为较高值且 OTX API 连接缓慢，可能会影响处理性能。
        </p>

        <h5 style={style}>HTTP 写入超时</h5>

        <p style={style}>
          OTX API 请求的 HTTP 写入超时时间（毫秒）。如果将其设置为较高值且 OTX API 连接缓慢，则可能会影响处理性能。
        </p>

        <h5 style={style}>HTTP 读取超时</h5>

        <p style={style}>
          OTX API 请求的 HTTP 读取超时时间（毫秒）。如果将其设置为较高值且 OTX API 连接缓慢，可能会影响处理性能。
        </p>
      </div>
    );
  }
}

export default OTXAdapterDocumentation;
