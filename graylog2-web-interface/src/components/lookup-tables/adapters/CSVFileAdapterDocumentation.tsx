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

import { Alert } from 'components/bootstrap';

const CSVFileAdapterDocumentation = () => {
  const csvFile1 = `"ipaddr","hostname"
"127.0.0.1","localhost"
"10.0.0.1","server1"
"10.0.0.2","server2"`;

  const csvFile2 = `'ipaddr';'lladdr';'hostname'
'127.0.0.1';'e4:b2:11:d1:38:14';'localhost'
'10.0.0.1';'e4:b2:12:d1:48:28';'server1'
'10.0.0.2';'e4:b2:11:d1:58:34';'server2'`;

  const csvFile3 = `"cidr","subnet"
"192.168.100.0/24","Finance Department subnet"
"192.168.101.0/24","IT Department subnet"
"192.168.102.0/24","HR Department subnet"`;

  return (
    <div>
      <p>CSV 数据适配器可以从 CSV 文件读取键值对。</p>
      <p>请确保您的 CSV 文件格式符合您的配置设置。</p>

      <Alert style={{ marginBottom: 10 }} bsStyle="info" title="CSV 文件要求">
        <ul className="no-padding">
          <li>CSV 文件的第一行需要是字段/列名称列表</li>
          <li>文件使用 <strong>utf-8</strong> encoding</li>
          <li>文件可由以下用户读取 <strong>every</strong> Graylog 服务器节点</li>
        </ul>
      </Alert>

      <hr />

      <h3 style={{ marginBottom: 10 }}>示例 1</h3>

      <h5 style={{ marginBottom: 10 }}>配置</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        分隔符: <code>,</code><br />
        引号字符： <code>"</code><br />
        密钥列： <code>ipaddr</code><br />
        值列： <code>hostname</code>
      </p>

      <h5 style={{ marginBottom: 10 }}>CSV 文件</h5>
      <pre>{csvFile1}</pre>

      <h3 style={{ marginBottom: 10 }}>示例 2</h3>

      <h5 style={{ marginBottom: 10 }}>配置</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        分隔符: <code>;</code><br />
        引号字符： <code>'</code><br />
        密钥列： <code>ipaddr</code><br />
        值列： <code>hostname</code>
      </p>

      <h5 style={{ marginBottom: 10 }}>CSV 文件</h5>
      <pre>{csvFile2}</pre>

      <h3 style={{ marginBottom: 10 }}>CIDR 查找</h3>
      <p style={{ marginBottom: 10, padding: 0 }}>
        如果此数据适配器将用于根据 CIDR 地址查找 IP 地址键<br />
        则应标记为 CIDR 查找。例如：<br />
      </p>

      <h5 style={{ marginBottom: 10 }}>配置</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        分隔符: <code>,</code><br />
        引号字符： <code>"</code><br />
        密钥列： <code>cidr</code><br />
        值列： <code>subnet</code><br />
        CIDR 查找： <code>true</code>
      </p>

      <h5 style={{ marginBottom: 10 }}>CSV 文件</h5>
      <pre>{csvFile3}</pre>

      <p>给定此 CSV 文件和配置，查找键 192.168.101.64 将返回'IT 部门子网'。</p>
    </div>
  );
};

export default CSVFileAdapterDocumentation;
