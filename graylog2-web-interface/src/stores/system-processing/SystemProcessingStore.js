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
import Reflux from 'reflux';

import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';

import { singletonStore } from '../../logic/singleton';

// eslint-disable-next-line import/prefer-default-export
export const SystemProcessingStore = singletonStore(
  'core.SystemProcessing',
  () => Reflux.createStore({
    sourceUrl: (nodeId) => `/cluster/${nodeId}/processing`,

    pause(nodeId) {
      return fetch('POST', URLUtils.qualifyUrl(`${this.sourceUrl(nodeId)}/pause`))
        .then(
          () => {
            this.trigger({});
            UserNotification.success(`在 '${nodeId}' 中成功暂停消息处理`);
          },
          (error) => {
            UserNotification.error(`在 '${nodeId}' 中暂停消息处理失败：${error}`,
              `无法在节点 '${nodeId}' 中暂停消息处理`);
          },
        );
    },

    resume(nodeId) {
      return fetch('POST', URLUtils.qualifyUrl(`${this.sourceUrl(nodeId)}/resume`))
        .then(
          () => {
            this.trigger({});
            UserNotification.success(`在 '${nodeId}' 中成功恢复消息处理`);
          },
          (error) => {
            UserNotification.error(`在 '${nodeId}' 中恢复消息处理失败：${error}`,
              `无法在节点 '${nodeId}' 中恢复消息处理`);
          },
        );
    },
  }),
);
