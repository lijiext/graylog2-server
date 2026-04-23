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

import type { PluginExports } from 'graylog-web-plugin/plugin';

import Routes from 'routing/Routes';
import filterMenuItems, { filterCloudMenuItems } from 'util/conditional/filterMenuItems';
import AppConfig from 'util/AppConfig';

export const SYSTEM_DROPDOWN_TITLE = '系统';

const navigationBindings: PluginExports = {
  navigation: [
    {
      path: Routes.SEARCH,
      description: '搜索',
    },
    {
      path: Routes.STREAMS,
      description: '数据流',
    },
    {
      path: Routes.ALERTS.LIST,
      description: '告警',
    },
    {
      path: Routes.DASHBOARDS,
      description: '仪表盘',
    },
    {
      description: SYSTEM_DROPDOWN_TITLE,
      position: 'last' as const,
      children: filterCloudMenuItems(
        filterMenuItems(
          [
            { path: Routes.SYSTEM.OVERVIEW, description: '概览' },
            { path: Routes.SYSTEM.CONFIGURATIONS, description: '配置', permissions: ['clusterconfigentry:read'] },
            { path: Routes.SYSTEM.NODES.LIST, description: 'Nodes' },
            { path: Routes.SYSTEM.DATANODES.LIST, description: '数据节点', permissions: ['datanodes:read'] },
            { path: Routes.SYSTEM.INPUTS, description: '输入端', permissions: ['inputs:read'] },
            { path: Routes.SYSTEM.OUTPUTS, description: '输出端', permissions: ['outputs:read'] },
            { path: Routes.SYSTEM.INDICES.LIST, description: '索引', permissions: ['indices:read'] },
            { path: Routes.SYSTEM.LOGGING, description: '日志记录', permissions: ['loggers:read'] },
            { path: Routes.SYSTEM.USERS.OVERVIEW, description: '用户与团队', permissions: ['users:list'] },
            { path: Routes.SYSTEM.AUTHZROLES.OVERVIEW, description: 'Roles', permissions: ['roles:read'] },
            { path: Routes.SYSTEM.AUTHENTICATION.BACKENDS.ACTIVE, description: '认证', permissions: ['authentication:edit'] },
            { path: Routes.SYSTEM.CONTENTPACKS.LIST, description: '内容包', permissions: ['contentpack:read'] },
            { path: Routes.SYSTEM.GROKPATTERNS, description: 'Grok 模式', permissions: ['grok_pattern:read'] },
            { path: Routes.SYSTEM.LOOKUPTABLES.OVERVIEW, description: '查找表', permissions: ['lookuptables:read'] },
            { path: Routes.SYSTEM.PIPELINES.OVERVIEW, description: '处理管道', permissions: ['pipeline:read', 'pipeline_connection:read'] },
            { path: Routes.SYSTEM.SIDECARS.OVERVIEW, description: 'Sidecars', permissions: ['sidecars:read'] },
          ],
          AppConfig.isCloud() && !AppConfig.isFeatureEnabled('cloud_inputs') ? [Routes.SYSTEM.INPUTS] : [],
        ),
        [Routes.SYSTEM.NODES.LIST, Routes.SYSTEM.DATANODES.LIST, Routes.SYSTEM.OUTPUTS, Routes.SYSTEM.LOGGING, Routes.SYSTEM.AUTHENTICATION.BACKENDS.ACTIVE],
      ),
    },
  ],
};

export default navigationBindings;
