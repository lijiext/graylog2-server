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
import styled, { css } from 'styled-components';

import { Panel } from 'components/bootstrap';
import useProductName from 'brand-customization/useProductName';

export const StyledPanel = styled(Panel)<{ bsStyle: string }>(
  ({ bsStyle = 'default', theme }) => css`
    &.panel {
      background-color: ${theme.colors.global.contentBackground};

      .panel-heading {
        color: ${theme.colors.variant.darker[bsStyle]};
      }
    }
    margin-top: ${theme.spacings.md} !important;
  `,
);

const JwtAuthenticationInfo = () => {
  const productName = useProductName();

  return (
    <StyledPanel bsStyle="info">
      <Panel.Heading>
        <Panel.Title componentClass="h3">JWT 认证</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <p>
          根据您保护现有集群的方式，可能需要对安全配置进行一些初步更改。我们使用 JWT 认证从 $ 访问 OpenSearch{productName}在下一步中，您必须手动在现有的 OpenSearch 集群中启用 JWT 认证，以确保数据节点可以访问数据。
        </p>
        <p>
          为此，您应将以下代码段添加到您的 <code>opensearch-security/config.yml</code>
        </p>
        <pre>
          {`jwt_auth_domain:
          description: "Authenticate via Json Web Token"
          http_enabled: true
          transport_enabled: true
          order: 1
          http_authenticator:
            type: jwt
            challenge: false
            config:
              signing_key: "base64 encoded HMAC key or public RSA/ECDSA pem key"
              jwt_header: "Authorization"
              jwt_url_parameter: null
              roles_key: "os_roles"
              subject_key: null
          authentication_backend:
            type: noop`}
        </pre>
        <p>
          请使用您的 <code>GRAYLOG_PASSWORD_SECRET</code> 以 base64 编码。要对其进行编码，您可以运行
        </p>
        <pre>echo &quot;YOUR SECRET&quot; | base64</pre>
      </Panel.Body>
    </StyledPanel>
  );
};
export default JwtAuthenticationInfo;
