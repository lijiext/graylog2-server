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

import { Alert } from 'components/bootstrap';
import { ExternalLink } from 'components/common';

const StyledOl = styled.ol(
  ({ theme }) => css`
    padding-left: 20px;

    > li {
      margin-bottom: ${theme.spacings.sm};
    }

    > li:last-child {
      margin-bottom: 0;
    }
  `,
);

const GCSSetupInfo = () => (
  <Alert bsStyle="info">
    <p>要设置 Google Cloud Storage 后端，步骤如下： </p>
    <StyledOl>
      <li>
        Create a Google Cloud Storage Bucket with a unique name - see Google&lsquo;s documentation on{' '}
        <ExternalLink href="https://cloud.google.com/storage/docs/creating-buckets">存储桶</ExternalLink>。建议使用默认的 Standard Storage Class。
      </li>
      <li>
        Create a Google Cloud Service Account, with permissions to read/write/delete from that Bucket - see
        Google&lsquo;s documentation on{' '}
        <ExternalLink href="https://cloud.google.com/iam/docs/service-account-overview">服务账户</ExternalLink>.
      </li>
      <li>
        在所有 Graylog 节点上设置应用程序默认凭据。具体方法取决于集群的托管方式——请参阅 Google 的文档{' '}
        <ExternalLink href="https://cloud.google.com/docs/authentication/provide-credentials-adc#how-to">
          设置应用程序默认凭据
        </ExternalLink>
        .
      </li>
      <li>
        在此页面上，您现在可以设置 Google Cloud Storage 后端。您需要提供第一步中创建的 Google Cloud 存储的唯一名称。
      </li>
    </StyledOl>
  </Alert>
);

export default GCSSetupInfo;
