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
import URI from 'urijs';
import cloneDeep from 'lodash/cloneDeep';
import concat from 'lodash/concat';
import defaultTo from 'lodash/defaultTo';
import pick from 'lodash/pick';
import omit from 'lodash/omit';

import * as URLUtils from 'util/URLUtils';
import PaginationURL from 'util/PaginationURL';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import { singletonStore, singletonActions } from 'logic/singleton';

export const EventDefinitionsActions = singletonActions('core.EventDefinitions', () =>
  Reflux.createActions({
    listAll: { asyncResult: true },
    listPaginated: { asyncResult: true },
    searchPaginated: { asyncResult: true },
    get: { asyncResult: true },
    create: { asyncResult: true },
    copy: { asyncResult: true },
    update: { asyncResult: true },
    delete: { asyncResult: true },
    enable: { asyncResult: true },
    disable: { asyncResult: true },
    clearNotificationQueue: { asyncResult: true },
  }),
);

export const EventDefinitionsStore = singletonStore('core.EventDefinitions', () =>
  Reflux.createStore({
    listenables: [EventDefinitionsActions],
    sourceUrl: '/events/definitions',
    all: undefined,
    eventDefinitions: undefined,
    context: undefined,
    query: undefined,
    pagination: {
      count: undefined,
      page: undefined,
      pageSize: undefined,
      total: undefined,
      grandTotal: undefined,
    },

    getInitialState() {
      return this.getState();
    },

    propagateChanges() {
      this.trigger(this.getState());
    },

    getState() {
      return {
        all: this.all,
        eventDefinitions: this.eventDefinitions,
        context: this.context,
        query: this.query,
        pagination: this.pagination,
      };
    },

    eventDefinitionsUrl({ segments = [], query = {} }) {
      const uri = new URI(this.sourceUrl);
      const nextSegments = concat(uri.segment(), segments);

      uri.segmentCoded(nextSegments);
      uri.query(query);

      return URLUtils.qualifyUrl(uri.resource());
    },

    refresh() {
      if (this.all) {
        this.listAll();
      }

      if (this.pagination.page) {
        this.listPaginated({
          query: this.query,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        });
      }
    },

    listAll() {
      const promise = fetch('GET', this.eventDefinitionsUrl({ query: { per_page: 0 } }));

      promise.then((response) => {
        this.all = response.event_definitions;
        this.context = response.context;
        this.propagateChanges();

        return response;
      });

      EventDefinitionsActions.listAll.promise(promise);
    },

    listPaginated({ query = '', page = 1, pageSize = 10 }) {
      const promise = fetch(
        'GET',
        this.eventDefinitionsUrl({
          query: {
            query: query,
            page: page,
            per_page: pageSize,
          },
        }),
      );

      promise
        .then((response) => {
          this.eventDefinitions = response.event_definitions;
          this.context = response.context;
          this.query = response.query;

          this.pagination = {
            count: response.count,
            page: response.page,
            pageSize: response.per_page,
            total: response.total,
            grandTotal: response.grand_total,
          };

          this.propagateChanges();

          return response;
        })
        .catch((error) => {
          UserNotification.error(
            `获取事件定义失败，状态为：${error}`,
            '无法检索事件定义',
          );
        });

      EventDefinitionsActions.listPaginated.promise(promise);
    },

    searchPaginated(newPage, newPerPage, newQuery, additional) {
      const url = PaginationURL(`${this.sourceUrl}/paginated`, newPage, newPerPage, newQuery, additional);
      const promise = fetch('GET', URLUtils.qualifyUrl(url)).then((response) => {
        const {
          elements,
          query,
          attributes,
          pagination: { count, total, page, per_page: perPage },
        } = response;

        return {
          elements,
          attributes,
          pagination: {
            count,
            total,
            page,
            perPage,
            query,
          },
        };
      });

      EventDefinitionsActions.searchPaginated.promise(promise);

      return promise;
    },
    get(eventDefinitionId) {
      const promise = fetch('GET', this.eventDefinitionsUrl({ segments: [eventDefinitionId, 'with-context'] }));

      promise
        .then((response) => ({
          eventDefinition: response.event_definition,
          context: response.context,
          is_mutable: response.is_mutable,
        }))
        .catch((error) => {
          if (error.status === 404) {
            UserNotification.error(
              `找不到 ID 为 <${eventDefinitionId}> 的事件定义，请确保其未被删除。`,
              '无法检索事件定义',
            );
          }
        });

      EventDefinitionsActions.get.promise(promise);

      return promise;
    },

    setAlertFlag(eventDefinition) {
      const isAlert = eventDefinition.notifications.length > 0;

      return { ...eventDefinition, alert: isAlert };
    },

    extractSchedulerInfo(eventDefinition) {
      // Removes the internal "_is_scheduled" field from the event definition data. We only use this to pass-through
      // the flag from the form.
      const clonedEventDefinition = cloneDeep(eventDefinition);
      const { _is_scheduled } = pick(clonedEventDefinition.config, ['_is_scheduled']);

      clonedEventDefinition.config = omit(clonedEventDefinition.config, ['_is_scheduled']);

      return { eventDefinition: clonedEventDefinition, isScheduled: defaultTo(_is_scheduled, true) };
    },

    create(newEventDefinition) {
      const { eventDefinition, isScheduled } = this.extractSchedulerInfo(newEventDefinition);
      const promise = fetch(
        'POST',
        this.eventDefinitionsUrl({ query: { schedule: isScheduled } }),
        this.setAlertFlag(eventDefinition),
      );

      promise.then(
        (response) => {
          UserNotification.success(
            '事件定义创建成功',
            `事件定义 "${eventDefinition.title}" 已成功创建。`,
          );

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(
              `创建事件定义 "${eventDefinition.title}" 失败，状态为：${error}`,
              '无法保存事件定义',
            );
          }
        },
      );

      EventDefinitionsActions.create.promise(promise);
    },

    copy(eventDefinition) {
      const promise = fetch('POST', this.eventDefinitionsUrl({ segments: [eventDefinition.id, 'duplicate'] }));

      promise.then(
        (response) => {
          UserNotification.success(
            '事件定义复制成功',
            `事件定义 "${response.title}" 已成功创建。`,
          );

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(
              `复制事件定义 "${eventDefinition.title}" 失败，状态为：${error}`,
              '无法复制事件定义',
            );
          }
        },
      );

      EventDefinitionsActions.copy.promise(promise);
    },

    update(eventDefinitionId, updatedEventDefinition) {
      const { eventDefinition, isScheduled } = this.extractSchedulerInfo(updatedEventDefinition);
      const promise = fetch(
        'PUT',
        this.eventDefinitionsUrl({ segments: [eventDefinitionId], query: { schedule: isScheduled } }),
        this.setAlertFlag(eventDefinition),
      );

      promise.then(
        (response) => {
          UserNotification.success(
            '事件定义更新成功',
            `事件定义 "${eventDefinition.title}" 已成功更新。`,
          );

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(
              `更新事件定义 "${eventDefinition.title}" 失败，状态为：${error}`,
              '无法更新事件定义',
            );
          }
        },
      );

      EventDefinitionsActions.update.promise(promise);
    },

    delete(eventDefinition) {
      const promise = fetch('DELETE', this.eventDefinitionsUrl({ segments: [eventDefinition.id] }));

      EventDefinitionsActions.delete.promise(promise);
    },

    enable(eventDefinition) {
      const promise = fetch('PUT', this.eventDefinitionsUrl({ segments: [eventDefinition.id, 'schedule'] }));

      promise.then(
        (response) => {
          UserNotification.success(
            '事件定义已成功启用',
            `事件定义 "${eventDefinition.title}" 已成功启用。`,
          );

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(
              `启用事件定义 "${eventDefinition.title}" 失败，状态为：${error}`,
              '无法启用事件定义',
            );
          }
        },
      );

      EventDefinitionsActions.enable.promise(promise);
    },

    disable(eventDefinition) {
      const promise = fetch('PUT', this.eventDefinitionsUrl({ segments: [eventDefinition.id, 'unschedule'] }));

      promise.then(
        (response) => {
          UserNotification.success(
            '事件定义已成功禁用',
            `事件定义 "${eventDefinition.title}" 已成功禁用。`,
          );

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(
              `禁用事件定义 "${eventDefinition.title}" 失败，状态为：${error}`,
              '无法禁用事件定义',
            );
          }
        },
      );

      EventDefinitionsActions.disable.promise(promise);
    },

    clearNotificationQueue(eventDefinition) {
      const promise = fetch(
        'PUT',
        this.eventDefinitionsUrl({ segments: [eventDefinition.id, 'clear-notification-queue'] }),
      );

      promise.then(
        (response) => {
          UserNotification.success('已清除待处理的通知。', '排队的通知已成功清除。');

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(
              `清除待处理的通知失败，状态为：${error}`,
              '无法清除待处理的告警',
            );
          }
        },
      );

      EventDefinitionsActions.clearNotificationQueue.promise(promise);
    },
  }),
);
