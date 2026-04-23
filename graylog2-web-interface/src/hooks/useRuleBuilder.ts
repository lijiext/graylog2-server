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
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import UserNotification from 'util/UserNotification';
import { qualifyUrl } from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import ApiRoutes from 'routing/ApiRoutes';
import type { RuleBuilderRule } from 'components/rules/rule-builder/types';
import useParams from 'routing/useParams';
import { defaultOnError } from 'util/conditional/onError';

export const saveRuleSourceCode = (sourceCode: string) => {
  sessionStorage.setItem('rule_source_code', sourceCode);
};

export const getSavedRuleSourceCode = () => sessionStorage.getItem('rule_source_code');

export const removeSavedRuleSourceCode = () => {
  sessionStorage.removeItem('rule_source_code');
};

const createRule = async (rule: RuleBuilderRule) => {
  try {
    const result = await fetch('POST', qualifyUrl(ApiRoutes.RuleBuilderController.create().url), rule);

    UserNotification.success(`规则 "${rule.title}" 创建成功`);

    return result;
  } catch (errorThrown) {
    UserNotification.error(
      `创建规则构建器规则失败，状态为：${errorThrown}`,
      '无法创建规则构建器规则。',
    );

    return null;
  }
};

const updateRule = async (rule: RuleBuilderRule) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { source, errors, ...ruleToUpdate }: any = rule;

  try {
    await fetch('PUT', qualifyUrl(ApiRoutes.RuleBuilderController.update(rule.id).url), ruleToUpdate);

    UserNotification.success(`规则 "${rule.title}" 更新成功`);
  } catch (errorThrown) {
    UserNotification.error(
      `更新规则构建器规则失败，状态为：${errorThrown}`,
      '无法更新规则构建器规则。',
    );
  }
};

const fetchValidateRule = async (rule: RuleBuilderRule): Promise<RuleBuilderRule> => {
  const { source: _source, _scope, ...ruleToValidate }: any = rule;

  return fetch('POST', qualifyUrl(ApiRoutes.RuleBuilderController.validate().url), ruleToValidate);
};

const fetchRule = async (ruleId: string = '') => fetch('GET', qualifyUrl(ApiRoutes.RulesController.get(ruleId).url));
const fetchConditionsDict = async () =>
  fetch('GET', qualifyUrl(ApiRoutes.RuleBuilderController.listConditionsDict().url));
const fetchActionsDict = async () => fetch('GET', qualifyUrl(ApiRoutes.RuleBuilderController.listActionsDict().url));

const useRuleBuilder = () => {
  const { ruleId } = useParams();
  const enabled = !(ruleId === 'new');

  const {
    data: rule,
    refetch: refetchRule,
    isFetching: isLoadingRule,
  } = useQuery({
    queryKey: ['rule'],

    queryFn: () =>
      defaultOnError(
        fetchRule(ruleId),
        'Loading Rule Builder Rule failed with status',
        'Could not load Rule Builder Rule.',
      ),

    enabled,
  });
  const {
    data: conditionsDict,
    refetch: refetchConditionsDict,
    isFetching: isLoadingConditionsDict,
  } = useQuery({
    queryKey: ['conditions'],

    queryFn: () =>
      defaultOnError(
        fetchConditionsDict(),
        'Loading Rule Builder Conditions list failed with status',
        'Could not load Rule Builder Conditions list.',
      ),

    placeholderData: keepPreviousData,
  });
  const {
    data: actionsDict,
    refetch: refetchActionsDict,
    isFetching: isLoadingActionsDict,
  } = useQuery({
    queryKey: ['actions'],

    queryFn: () =>
      defaultOnError(
        fetchActionsDict(),
        'Loading Rule Builder Actions list failed with status',
        'Could not load Rule Builder Actions list.',
      ),

    placeholderData: keepPreviousData,
  });

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
