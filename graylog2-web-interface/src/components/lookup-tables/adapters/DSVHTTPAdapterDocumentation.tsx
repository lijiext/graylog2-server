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

import { MantineAccordion } from 'components/bootstrap';
import useProductName from 'brand-customization/useProductName';

const csvFile1 = `"127.0.0.1","localhost"
"10.0.0.1","server1"
"10.0.0.2","server2"`;

const csvFile2 = `'127.0.0.1';'e4:b2:11:d1:38:14'
'10.0.0.1';'e4:b2:12:d1:48:28'
'10.0.0.2';'e4:b2:11:d1:58:34'`;

const DSVHTTPAdapterDocumentation = () => {
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
            引号字符: <code>&#34;</code>
            <br />
          </p>

          <h5 style={{ marginBottom: 10 }}>DSV 文件</h5>
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
            引号字符: <code>&#39;</code>
            <br />
          </p>

          <h5 style={{ marginBottom: 10 }}>DSV 文件</h5>
          <pre>{csvFile2}</pre>
        </div>
      ),
    },
  ];

  return (
    <div>
      <p>DSV 数据适配器可以从 DSV 文件读取键值对（或检查键是否存在）。</p>
      <p>请确保您的 DSV 文件已按照配置设置进行格式化。</p>

      <h4>CSV 文件要求</h4>
      <p>
        该文件使用 <strong>utf-8</strong> encoding
      </p>
      <p>
        该文件可通过相同的 URL 访问，使用 <strong>every</strong> {productName} 服务器节点
      </p>

      <hr />

      <MantineAccordion accordionItems={accordionItems} defaultValue="example_1" />
    </div>
  );
};

export default DSVHTTPAdapterDocumentation;
