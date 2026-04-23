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
import PropTypes from 'prop-types';
import isArray from 'lodash/isArray';

import ApiRoutes from 'routing/ApiRoutes';
import fetch from 'logic/rest/FetchProvider';
import { qualifyUrl } from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import { singletonStore, singletonActions } from 'logic/singleton';
import type { RetentionStrategyConfig, RotationStrategyConfig } from 'components/indices/Types';
import { RetentionStrategyConfigPropType, RotationStrategyConfigPropType } from 'components/indices/Types';
import type { DataTieringConfig, DataTieringFormValues, DataTieringStatus } from 'components/indices/data-tiering';

export const IndexSetPropType = PropTypes.shape({
  can_be_default: PropTypes.bool,
  id: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string.isRequired,
  index_prefix: PropTypes.string.isRequired,
  shards: PropTypes.number.isRequired,
  replicas: PropTypes.number.isRequired,
  rotation_strategy_class: PropTypes.string.isRequired,
  rotation_strategy: RotationStrategyConfigPropType.isRequired,
  retention_strategy_class: PropTypes.string.isRequired,
  retention_strategy: RetentionStrategyConfigPropType.isRequired,
  creation_date: PropTypes.string,
  index_analyzer: PropTypes.string.isRequired,
  index_optimization_max_num_segments: PropTypes.number.isRequired,
  index_optimization_disabled: PropTypes.bool.isRequired,
  field_type_refresh_interval: PropTypes.number.isRequired,
  index_template_type: PropTypes.string,
  writable: PropTypes.bool.isRequired,
  default: PropTypes.bool.isRequired,
});

export type IndexSetConfig = {
  can_be_default?: boolean,
  id?: string,
  title: string,
  description: string,
  index_prefix: string,
  shards: number,
  replicas: number,
  rotation_strategy_class: string,
  rotation_strategy: RotationStrategyConfig,
  retention_strategy_class: string,
  retention_strategy: RetentionStrategyConfig,
  creation_date?: string,
  index_analyzer: string,
  index_optimization_max_num_segments: number,
  index_optimization_disabled: boolean,
  field_type_refresh_interval: number,
  field_type_profile?: string | null,
  index_template_type?: string,
  writable: boolean,
  default?: boolean,
  use_legacy_rotation?: boolean
}

export type IndexSet = IndexSetConfig & {
  data_tiering?: DataTieringConfig,
  data_tiering_status?: DataTieringStatus
};

export type IndexSetFormValues = IndexSetConfig & { data_tiering?: DataTieringFormValues };

export type IndexSetStats = {
  documents: number,
  indices: number,
  size: number,
}

export type IndexSetsStats = {
  [key: string]: IndexSetStats
}

export type IndexSetsResponseType = {
  total: number,
  index_sets: Array<IndexSet>,
  stats: IndexSetsStats,
};

export type IndexSetsStoreState = {
  indexSetsCount: number,
  indexSets: Array<IndexSet>,
  indexSetStats: IndexSetsStats,
  indexSet: IndexSet,
  globalIndexSetStats: IndexSetStats
}

type IndexSetsActionsType = {
  list: (stats: boolean) => Promise<unknown>,
  listPaginated: (skip: number, limit: number, stats: boolean) => Promise<unknown>,
  get: (indexSetId: string) => Promise<unknown>,
  update: (indexSet: IndexSet) => Promise<unknown>,
  create: (indexSet: IndexSet) => Promise<unknown>,
  delete: (indexSet: IndexSet, deleteIndices: boolean) => Promise<unknown>,
  searchPaginated: (searchTerm: string, skip: number, limit: number, stats: boolean) => Promise<unknown>,
  setDefault: (indexSet: IndexSet) => Promise<unknown>,
  stats: () => Promise<unknown>,
};

export const IndexSetsActions = singletonActions(
  'core.IndexSets',
  () => Reflux.createActions<IndexSetsActionsType>({
    list: { asyncResult: true },
    listPaginated: { asyncResult: true },
    get: { asyncResult: true },
    update: { asyncResult: true },
    create: { asyncResult: true },
    delete: { asyncResult: true },
    searchPaginated: { asyncResult: true },
    setDefault: { asyncResult: true },
    stats: { asyncResult: true },
  }),
);

export const IndexSetsStore = singletonStore(
  'core.IndexSets',
  () => Reflux.createStore<IndexSetsStoreState>({
    listenables: [IndexSetsActions],
    indexSetsCount: undefined,
    indexSets: undefined,
    indexSetStats: undefined,
    indexSet: undefined,
    globalIndexSetStats: undefined,

    getInitialState() {
      return this.getState();
    },

    getState() {
      return {
        indexSetsCount: this.indexSetsCount,
        indexSets: this.indexSets,
        indexSetStats: this.indexSetStats,
        indexSet: this.indexSet,
        globalIndexSetStats: this.globalIndexSetStats,
      };
    },

    propagateChanges() {
      this.trigger(this.getState());
    },

    list(stats: boolean) {
      const url = qualifyUrl(ApiRoutes.IndexSetsApiController.list(stats).url);
      const promise = fetch('GET', url);

      promise
        .then(
          (response: IndexSetsResponseType) => {
            this.indexSetsCount = response.total;
            this.indexSets = response.index_sets;
            this.indexSetStats = response.stats;

            this.propagateChanges();

            return response;
          },
          (error) => {
            UserNotification.error(`获取索引集列表失败：${error.message}`,
              '无法检索索引集');
          },
        );

      IndexSetsActions.list.promise(promise);
    },

    listPaginated(skip: number, limit: number, stats: boolean) {
      const url = qualifyUrl(ApiRoutes.IndexSetsApiController.listPaginated(skip, limit, stats).url);
      const promise = fetch('GET', url);

      promise
        .then(
          (response: IndexSetsResponseType) => {
            this.indexSetsCount = response.total;
            this.indexSets = response.index_sets;
            this.indexSetStats = response.stats;

            this.propagateChanges();

            return response;
          },
          (error) => {
            UserNotification.error(`获取索引集列表失败：${this._errorMessage(error)}`,
              '无法检索索引集');
          },
        );

      IndexSetsActions.listPaginated.promise(promise);
    },

    searchPaginated(searchTerm: string, skip: number, limit: number, stats: boolean) {
      const url = qualifyUrl(ApiRoutes.IndexSetsApiController.searchPaginated(searchTerm, skip, limit, stats).url);
      const promise = fetch('GET', url);

      promise
        .then(
          (response: IndexSetsResponseType) => {
            this.indexSetsCount = response.total;
            this.indexSets = response.index_sets;
            this.indexSetStats = response.stats;

            this.propagateChanges();

            return response;
          },
          (error) => {
            UserNotification.error(`获取索引集列表失败：${this._errorMessage(error)}`,
              '无法检索索引集');
          },
        );

      IndexSetsActions.searchPaginated.promise(promise);
    },

    get(indexSetId: string) {
      const url = qualifyUrl(ApiRoutes.IndexSetsApiController.get(indexSetId).url);
      const promise = fetch('GET', url);

      promise.then(
        (response: IndexSet) => {
          this.indexSet = response;

          this.propagateChanges();

          return response;
        },
        (error) => {
          UserNotification.error(`获取索引集 '${indexSetId}' 失败，状态：${this._errorMessage(error)}`, '无法检索索引集。');
        },
      );

      IndexSetsActions.get.promise(promise);
    },

    update(indexSet: IndexSet) {
      const url = qualifyUrl(ApiRoutes.IndexSetsApiController.get(indexSet.id).url);
      const promise = fetch('PUT', url, indexSet);

      promise.then(
        (response: IndexSet) => {
          UserNotification.success(`成功更新索引集 '${indexSet.title}'`, '成功');

          this.indexSet = response;

          this.propagateChanges();

          return response;
        },
        (error) => {
          UserNotification.error(`更新索引集 '${indexSet.title}' 失败，状态：${this._errorMessage(error)}`, '无法更新索引集。');
        },
      );

      IndexSetsActions.update.promise(promise);
    },

    create(indexSet: IndexSet) {
      const url = qualifyUrl(ApiRoutes.IndexSetsApiController.create().url);
      const promise = fetch('POST', url, indexSet);

      promise.then(
        (response: IndexSet) => {
          UserNotification.success(`成功创建索引集 '${indexSet.title}'`, '成功');

          this.indexSet = response;

          this.propagateChanges();

          return response;
        },
        (error) => {
          UserNotification.error(`创建索引集 '${indexSet.title}' 失败，状态：${this._errorMessage(error)}`, '无法创建索引集。');
        },
      );

      IndexSetsActions.create.promise(promise);
    },

    delete(indexSet: IndexSet, deleteIndices: boolean) {
      const url = qualifyUrl(ApiRoutes.IndexSetsApiController.delete(indexSet.id, deleteIndices).url);
      const promise = fetch('DELETE', url);

      promise.then(
        () => {
          UserNotification.success(`成功删除索引集 '${indexSet.title}'`, '成功');
        },
        (error) => {
          UserNotification.error(`删除索引集 '${indexSet.title}' 失败，状态为：${this._errorMessage(error)}`, '无法删除索引集。');
        },
      );

      IndexSetsActions.delete.promise(promise);
    },

    setDefault(indexSet: IndexSet) {
      const url = qualifyUrl(ApiRoutes.IndexSetsApiController.setDefault(indexSet.id).url);
      const promise = fetch('PUT', url);

      promise.then(
        () => {
          UserNotification.success(`成功将索引集 '${indexSet.title}' 设为默认`, '成功');
        },
        (error) => {
          UserNotification.error(`将索引集 '${indexSet.title}' 设为默认失败，状态为：${this._errorMessage(error)}`, '无法设置默认索引集。');
        },
      );

      IndexSetsActions.setDefault.promise(promise);
    },

    stats() {
      const url = qualifyUrl(ApiRoutes.IndexSetsApiController.stats().url);
      const promise = fetch('GET', url);

      promise
        .then(
          (response) => {
            this.globalIndexSetStats = {
              indices: response.indices,
              documents: response.documents,
              size: response.size,
            };

            this.propagateChanges();

            return response;
          },
          (error) => {
            UserNotification.error(`获取全局索引统计失败：${error.message}`,
              '无法检索全局索引统计信息。');
          },
        );

      IndexSetsActions.stats.promise(promise);
    },

    _errorMessage(error) {
      try {
        if (isArray(error.additional.body)) {
          return error.additional.body.map(({ message, path }) => `${path ?? ''} ${message}.`).join(' ');
        }

        return error.additional.body.message;
      } catch (e) {
        return error.message;
      }
    },
  }),
);
