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

import UserNotification from 'util/UserNotification';
import * as URLUtils from 'util/URLUtils';
import ApiRoutes from 'routing/ApiRoutes';
import fetch from 'logic/rest/FetchProvider';
import { singletonStore } from 'logic/singleton';

// eslint-disable-next-line import/prefer-default-export
export const InputStatesStore = singletonStore(
  'core.InputStates',
  () => Reflux.createStore({
    listenables: [],

    init() {
      this.list();
    },

    getInitialState() {
      return { inputStates: this.inputStates };
    },

    list() {
      const url = URLUtils.qualifyUrl(ApiRoutes.ClusterInputStatesController.list().url);

      return fetch('GET', url)
        .then((response) => {
          const result = {};

          Object.keys(response).forEach((node) => {
            if (!response[node]) {
              return;
            }

            response[node].forEach((input) => {
              if (!result[input.id]) {
                result[input.id] = {};
              }

              result[input.id][node] = input;
            });
          });

          this.inputStates = result;
          this.trigger({ inputStates: this.inputStates });

          return result;
        });
    },

    _checkInputStateChangeResponse(input, response, action) {
      const nodes = Object.keys(response).filter((node) => (input.global ? true : node === input.node));
      const failedNodes = nodes.filter((nodeId) => response[nodeId] === null);

      if (failedNodes.length === 0) {
        UserNotification.success(`向输入 '${input.title}' 发送的 ${action.toLowerCase()} 请求已成功发送。`,
          `输入 '${input.title}' 即将 ${action === 'START' ? 'started' : 'stopped'}`);
      } else if (failedNodes.length === nodes.length) {
        UserNotification.error(`向输入 '${input.title}' 发送的 ${action.toLowerCase()} 请求失败。请检查您的 Graylog 日志以获取更多信息。`,
          `输入 '${input.title}' 无法 ${action === 'START' ? 'started' : 'stopped'}`);
      } else {
        UserNotification.warning(`在部分节点上向 ${action.toLowerCase()} 输入 '${input.title}' 的请求失败。请检查您的 Graylog 日志以获取更多信息。`,
          `在所有节点上输入 '${input.title}' 无法 ${action === 'START' ? 'started' : 'stopped'}`);
      }
    },

    start(input) {
      const url = URLUtils.qualifyUrl(ApiRoutes.ClusterInputStatesController.start(input.id).url);

      return fetch('PUT', url)
        .then(
          (response) => {
            this._checkInputStateChangeResponse(input, response, 'START');
            this.list();

            return response;
          },
          (error) => {
            UserNotification.error(`启动输入 '${input.title}' 时出错：${error}`, `无法启动输入 '${input.title}'`);
          },
        );
    },

    stop(input) {
      const url = URLUtils.qualifyUrl(ApiRoutes.ClusterInputStatesController.stop(input.id).url);

      return fetch('DELETE', url)
        .then(
          (response) => {
            this._checkInputStateChangeResponse(input, response, 'STOP');
            this.list();

            return response;
          },
          (error) => {
            UserNotification.error(`停止输入 '${input.title}' 时出错：${error}`, `无法停止输入 '${input.title}'`);
          },
        );
    },
  }),
);
