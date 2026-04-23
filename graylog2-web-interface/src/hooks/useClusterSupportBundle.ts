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
import { useState } from 'react';
import type { QueryObserverResult } from '@tanstack/react-query';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import fetch from 'logic/rest/FetchProvider';
import UserNotification from 'util/UserNotification';
import { qualifyUrl } from 'util/URLUtils';
import ApiRoutes from 'routing/ApiRoutes';
import { defaultOnError } from 'util/conditional/onError';

export type BundleFile = {
  size: number;
  file_name: string;
};

const fetchSupportBundleList = async () =>
  fetch('GET', qualifyUrl(ApiRoutes.ClusterSupportBundleController.list().url));

const createSupportBundle = async (
  refetchList: () => Promise<QueryObserverResult<any, unknown>>,
  setLoading: (loading: boolean) => void,
) => {
  try {
    setLoading(true);
    await fetch('POST', qualifyUrl(ApiRoutes.ClusterSupportBundleController.create().url));
    await refetchList();
  } catch (errorThrown) {
    UserNotification.error(
      `创建支持包失败，状态为：${errorThrown}`,
      '无法创建支持包。',
    );
  } finally {
    setLoading(false);
  }
};

const deleteSupportBundle = async (filename: string, refetchList: () => Promise<QueryObserverResult<any, unknown>>) => {
  try {
    await fetch('DELETE', qualifyUrl(ApiRoutes.ClusterSupportBundleController.delete(filename).url));
    await refetchList();
  } catch (errorThrown) {
    UserNotification.error(
      `删除支持包失败，状态为：${errorThrown}`,
      '无法删除支持包。',
    );
  }
};

const downloadSupportBundle = async (filename: string) => {
  try {
    window.open(qualifyUrl(ApiRoutes.ClusterSupportBundleController.download(filename).url), '_self');
  } catch (errorThrown) {
    UserNotification.error(
      `下载支持包失败，状态为：${errorThrown}`,
      '无法下载支持包。',
    );
  }
};

const useClusterSupportBundle = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { data, refetch } = useQuery({
    queryKey: ['supportBundleList', 'overview'],

    queryFn: () =>
      defaultOnError(
        fetchSupportBundleList(),
        'Loading Support Bundle list failed with status',
        'Could not load Support Bundle list.',
      ),

    placeholderData: keepPreviousData,
  });

  return {
    isCreating,
    list: data || [],
    onCreate: () => createSupportBundle(refetch, setIsCreating),
    onDelete: (filename: string) => deleteSupportBundle(filename, refetch),
    onDownload: downloadSupportBundle,
  };
};

export default useClusterSupportBundle;
