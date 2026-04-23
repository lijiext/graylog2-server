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
/* eslint-disable no-template-curly-in-string */
import React from 'react';

import { Col, Row, MantineAccordion } from 'components/bootstrap';

const exampleJSON = `{
  "user": {
    "login": "jane",
    "full_name": "Jane Doe",
    "roles": ["admin", "developer"],
    "contact": {
      "email": "jane@example.com",
      "cellphone": "+49123456789"
    }
  }
}`;
const noMultiResult = '{"value": "Jane Doe"}';
const mapResult = `{
  "login": "jane",
  "full_name": "Jane Doe",
  "roles": ["admin", "developer"],
  "contact": {
    "email": "jane@example.com",
    "cellphone": "+49123456789"
  }
}`;
const smallMapResult = `{
  "email": "jane@example.com",
  "cellphone": "+49123456789"
}`;
const listResult = `{
  "value": ["admin", "developer"]
}`;
const pipelineRule = `rule "lookup user"
when has_field("user_login")
then
  // Get the user login from the message
  let userLogin = to_string($message.user_login);
  // Lookup the single value, in our case the full name, in the user-api lookup table
  let userName = lookup_value("user-api", userLogin);
  // Set the field "user_name" in the message
  set_field("user_name", userName)

  // Lookup the multi value in the user-api lookup table
  let userData = lookup("user-api", userLogin);
  // Set the email and cellphone as fields in the message
  set_field("user_email", userData["email"]);
  set_field("user_cellphone", userData["cellphone"]);
end`;

const HTTPJSONPathAdapterDocumentation = () => {
  const accordionItems = [
    {
      value: 'lookup_url',
      label: 'Lookup URL',
      content: (
        <div>
          <p style={{ marginBottom: 10, padding: 0 }}>
            将用于 HTTP 请求的 URL。若要使用 <em>查找键</em> 在 URL 中，
            <code>{'${key}'}</code>
            值可被使用。此变量将被替换为传递给查找函数的实际键。{' '}
            <br />
            (示例： <code>{'https://example.com/api/lookup?key=${key}'}</code>)
          </p>
        </div>
      ),
    },
    {
      value: 'single_value',
      label: 'Single value JSONPath',
      content: (
        <div>
          <p style={{ marginBottom: 10, padding: 0 }}>
            此 JSONPath 表达式将用于解析 <em>单个值</em> 查找结果的一部分。（示例：{' '}
            <code>$.user.full_name</code>)
          </p>
        </div>
      ),
    },
    {
      value: 'multi_value',
      label: 'Multi value JSONPath',
      content: (
        <div>
          <p style={{ marginBottom: 10, padding: 0 }}>
            此 JSONPath 表达式将用于解析 <em>多值</em> 查找结果的一部分。（示例：{' '}
            <code>$.users[*]</code>) 多值 JSONPath 设置是 <em>optional</em>。如果没有它，单个值也会出现在多值结果中。
          </p>
        </div>
      ),
    },
    {
      value: 'http_useragent',
      label: 'HTTP User-Agent',
      content: (
        <div>
          <p style={{ marginBottom: 10, padding: 0 }}>
            这是 <em>用户代理</em> 将用于 HTTP 请求的标头。您应包含一些联系信息，以便您查询的服务所有者在出现问题时知道联系谁（例如来自您集群的过多 API 请求）。
          </p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <p>
        HTTPJSONPath 数据适配器执行 <em>HTTP GET</em> 请求查找键并根据配置的 JSONPath 表达式解析结果。
      </p>

      <p>
        每个查找表结果都有两个值。A <em>单个值</em> 并且 <em>多值</em>. 当查找结果预期为字符串、数字或布尔值时，将使用单值。当查找结果预期为映射或列表时，将使用多值。
      </p>

      <h3 style={{ marginBottom: 10 }}>配置</h3>

      <MantineAccordion accordionItems={accordionItems} defaultValue="lookup_url" />

      <hr />

      <h3 style={{ marginBottom: 10 }}>示例</h3>
      <p>
        此示例配置将显示从查找表返回的值。
        <br />
        配置的 URL 是 <strong>{'https://example.com/api/users/${key}'}</strong> 并且 <code>{'${key}'}</code>
        将被替换为 <strong>jane</strong> 在查找请求期间。
      </p>
      <p>这是生成的 JSON 文档:</p>
      <pre>{exampleJSON}</pre>

      <Row>
        <Col md={4}>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单个值 JSONPath: <code>$.user.full_name</code>
            <br />
            多值 JSONPath: <em>empty</em>
            <br />
          </p>
        </Col>
        <Col md={8}>
          <h5 style={{ marginBottom: 10 }}>结果</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值: <code>Jane Doe</code>
            <br />
            多值:
          </p>
          <pre>{noMultiResult}</pre>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单个值 JSONPath: <code>$.user.full_name</code>
            <br />
            多值 JSONPath: <code>$.用户</code>
            <br />
          </p>
        </Col>
        <Col md={8}>
          <h5 style={{ marginBottom: 10 }}>结果</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值: <code>Jane Doe</code>
            <br />
            多值:
          </p>
          <pre>{mapResult}</pre>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单个值 JSONPath: <code>$.user.contact.email</code>
            <br />
            多值 JSONPath: <code>$.user.roles[*]</code>
            <br />
          </p>
        </Col>
        <Col md={8}>
          <h5 style={{ marginBottom: 10 }}>结果</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值: <code>jane@example.com</code>
            <br />
            多值:
          </p>
          <pre>{listResult}</pre>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单个值 JSONPath: <code>$.user.full_name</code>
            <br />
            多值 JSONPath: <code>$.user.contact</code>
            <br />
          </p>
        </Col>
        <Col md={8}>
          <h5 style={{ marginBottom: 10 }}>结果</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值: <code>Jane Doe</code>
            <br />
            多值:
          </p>
          <pre>{smallMapResult}</pre>
        </Col>
      </Row>

      <h5 style={{ marginBottom: 10 }}>管道规则</h5>
      <p>这是一个示例管道规则，使用了我们上一个配置示例中的示例数据。</p>
      <pre>{pipelineRule}</pre>
    </div>
  );
};

export default HTTPJSONPathAdapterDocumentation;
