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

import { defaultCompare as naturalSort } from 'logic/DefaultCompare';
import UserNotification from 'util/UserNotification';
import { qualifyUrl } from 'util/URLUtils';
import PaginationURL from 'util/PaginationURL';
import ApiRoutes from 'routing/ApiRoutes';
import fetch from 'logic/rest/FetchProvider';
import { singletonStore, singletonActions } from 'logic/singleton';
import type { Pagination, PaginatedListJSON, ListPagination } from 'stores/PaginationTypes';
import type FetchError from 'logic/errors/FetchError';
import type { RuleBuilderType } from 'components/rules/rule-builder/types';

export type RuleType = {
  id?: string;
  source: string;
  title: string;
  description: string;
  created_at: string;
  modified_at: string;
  rule_builder: RuleBuilderType;
  errors?: [];
  simulator_message?: string;
  _scope?: string;
};
export type MetricsConfigType = {
  metrics_enabled: boolean;
};
export type PipelineSummary = {
  id: string;
  title: string;
};
export type RulesContext = {
  used_in_pipelines: {
    [id: string]: Array<PipelineSummary>;
  };
};
export type PaginatedRulesResponse = PaginatedListJSON & {
  rules: Array<RuleType>;
  context: RulesContext;
};

export type PaginatedRules = {
  list: Array<RuleType>;
  context: RulesContext;
  pagination: ListPagination;
};

export type RulesStoreState = {
  rules: Array<RuleType>;
  rulesContext: RulesContext;
  functionDescriptors: any;
  metricsConfig: MetricsConfigType | undefined;
};

type RulesActionsType = {
  delete: (rule: RuleType) => Promise<unknown>;
  list: () => Promise<unknown>;
  get: (ruleId: string) => Promise<unknown>;
  save: (rule: RuleType) => Promise<unknown>;
  update: (rule: RuleType) => Promise<unknown>;
  parse: (rule: RuleType, callback: () => void) => Promise<unknown>;
  simulate: (messageString: string, rule: RuleType, callback: React.Dispatch<any> | (() => void)) => Promise<unknown>;
  multiple: () => Promise<unknown>;
  loadFunctions: () => Promise<unknown>;
  loadMetricsConfig: () => Promise<unknown>;
  updateMetricsConfig: (nextConfig) => Promise<unknown>;
  listPaginated: (pagination: Pagination) => Promise<PaginatedRules>;
};

export const RulesActions = singletonActions('core.Rules', () =>
  Reflux.createActions<RulesActionsType>({
    delete: { asyncResult: true },
    list: { asyncResult: true },
    get: { asyncResult: true },
    save: { asyncResult: true },
    update: { asyncResult: true },
    parse: { asyncResult: true },
    simulate: { asyncResult: true },
    multiple: { asyncResult: true },
    loadFunctions: { asyncResult: true },
    loadMetricsConfig: { asyncResult: true },
    updateMetricsConfig: { asyncResult: true },
    listPaginated: { asyncResult: true },
  }),
);

export const RulesStore = singletonStore('core.Rules', () =>
  Reflux.createStore<RulesStoreState>({
    listenables: [RulesActions],
    rules: undefined,
    rulesContext: undefined,
    functionDescriptors: undefined,
    metricsConfig: undefined,

    getInitialState() {
      return {
        rules: this.rules,
        rulesContext: this.rulesContext,
        functionDescriptors: this.functionDescriptors,
        metricsConfig: this.metricsConfig,
      };
    },

    _updateRulesState(rule) {
      if (!this.rules) {
        this.rules = [rule];
      } else {
        const doesRuleExist = this.rules.some((r) => r.id === rule.id);

        if (doesRuleExist) {
          this.rules = this.rules.map((r) => (r.id === rule.id ? rule : r));
        } else {
          this.rules.push(rule);
        }
      }

      this.trigger({ rules: this.rules, functionDescriptors: this.functionDescriptors });
    },

    _updateFunctionDescriptors(functions) {
      if (functions) {
        this.functionDescriptors = functions.sort((fn1, fn2) => naturalSort(fn1.name, fn2.name));
      }

      this.trigger({ rules: this.rules, functionDescriptors: this.functionDescriptors });
    },

    list() {
      const failCallback = (error: Error) => {
        UserNotification.error(
          `获取规则失败，状态为：${error.message}`,
          '无法检索处理规则',
        );
      };

      const url = qualifyUrl(ApiRoutes.RulesController.list().url);

      return fetch('GET', url).then((response) => {
        this.rules = response;
        this.trigger({ rules: response, functionDescriptors: this.functionDescriptors });
      }, failCallback);
    },

    listPaginated({ page, perPage, query }: Pagination): Promise<PaginatedRules> {
      const url = PaginationURL(ApiRoutes.RulesController.paginatedList().url, page, perPage, query);
      const promise = fetch('GET', qualifyUrl(url)).then((response: PaginatedRulesResponse) => ({
        list: response.rules,
        context: response.context,
        pagination: {
          count: response.count,
          total: response.total,
          page: response.page,
          perPage: response.per_page,
          query: response.query,
        },
      }));

      promise.catch((error: FetchError) => {
        if (!error.additional || error.additional.status !== 404) {
          UserNotification.error(`加载规则列表失败，状态为：${error}`, '无法加载规则。');
        }
      });

      RulesActions.listPaginated.promise(promise);

      return promise;
    },

    get(ruleId: string) {
      const failCallback = (error: Error) => {
        UserNotification.error(
          `获取规则 "${ruleId}" 失败，状态为：${error.message}`,
          `无法检索处理规则 "${ruleId}"`,
        );
      };

      const url = qualifyUrl(ApiRoutes.RulesController.get(ruleId).url);
      const promise = fetch('GET', url);

      promise.then(this._updateRulesState, failCallback);
      RulesActions.get.promise(promise);

      return promise;
    },

    save(ruleSource: RuleType) {
      const failCallback = (error: Error) => {
        UserNotification.error(
          `保存规则 "${ruleSource.title}" 失败，状态为：${error.message}`,
          `无法保存处理规则 "${ruleSource.title}"`,
        );
      };

      const url = qualifyUrl(ApiRoutes.RulesController.create().url);
      const rule = {
        title: ruleSource.title,
        description: ruleSource.description,
        source: ruleSource.source,
        simulator_message: ruleSource.simulator_message,
      };
      const promise = fetch('POST', url, rule);

      promise.then((response) => {
        this._updateRulesState(response);
        UserNotification.success(`规则 "${response.title}" 创建成功`);

        return response;
      }, failCallback);

      RulesActions.save.promise(promise);

      return promise;
    },

    update(ruleSource: RuleType) {
      const failCallback = (error) => {
        UserNotification.error(
          `更新规则 "${ruleSource.title}" 失败，状态为：${error.message}`,
          `无法更新处理规则 "${ruleSource.title}"`,
        );
      };

      const url = qualifyUrl(ApiRoutes.RulesController.update(ruleSource.id).url);
      const rule = {
        id: ruleSource.id,
        title: ruleSource.title,
        description: ruleSource.description,
        source: ruleSource.source,
        simulator_message: ruleSource.simulator_message,
      };
      const promise = fetch('PUT', url, rule);

      promise.then((response) => {
        this._updateRulesState(response);
        UserNotification.success(`规则 "${response.title}" 更新成功`);

        return response;
      }, failCallback);

      RulesActions.update.promise(promise);

      return promise;
    },
    delete(rule) {
      const failCallback = (error: Error) => {
        UserNotification.error(
          `删除规则 "${rule.title}" 失败，状态为：${error.message}`,
          `无法删除处理规则 "${rule.title}"`,
        );
      };

      const url = qualifyUrl(ApiRoutes.RulesController.delete(rule.id).url);

      const promise = fetch('DELETE', url).then(() => {
        this.rules = this.rules?.filter((el) => el.id !== rule.id);
        this.trigger({ rules: this.rules, functionDescriptors: this.functionDescriptors });
        UserNotification.success(`规则 "${rule.title}" 已成功删除`);
      }, failCallback);

      RulesActions.delete.promise(promise);

      return promise;
    },
    parse(ruleSource, callback) {
      const url = qualifyUrl(ApiRoutes.RulesController.parse().url);
      const rule = {
        title: ruleSource.title,
        description: ruleSource.description,
        source: ruleSource.source,
      };

      return fetch('POST', url, rule).then(
        (response) => {
          // call to clear the errors, the parsing was successful
          callback([]);

          return response;
        },
        (error) => {
          // a Bad Request indicates a parse error, set all the returned errors in the editor
          if (error.status === 400) {
            callback(error.additional.body);
          }
        },
      );
    },
    simulate(message, ruleToSimulate, callback) {
      const url = qualifyUrl(
        ruleToSimulate?.rule_builder
          ? ApiRoutes.RuleBuilderController.simulate().url
          : ApiRoutes.RulesController.simulate().url,
      );
      const rule = {
        message,
        rule_source: undefined,
        rule_builder_dto: undefined,
      };

      if (ruleToSimulate?.rule_builder) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { source, ...ruleBuilderRuleToSimulate } = ruleToSimulate;

        rule.rule_builder_dto = {
          title: ruleBuilderRuleToSimulate.title,
          description: ruleBuilderRuleToSimulate.description,
          rule_builder: ruleBuilderRuleToSimulate.rule_builder,
        };
      } else {
        rule.rule_source = {
          title: ruleToSimulate.title,
          description: ruleToSimulate.description,
          source: ruleToSimulate.source,
        };
      }

      return fetch('POST', url, rule).then(callback, () => {});
    },
    multiple(ruleNames, callback) {
      const url = qualifyUrl(ApiRoutes.RulesController.multiple().url);
      const promise = fetch('POST', url, { rules: ruleNames });

      promise.then(callback);

      return promise;
    },
    loadFunctions() {
      if (this.functionDescriptors) {
        return undefined;
      }

      const url = qualifyUrl(ApiRoutes.RulesController.functions().url);

      return fetch('GET', url).then(this._updateFunctionDescriptors);
    },
    loadMetricsConfig() {
      const url = qualifyUrl(ApiRoutes.RulesController.metricsConfig().url);
      const promise = fetch('GET', url);

      promise.then(
        (response: MetricsConfigType) => {
          this.metricsConfig = response;
          this.trigger({
            rules: this.rules,
            functionDescriptors: this.functionDescriptors,
            metricsConfig: this.metricsConfig,
          });
        },
        (error) => {
          UserNotification.error(
            `无法加载规则指标配置：${error.message}`,
            "无法加载规则指标配置",
          );
        },
      );

      RulesActions.loadMetricsConfig.promise(promise);
    },
    updateMetricsConfig(nextConfig) {
      const url = qualifyUrl(ApiRoutes.RulesController.metricsConfig().url);
      const promise = fetch('PUT', url, nextConfig);

      promise.then(
        (response) => {
          this.metricsConfig = response;
          this.trigger({
            rules: this.rules,
            functionDescriptors: this.functionDescriptors,
            metricsConfig: this.metricsConfig,
          });
          UserNotification.success('规则指标配置更新成功');
        },
        (error) => {
          UserNotification.error(
            `无法更新规则指标配置：${error.message}`,
            "无法更新规则指标配置",
          );
        },
      );

      RulesActions.updateMetricsConfig.promise(promise);
    },
  }),
);
