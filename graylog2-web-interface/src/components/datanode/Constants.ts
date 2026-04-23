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

export const MIGRATION_STEP = {
  CA_CONFIGURATION: {
    key: 'CA_CONFIGURATION',
    description: '配置证书颁发机构',
  },
  RENEWAL_POLICY_CONFIGURATION: {
    key: 'RENEWAL_POLICY_CONFIGURATION',
    description: '配置续订策略',
  },
  COMPATIBILITY_CHECK: {
    key: 'COMPATIBILITY_CHECK',
    description: '检查与 datanode 的 OpenSearch 兼容性',
  },
  MANUAL_MIGRATION_STEP: {
    key: 'MANUAL_MIGRATION_STEP',
    description: '迁移步骤。',
  },
  MIGRATION_FINISHED: {
    key: 'MIGRATION_FINISHED',
    description: '迁移完成',
  },
} as const;

export const MIGRATION_STATE = {
  NEW: {
    key: 'NEW',
    description: '迁移',
  },
  MIGRATION_WELCOME_PAGE: {
    key: 'MIGRATION_WELCOME_PAGE',
    description: '欢迎',
  },
  CA_CREATION_PAGE: {
    key: 'CA_CREATION_PAGE',
    description: '证书颁发机构',
  },
  RENEWAL_POLICY_CREATION_PAGE: {
    key: 'RENEWAL_POLICY_CREATION_PAGE',
    description: '证书续期策略',
  },
  MIGRATION_SELECTION_PAGE: {
    key: 'MIGRATION_SELECTION_PAGE',
    description: '迁移步骤',
  },
  ROLLING_UPGRADE_MIGRATION_WELCOME_PAGE: {
    key: 'ROLLING_UPGRADE_MIGRATION_WELCOME_PAGE',
    description: '欢迎使用原地迁移',
  },
  ASK_TO_SHUTDOWN_OLD_CLUSTER: {
    key: 'ASK_TO_SHUTDOWN_OLD_CLUSTER',
    description: '关闭旧集群',
  },
  MANUALLY_REMOVE_OLD_CONNECTION_STRING_FROM_CONFIG: {
    key: 'MANUALLY_REMOVE_OLD_CONNECTION_STRING_FROM_CONFIG',
    description: '移除连接字符串',
  },
  MESSAGE_PROCESSING_STOP: {
    key: 'MESSAGE_PROCESSING_STOP',
    description: '停止消息处理',
  },
  REPLACE_CLUSTER: {
    key: 'REPLACE_CLUSTER',
    description: '替换现有集群',
  },
  RESTART_GRAYLOG: {
    key: 'RESTART_GRAYLOG',
    description: '更新配置文件并重启 Graylog',
  },
  REMOTE_REINDEX_WELCOME_PAGE: {
    key: 'REMOTE_REINDEX_WELCOME_PAGE',
    description: '远程重新索引迁移',
  },
  PROVISION_DATANODE_CERTIFICATES_PAGE: {
    key: 'PROVISION_DATANODE_CERTIFICATES_PAGE',
    description: '使用证书配置数据节点',
  },
  PROVISION_DATANODE_CERTIFICATES_RUNNING: {
    key: 'PROVISION_DATANODE_CERTIFICATES_RUNNING',
    description: "配置数据节点的证书。",
  },
  EXISTING_DATA_MIGRATION_QUESTION_PAGE: {
    key: 'EXISTING_DATA_MIGRATION_QUESTION_PAGE',
    description: '迁移现有数据的问题',
  },
  MIGRATE_EXISTING_DATA: {
    key: 'MIGRATE_EXISTING_DATA',
    description: '迁移现有数据',
  },
  REMOTE_REINDEX_RUNNING: {
    key: 'REMOTE_REINDEX_RUNNING',
    description: '远程重新索引迁移正在运行',
  },
  DIRECTORY_COMPATIBILITY_CHECK_PAGE: {
    key: 'DIRECTORY_COMPATIBILITY_CHECK_PAGE',
    description: '目录兼容性检查',
  },
  PROVISION_ROLLING_UPGRADE_NODES_WITH_CERTIFICATES: {
    key: 'PROVISION_ROLLING_UPGRADE_NODES_WITH_CERTIFICATES',
    description: '证书配置概览',
  },
  PROVISION_ROLLING_UPGRADE_NODES_RUNNING: {
    key: 'PROVISION_ROLLING_UPGRADE_NODES_RUNNING',
    description: "配置数据节点的证书。",
  },
  JOURNAL_SIZE_DOWNTIME_WARNING: {
    key: 'JOURNAL_SIZE_DOWNTIME_WARNING',
    description: 'Journal 大小停机警告',
  },
  FAILED: {
    key: 'FAILED',
    description: '迁移失败',
  },
  FINISHED: {
    key: 'FINISHED',
    description: '迁移完成',
  },
} as const;

export const IN_PLACE_MIGRATION_STEPS = [
  MIGRATION_STATE.ROLLING_UPGRADE_MIGRATION_WELCOME_PAGE.key,
  MIGRATION_STATE.DIRECTORY_COMPATIBILITY_CHECK_PAGE.key,
  MIGRATION_STATE.PROVISION_ROLLING_UPGRADE_NODES_RUNNING.key,
  MIGRATION_STATE.JOURNAL_SIZE_DOWNTIME_WARNING.key,
  MIGRATION_STATE.MESSAGE_PROCESSING_STOP.key,
  MIGRATION_STATE.RESTART_GRAYLOG.key,
];
export const REMOTE_REINDEXING_MIGRATION_STEPS = [
  MIGRATION_STATE.REMOTE_REINDEX_WELCOME_PAGE.key,
  MIGRATION_STATE.PROVISION_DATANODE_CERTIFICATES_RUNNING.key,
  MIGRATION_STATE.EXISTING_DATA_MIGRATION_QUESTION_PAGE.key,
  MIGRATION_STATE.MIGRATE_EXISTING_DATA.key,
  MIGRATION_STATE.REMOTE_REINDEX_RUNNING.key,
  MIGRATION_STATE.ASK_TO_SHUTDOWN_OLD_CLUSTER.key,
];

export const MIGRATION_WIZARD_STEPS = [
  MIGRATION_STATE.NEW.key,
  MIGRATION_STATE.MIGRATION_WELCOME_PAGE.key,
  MIGRATION_STATE.CA_CREATION_PAGE.key,
  MIGRATION_STATE.RENEWAL_POLICY_CREATION_PAGE.key,
  MIGRATION_STATE.MIGRATION_SELECTION_PAGE.key,
  MIGRATION_STATE.FINISHED.key,
];

export const MIGRATION_ACTIONS = {
  SHOW_RENEWAL_POLICY_CREATION: {
    key: 'SHOW_RENEWAL_POLICY_CREATION',
    label: '配置证书续期策略',
  },
  SHOW_MIGRATION_SELECTION: {
    key: 'SHOW_MIGRATION_SELECTION',
    label: '前往迁移步骤',
  },
  RUN_DIRECTORY_COMPATIBILITY_CHECK: {
    key: 'INSTALL_DATANODES_ON_EVERY_NODE',
    label: '运行目录兼容性检查',
  },
  PROVISION_DATANODE_CERTIFICATES: {
    key: 'PROVISION_DATANODE_CERTIFICATES',
    label: '使用证书配置数据节点',
  },
  SKIP_EXISTING_DATA_MIGRATION: {
    key: 'SKIP_EXISTING_DATA_MIGRATION',
    label: '跳过现有数据迁移',
  },
  RETRY_MIGRATE_EXISTING_DATA: {
    key: 'RETRY_MIGRATE_EXISTING_DATA',
    label: '重试迁移现有数据',
  },
  CHECK_REMOTE_INDEXER_CONNECTION: {
    key: 'CHECK_REMOTE_INDEXER_CONNECTION',
    label: '检查连接',
  },
  START_REMOTE_REINDEX_MIGRATION: {
    key: 'START_REMOTE_REINDEX_MIGRATION',
    label: '开始迁移',
  },
};
export default MIGRATION_STEP;
