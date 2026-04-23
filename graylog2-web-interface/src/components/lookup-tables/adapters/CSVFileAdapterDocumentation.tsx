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

import { MantineAccordion } from 'components/bootstrap';
import useProductName from 'brand-customization/useProductName';

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

const multiValueCsvFile = `"user_id","first_name","last_name","username","email"
"000001","User","One","user1","user.one@company.net"
"000002","User","Two","user2","u2@company.net"
"000003","Admin","One","admin1","admin@company.net"`;

const CSVFileAdapterDocumentation = () => {
  const productName = useProductName();

  const accordionItems = [
    {
      value: 'example_1',
      label: 'Example 1',
      content: (
        <div>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            Separator: <code>,</code>
            <br />
            引号字符: <code>"</code>
            <br />
            键列: <code>ipaddr</code>
            <br />
            值列: <code>hostname</code>
          </p>

          <h5 style={{ marginBottom: 10 }}>CSV 文件</h5>
          <pre>{csvFile1}</pre>
        </div>
      ),
    },
    {
      value: 'example_2',
      label: 'Example 2',
      content: (
        <div>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            Separator: <code>;</code>
            <br />
            引号字符: <code>'</code>
            <br />
            键列: <code>ipaddr</code>
            <br />
            值列: <code>hostname</code>
          </p>

          <h5 style={{ marginBottom: 10 }}>CSV 文件</h5>
          <pre>{csvFile2}</pre>
        </div>
      ),
    },
    {
      value: 'multi_value_example',
      label: 'Multi Value Example',
      content: (
        <div>
          <h3 style={{ marginBottom: 10 }}>多值示例</h3>

          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            Separator: <code>,</code>
            <br />
            引号字符: <code>"</code>
            <br />
            键列: <code>user_id</code>
            <br />
            值列: <code>first_name,last_name,username</code>
            <br />
            多值查找: <code>true</code>
          </p>

          <h5 style={{ marginBottom: 10 }}>CSV 文件</h5>
          <pre>{multiValueCsvFile}</pre>
        </div>
      ),
    },
    {
      value: 'cidr_lookups',
      label: 'CIDR Lookups',
      content: (
        <div>
          <p style={{ marginBottom: 10, padding: 0 }}>
            如果此数据适配器将用于将 IP 地址键与 CIDR 地址进行查找
            <br />
            然后它应标记为 CIDR 查找。例如:
            <br />
          </p>

          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            Separator: <code>,</code>
            <br />
            引号字符: <code>"</code>
            <br />
            键列: <code>cidr</code>
            <br />
            值列: <code>subnet</code>
            <br />
            CIDR 查找: <code>true</code>
          </p>

          <h5 style={{ marginBottom: 10 }}>CSV 文件</h5>
          <pre>{csvFile3}</pre>

          <p>
            给定此 CSV 文件和配置，查找键 192.168.101.64 将返回'IT Department subnet'。
          </p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <p>CSV 数据适配器可以从 CSV 文件中读取键值对。</p>
      <p>请确保您的 CSV 文件格式符合您的配置设置。</p>

      <h4>CSV 文件要求</h4>
      <p>CSV 文件的第一行需要是字段/列名的列表</p>
      <p>
        该文件使用 <strong>utf-8</strong> encoding
      </p>
      <p>
        文件可由 <strong>every</strong> {productName} 服务器节点
      </p>

      <hr />

      <MantineAccordion defaultValue="example_1" accordionItems={accordionItems} />
    </div>
  );
};

export default CSVFileAdapterDocumentation;
