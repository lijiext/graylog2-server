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

import { qualifyUrl } from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import UserNotification from 'util/UserNotification';
import type { IndexSetTemplate } from 'components/indices/IndexSetTemplates/types';

export const urlPrefix = '/system/indices/index_sets/templates';

const putTemplate = async ({ template, id }: { template: IndexSetTemplate; id: string }) => {
  const url = qualifyUrl(`${urlPrefix}/${id}`);
  const body: Omit<IndexSetTemplate, 'id' | 'built_in' | 'default' | 'enabled' | 'disabled_reason'> = {
    title: template.title,
    description: template.description,
    index_set_config: template.index_set_config,
  };

  return fetch('PUT', url, body);
};

const putTemplateDefault = async (id: string) => {
  const url = qualifyUrl('/system/indices/index_set_defaults');
  const body: Pick<IndexSetTemplate, 'id'> = {
    id,
  };

  return fetch('PUT', url, body);
};

const postTemplate = async (template: IndexSetTemplate) => {
  const url = qualifyUrl(urlPrefix);
  const body: Omit<IndexSetTemplate, 'id' | 'built_in' | 'default' | 'enabled' | 'disabled_reason'> = {
    title: template.title,
    description: template.description,
    index_set_config: template.index_set_config,
  };

  return fetch('POST', url, body);
};

const deleteProfile = async (id: string) => {
  const url = qualifyUrl(`${urlPrefix}/${id}`);

  return fetch('DELETE', url);
};

const useTemplate = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    mutationFn: postTemplate,

    onError: (errorThrown) => {
      UserNotification.error(
        `创建索引集模板失败，状态为：${errorThrown}`,
        '无法创建索引集模板',
      );
    },

    onSuccess: () => {
      UserNotification.success('索引集模板已成功创建。', '成功！');

      return queryClient.refetchQueries({ queryKey: ['indexSetTemplates'], type: 'active' });
    },
  });

  const put = useMutation({
    mutationFn: putTemplate,

    onError: (errorThrown) => {
      UserNotification.error(
        `更新索引集模板失败，状态为：${errorThrown}`,
        '无法更新索引集模板',
      );
    },

    onSuccess: () => {
      UserNotification.success('索引集模板已成功更新。', '成功！');
      queryClient.invalidateQueries({
        queryKey: ['indexSetTemplate'],
      });

      return queryClient.refetchQueries({ queryKey: ['indexSetTemplates'], type: 'active' });
    },
  });

  const setAsDefault = useMutation({
    mutationFn: putTemplateDefault,

    onError: (errorThrown) => {
      UserNotification.error(
        `将模板设置为默认值失败，状态为：${errorThrown}`,
        '可设置模板为默认值',
      );
    },

    onSuccess: () => {
      UserNotification.success('模板已成功设置为默认值。', '成功！');

      return queryClient.refetchQueries({ queryKey: ['indexSetTemplates'], type: 'active' });
    },
  });

  const remove = useMutation({
    mutationFn: deleteProfile,

    onError: (errorThrown) => {
      UserNotification.error(
        `删除索引集模板失败，状态为：${errorThrown}`,
        '无法删除索引集模板',
      );
    },

    onSuccess: () => {
      UserNotification.success('索引集模板已成功删除。', '成功！');

      return queryClient.refetchQueries({ queryKey: ['indexSetTemplates'], type: 'active' });
    },
  });

  return {
    updateTemplate: put.mutateAsync,
    isEditLoading: put.isPending,
    createTemplate: post.mutateAsync,
    isCreateLoading: post.isPending,
    isLoading: post.mutateAsync || post.isPending || remove.isPending,
    deleteTemplate: remove.mutateAsync,
    setAsDefault: setAsDefault.mutateAsync,
  };
};

export default useTemplate;
