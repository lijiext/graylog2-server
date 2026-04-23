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
import { useMutation, useQueryClient } from '@tanstack/react-query';

import UserNotification from 'util/UserNotification';
import { qualifyUrl } from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import ApiRoutes from 'routing/ApiRoutes';
import type { StreamOutputFilterRule } from 'components/streams/StreamDetails/output-filter/Types';

type StreamOutputParam = { streamId: string; filterOutputRule: Partial<StreamOutputFilterRule> };

const createStreamOutputRule = async ({ streamId, filterOutputRule }: StreamOutputParam) =>
  fetch('POST', qualifyUrl(ApiRoutes.StreamOutputFilterRuleApiController.create(streamId).url), filterOutputRule);
const updateStreamOutputRule = async ({ streamId, filterOutputRule }: StreamOutputParam) =>
  fetch(
    'PUT',
    qualifyUrl(ApiRoutes.StreamOutputFilterRuleApiController.update(streamId, filterOutputRule.id).url),
    filterOutputRule,
  );
const removeStreamOutputRule = async ({ streamId, filterId }: { streamId: string; filterId: string }) =>
  fetch('DELETE', qualifyUrl(ApiRoutes.StreamOutputFilterRuleApiController.delete(streamId, filterId).url));

const useStreamOutputRuleMutation = () => {
  const queryClient = useQueryClient();
  const invalidateStreamQueries = () =>
    queryClient.invalidateQueries({
      queryKey: ['streams'],
    });

  const createMutation = useMutation({
    mutationFn: createStreamOutputRule,

    onError: (errorThrown) => {
      UserNotification.error(
        `创建数据流输出过滤器规则失败，状态为：${errorThrown}`,
        '无法创建数据流输出过滤规则',
      );
    },

    onSuccess: () => {
      UserNotification.success('数据流输出过滤规则已成功创建。', '成功！');
      invalidateStreamQueries();
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateStreamOutputRule,

    onError: (errorThrown) => {
      UserNotification.error(
        `更新数据流输出过滤器规则失败，状态为：${errorThrown}`,
        '无法更新数据流输出过滤规则',
      );
    },

    onSuccess: () => {
      UserNotification.success('数据流输出过滤器规则已成功更新。', '成功！');
      invalidateStreamQueries();
    },
  });
  const removeMutation = useMutation({
    mutationFn: removeStreamOutputRule,

    onError: (errorThrown) => {
      UserNotification.error(
        `删除数据流输出过滤器规则失败，状态为：${errorThrown}`,
        '无法删除数据流输出过滤规则',
      );
    },

    onSuccess: () => {
      UserNotification.success('数据流输出过滤规则已成功移除。', '成功！');
      invalidateStreamQueries();
    },
  });

  return {
    createStreamOutputRule: createMutation.mutateAsync,
    updateStreamOutputRule: updateMutation.mutateAsync,
    removeStreamOutputRule: removeMutation.mutateAsync,
  };
};

export default useStreamOutputRuleMutation;
