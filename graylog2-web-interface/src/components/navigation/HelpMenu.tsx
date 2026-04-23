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

import { NavDropdown } from 'components/bootstrap';
import { Icon, IfPermitted } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';
import useHotkeysContext from 'hooks/useHotkeysContext';
import Menu from 'components/bootstrap/Menu';
import NavIcon from 'components/navigation/NavIcon';

const HelpMenuLinkItem = ({ href, children = undefined }: React.PropsWithChildren<{ href: string }>) => (
  <Menu.Item component="a" href={href} target="_blank" leftSection={<Icon name="open_in_new" />}>
    {children}
  </Menu.Item>
);

const HelpMenu = () => {
  const { setShowHotkeysModal } = useHotkeysContext();

  return (
    <NavDropdown title={<NavIcon type="help" />} hoverTitle="Help" noCaret>
      <HelpMenuLinkItem href={DocsHelper.versionedDocsHomePage()}>文档</HelpMenuLinkItem>

      <Menu.Item onClick={() => setShowHotkeysModal(true)}>键盘快捷键</Menu.Item>

      <IfPermitted permissions="api_browser:read">
        <HelpMenuLinkItem href={Routes.global_api_browser()}>集群全局 API 浏览器</HelpMenuLinkItem>
      </IfPermitted>
    </NavDropdown>
  );
};

export default HelpMenu;
