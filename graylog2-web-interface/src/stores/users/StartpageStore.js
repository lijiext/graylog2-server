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

import ApiRoutes from 'routing/ApiRoutes';
import UserNotification from 'util/UserNotification';
import { qualifyUrl } from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import { singletonStore } from 'logic/singleton';

// eslint-disable-next-line import/prefer-default-export
export const StartpageStore = singletonStore('core.Startpage', () =>
  Reflux.createStore({
    listenables: [],

    set(userId, type, id) {
      const url = qualifyUrl(ApiRoutes.UsersApiController.update(userId).url);
      const payload = {};

      if (type && id) {
        payload.type = type;
        payload.id = id;
      }

      return fetch('PUT', url, { startpage: payload }).then(
        (response) => {
          this.trigger();
          UserNotification.success('您的起始页面已成功更改');

          return response;
        },
        (error) =>
          UserNotification.error(
            `更改您的起始页面失败，错误为：${error}`,
            '无法更改您的起始页面',
          ),
      );
    },
  }),
);
