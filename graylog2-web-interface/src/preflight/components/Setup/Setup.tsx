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
import styled from 'styled-components';

import DocsHelper from 'util/DocsHelper';
import Section from 'preflight/components/common/Section';
import DataNodesOverview from 'preflight/components/Setup/DataNodesOverview';
import DocumentationLink from 'components/support/DocumentationLink';
import ConfigurationWizard from 'preflight/components/ConfigurationWizard';

const P = styled.p`
  max-width: 700px;
`;

type Props = {
  setIsWaitingForStartup: React.Dispatch<React.SetStateAction<boolean>>;
};

const Setup = ({ setIsWaitingForStartup }: Props) => (
  <>
    <Section title="欢迎！" titleOrder={1} dataTestid="welcome-section">
      <P>
        您似乎首次启动 Graylog，且尚未配置数据节点。
        <br />
        数据节点允许您对 Graylog 消息数据库中的所有消息进行索引和搜索。
      </P>
      <P>
        您可以选择实现{' '}
        <DocumentationLink page={DocsHelper.PAGES.GRAYLOG_DATA_NODE} text="Graylog data node" /> （推荐）或者您可以配置一个 <DocumentationLink page={DocsHelper.PAGES.OPEN_SEARCH_SETUP} text="OpenSearch" /> 手动配置节点。对于手动 OpenSearch 配置，您需要调整 Graylog 配置并重启 Graylog 服务器。重启后，此页面将不再显示。
      </P>
    </Section>
    <Section title="Graylog 数据节点" titleOrder={2}>
      <DataNodesOverview />
      <ConfigurationWizard setIsWaitingForStartup={setIsWaitingForStartup} />
    </Section>
  </>
);

export default Setup;
