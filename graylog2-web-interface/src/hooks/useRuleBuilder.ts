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
import { useQuery } from '@tanstack/react-query';

import UserNotification from 'util/UserNotification';
import { qualifyUrl } from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import ApiRoutes from 'routing/ApiRoutes';
import type { BlockDict, RuleBuilderRule } from 'components/rules/rule-builder/types';
import useParams from 'routing/useParams';

export const saveRuleSourceCode = (sourceCode: string) => {
  sessionStorage.setItem('rule_source_code', sourceCode);
};

export const getSavedRuleSourceCode = () => sessionStorage.getItem('rule_source_code');

export const removeSavedRuleSourceCode = () => {
  sessionStorage.removeItem('rule_source_code');
};

const createRule = async (rule: RuleBuilderRule) => {
  try {
    const result = await fetch(
      'POST',
      qualifyUrl(ApiRoutes.RuleBuilderController.create().url),
      rule,
    );

    UserNotification.success(`规则 "${rule.title}" 创建成功`);

    return result;
  } catch (errorThrown) {
    UserNotification.error(`创建规则构建器规则失败，状态为：${errorThrown}`, '无法创建规则构建器规则。');

    return null;
  }
};

const updateRule = async (rule: RuleBuilderRule) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { source, errors, ...ruleToUpdate }: any = rule;

  try {
    await fetch(
      'PUT',
      qualifyUrl(ApiRoutes.RuleBuilderController.update(rule.id).url),
      ruleToUpdate,
    );

    UserNotification.success(`规则 "${rule.title}" 更新成功`);
  } catch (errorThrown) {
    UserNotification.error(`更新规则构建器规则失败，状态为：${errorThrown}`, '无法更新规则构建器规则。');
  }
};

const fetchValidateRule = async (rule: RuleBuilderRule): Promise<RuleBuilderRule> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { source, ...ruleToValidate }: any = rule;

  return fetch(
    'POST',
    qualifyUrl(ApiRoutes.RuleBuilderController.validate().url),
    ruleToValidate,
  );
};

const fetchRule = async (ruleId: string = '') => fetch('GET', qualifyUrl(ApiRoutes.RulesController.get(ruleId).url));
const fetchConditionsDict = async () => fetch('GET', qualifyUrl(ApiRoutes.RuleBuilderController.listConditionsDict().url));
const fetchActionsDict = async () => fetch('GET', qualifyUrl(ApiRoutes.RuleBuilderController.listActionsDict().url));

const useRuleBuilder = () => {
  const { ruleId } = useParams();
  const enabled = !(ruleId === 'new');

  const { data: rule, refetch: refetchRule, isFetching: isLoadingRule } = useQuery<RuleBuilderRule|null>(
    ['rule'],
    () => fetchRule(ruleId),
    {
      enabled,
      onError: (errorThrown) => {
        UserNotification.error(`加载规则构建器规则失败，状态为：${errorThrown}`,
          '无法加载规则构建器规则。');
      },
    },
  );
  const { data: conditionsDict, refetch: refetchConditionsDict, isFetching: isLoadingConditionsDict } = useQuery<Array<BlockDict>>(
    ['conditions'],
    fetchConditionsDict,
    {
      onError: (errorThrown) => {
        UserNotification.error(`加载规则构建器条件列表失败，状态为：${errorThrown}`,
          '无法加载规则构建器条件列表。');
      },
      keepPreviousData: true,
    },
  );
  const { data: actionsDict, refetch: refetchActionsDict, isFetching: isLoadingActionsDict } = useQuery<Array<BlockDict>>(
    ['actions'],
    fetchActionsDict,
    {
      onError: (errorThrown) => {
        UserNotification.error(`加载规则构建器操作列表失败，状态为：${errorThrown}`,
          '无法加载规则构建器动作列表。');
      },
      keepPreviousData: true,
    },
  );

  return {
    isLoadingRule,
    isLoadingConditionsDict,
    isLoadingActionsDict,
    conditionsDict,
    actionsDict,
    rule: enabled ? rule : null,
    refetchRule,
    refetchConditionsDict,
    refetchActionsDict,
    createRule,
    updateRule,
    fetchValidateRule,
  };
};

export default useRuleBuilder;
