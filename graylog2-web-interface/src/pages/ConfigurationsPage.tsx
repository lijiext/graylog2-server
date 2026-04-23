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
import { useMemo } from 'react';
import styled from 'styled-components';
import { Navigate, Routes, Route, useResolvedPath } from 'react-router-dom';
import URI from 'urijs';

import { isPermitted } from 'util/PermissionsMixin';
import ConfigletRow from 'pages/configurations/ConfigletRow';
import { Col, Nav, NavItem } from 'components/bootstrap';
import { DocumentTitle, PageHeader, Icon } from 'components/common';
import SearchesConfig from 'components/configurations/SearchesConfig';
import MessageProcessorsConfig from 'components/configurations/MessageProcessorsConfig';
import SidecarConfig from 'components/configurations/SidecarConfig';
import EventsConfig from 'components/configurations/EventsConfig';
import UrlWhiteListConfig from 'components/configurations/UrlWhiteListConfig';
import PermissionsConfig from 'components/configurations/PermissionsConfig';
import PluginsConfig from 'components/configurations/PluginsConfig';
import 'components/maps/configurations';
import useCurrentUser from 'hooks/useCurrentUser';
import { LinkContainer } from 'components/common/router';
import useLocation from 'routing/useLocation';

import ConfigurationSection from './configurations/ConfigurationSection';
import type { ConfigurationSectionProps } from './configurations/ConfigurationSection';

import DecoratorsConfig from '../components/configurations/DecoratorsConfig';
import UserConfig from '../components/configurations/UserConfig';

const SubNavIconClosed = styled(Icon)`
  margin-left: 5px;
  vertical-align: middle;
`;

const SubNavIconOpen = styled(Icon)`
  margin-left: 5px;
`;

type SectionLinkProps = {
  name: string,
  showCaret: boolean,
}

const SectionLink = ({ name, showCaret }: SectionLinkProps) => {
  const absolutePath = useResolvedPath(name);
  const location = useLocation();

  const isActive = URI(location.pathname).equals(absolutePath.pathname)
    || location.pathname.startsWith(absolutePath.pathname);

  return (
    <LinkContainer key={`nav-${name}`} to={name}>
      <NavItem title={name} active={isActive}>
        {name}
        {showCaret && (isActive ? <SubNavIconClosed name="arrow_right" /> : <SubNavIconOpen name="arrow_drop_down" />)}
      </NavItem>
    </LinkContainer>
  );
};

const ConfigurationsPage = () => {
  const currentUser = useCurrentUser();

  const configurationSections: Array<{
    name: string,
    hide?: boolean,
    SectionComponent: React.ComponentType<ConfigurationSectionProps | {}>,
    props?: ConfigurationSectionProps,
    showCaret?: boolean,
    catchAll?: boolean,
  }> = useMemo(() => [
    {
      name: '搜索',
      SectionComponent: ConfigurationSection,
      props: {
        ConfigurationComponent: SearchesConfig,
        title: '搜索',
      },
    },
    {
      name: '消息处理器',
      SectionComponent: ConfigurationSection,
      props: {
        ConfigurationComponent: MessageProcessorsConfig,
        title: '消息处理器',
      },
    },
    {
      name: 'Sidecars',
      SectionComponent: ConfigurationSection,
      props: {
        ConfigurationComponent: SidecarConfig,
        title: 'Sidecars',
      },
    },
    {
      name: '事件',
      SectionComponent: ConfigurationSection,
      props: {
        ConfigurationComponent: EventsConfig,
        title: '事件',
      },

    },
    {
      name: 'URL 白名单',
      hide: !isPermitted(currentUser.permissions, ['urlwhitelist:read']),
      SectionComponent: ConfigurationSection,
      props: {
        ConfigurationComponent: UrlWhiteListConfig,
        title: 'URL 白名单',
      },
    },
    {
      name: '装饰器',
      SectionComponent: ConfigurationSection,
      props: {
        ConfigurationComponent: DecoratorsConfig,
        title: '装饰器',
      },
    },
    {
      name: '权限',
      SectionComponent: ConfigurationSection,
      props: {
        ConfigurationComponent: PermissionsConfig,
        title: '权限',
      },
    },
    {
      name: 'Users',
      SectionComponent: ConfigurationSection,
      props: {
        ConfigurationComponent: UserConfig,
        title: '索引集默认值',
      },
    },
    {
      name: '插件',
      SectionComponent: PluginsConfig,
      showCaret: true,
      catchAll: true,
    },
  ].filter(({ hide }) => !hide), [currentUser?.permissions]);

  return (
    <DocumentTitle title="配置">
      <PageHeader title="配置">
        <span>
          您可以在本页配置不同子系统的系统设置。
        </span>
      </PageHeader>

      <ConfigletRow className="content">
        <Col md={2}>
          <Nav bsStyle="pills" stacked>
            {configurationSections.map(({ name, showCaret }) => (
              <SectionLink key={`nav-${name}`} name={name} showCaret={showCaret} />
            ))}
          </Nav>
        </Col>

        <Routes>
          <Route path="/" element={<Navigate to={configurationSections[0].name} replace />} />
          {configurationSections.flatMap(({ catchAll, name, props = {}, SectionComponent }) => (
            <Route path={catchAll ? `${name}/*` : name}
                   key={name}
                   element={<SectionComponent {...props} key={name} />} />
          ))}
        </Routes>
      </ConfigletRow>
    </DocumentTitle>
  );
};

export default ConfigurationsPage;
