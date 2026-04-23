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
import fetch from 'logic/rest/FetchProvider';
import { singletonStore } from 'logic/singleton';

export const InputStaticFieldsStore = singletonStore(
  'core.InputStaticFields',
  () => Reflux.createStore({
    listenables: [],
    sourceUrl: (inputId) => `/system/inputs/${inputId}/staticfields`,

    create(input, name, value) {
      const url = URLUtils.qualifyUrl(this.sourceUrl(input.id));
      const promise = fetch('POST', url, { key: name, value: value });

      promise
        .then(
          (response) => {
            this.trigger({});
            UserNotification.success(`成功将静态字段 '${name}' 添加到 '${input.title}'`);

            return response;
          },
          (error) => {
            UserNotification.error(`向输入添加静态字段失败：${error}`,
              `无法向输入 '${input.title}' 添加静态字段`);
          },
        );

      return promise;
    },

    destroy(input, name) {
      const url = URLUtils.qualifyUrl(`${this.sourceUrl(input.id)}/${name}`);
      const promise = fetch('DELETE', url);

      promise
        .then(
          (response) => {
            this.trigger({});
            UserNotification.success(`静态字段 '${name}' 已从 '${input.title}' 成功移除`);

            return response;
          },
          (error) => {
            UserNotification.error(`从输入移除静态字段失败：${error}`,
              `无法从输入 '${input.title}' 移除静态字段 '${name}'`);
          },
        );

      return promise;
    },
  }),
);
