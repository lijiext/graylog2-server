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
import * as React from 'react';
import styled, { css } from 'styled-components';

import { Title, Space, Tabs } from 'preflight/components/common';

import CACreateForm from './CACreateForm';
import CAUpload from './CAUpload';

const StyledTabs = styled(Tabs)(({ theme }) => css`
  button {
    font-size: ${theme.fonts.size.body};
  }
`);

const CAConfiguration = () => (
  <>
    <Title order={3}>配置证书颁发机构</Title>
    <p>
      在此第一步中，您可以上传或创建新的证书颁发机构。<br />
      使用它我们可以轻松地为您的数据节点配置证书。
    </p>
    <Space h="md" />
    <StyledTabs defaultValue="create">
      <Tabs.List>
        <Tabs.Tab value="create">创建新的 CA</Tabs.Tab>
        <Tabs.Tab value="upload">上传 CA</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="upload" pt="xs">
        <CAUpload />
      </Tabs.Panel>
      <Tabs.Panel value="create" pt="xs">
        <CACreateForm />
      </Tabs.Panel>
    </StyledTabs>
  </>
);

export default CAConfiguration;
