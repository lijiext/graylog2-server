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

import { qualifyUrl } from 'util/URLUtils';
import PaginationURL from 'util/PaginationURL';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import type { Attribute, SearchParams, PaginatedResponseType } from 'stores/PaginationTypes';
import type FetchError from 'logic/errors/FetchError';
import type { DataNodes } from 'components/datanode/Types';

export const bulkRemoveDataNode = async (entity_ids: string[], selectBackFailedEntities: (entity_ids: string[]) => void) => {
  try {
    const { failures, successfully_performed } = await fetch('POST', qualifyUrl('/datanode/bulk_remove'), { entity_ids });

    selectBackFailedEntities([]);

    if (failures?.length) {
      selectBackFailedEntities(failures.map(({ entity_id }) => entity_id));
    }

    if (failures?.length === entity_ids.length) {
      UserNotification.error(`移除数据节点失败，状态为：${JSON.stringify(failures)}`, '无法移除数据节点。');
    }

    if (successfully_performed) {
      UserNotification.success(`${successfully_performed} 数据节点${successfully_performed > 1 ? 's' : ''} 已成功移除。`);
    }
  } catch (errorThrown) {
    UserNotification.error(`移除数据节点失败，状态为：${errorThrown}`, '无法移除数据节点。');
  }
};

export const bulkStartDataNode = async (entity_ids: string[], selectBackFailedEntities: (entity_ids: string[]) => void) => {
  try {
    const { failures, successfully_performed } = await fetch('POST', qualifyUrl('/datanode/bulk_start'), { entity_ids });

    selectBackFailedEntities([]);

    if (failures?.length) {
      selectBackFailedEntities(failures.map(({ entity_id }) => entity_id));
    }

    if (failures?.length === entity_ids.length) {
      UserNotification.error(`启动数据节点失败，状态为：${JSON.stringify(failures)}`, '无法启动数据节点。');
    }

    if (successfully_performed) {
      UserNotification.success(`${successfully_performed} 数据节点${successfully_performed > 1 ? 's' : ''} 已成功启动。`);
    }
  } catch (errorThrown) {
    UserNotification.error(`启动数据节点失败，状态为：${errorThrown}`, '无法启动数据节点。');
  }
};

export const bulkStopDataNode = async (entity_ids: string[], selectBackFailedEntities: (entity_ids: string[]) => void) => {
  try {
    const { failures, successfully_performed } = await fetch('POST', qualifyUrl('/datanode/bulk_stop'), { entity_ids });

    selectBackFailedEntities([]);

    if (failures?.length) {
      selectBackFailedEntities(failures.map(({ entity_id }) => entity_id));
    }

    if (failures?.length === entity_ids.length) {
      UserNotification.error(`停止数据节点失败，状态为：${JSON.stringify(failures)}`, '无法停止数据节点。');
    }

    if (successfully_performed) {
      UserNotification.success(`${successfully_performed} 数据节点${successfully_performed > 1 ? 's' : ''} 已成功停止。`);
    }
  } catch (errorThrown) {
    UserNotification.error(`停止数据节点失败，状态为：${errorThrown}`, '无法停止数据节点。');
  }
};

export const removeDataNode = async (datanodeId: string) => {
  try {
    await fetch('DELETE', qualifyUrl(`/datanode/${datanodeId}`));

    UserNotification.success(`数据节点 "${datanodeId}" 已成功移除。`);
  } catch (errorThrown) {
    UserNotification.error(`移除数据节点失败，状态为：${errorThrown}`, '无法移除该数据节点。');
  }
};

export const startDataNode = async (datanodeId: string) => {
  try {
    await fetch('POST', qualifyUrl(`/datanode/${datanodeId}/start`));

    UserNotification.success(`数据节点 "${datanodeId}" 已成功启动。`);
  } catch (errorThrown) {
    UserNotification.error(`启动数据节点失败，状态为：${errorThrown}`, '无法启动该数据节点。');
  }
};

export const stopDataNode = async (datanodeId: string) => {
  try {
    await fetch('POST', qualifyUrl(`/datanode/${datanodeId}/stop`));

    UserNotification.success(`数据节点 "${datanodeId}" 已成功停止。`);
  } catch (errorThrown) {
    UserNotification.error(`停止数据节点失败，状态为：${errorThrown}`, '无法停止该数据节点。');
  }
};

export const rejoinDataNode = async (datanodeId: string) => {
  try {
    await fetch('POST', qualifyUrl(`/datanode/${datanodeId}/reset`));

    UserNotification.success(`数据节点 "${datanodeId}" 已成功重新加入。`);
  } catch (errorThrown) {
    UserNotification.error(`重新加入数据节点失败，状态为：${errorThrown}`, '无法重新加入数据节点。');
  }
};

type Options = {
  enabled: boolean,
}

export const renewDatanodeCertificate = (nodeId: string) => fetch('POST', qualifyUrl(`/certrenewal/${nodeId}`))
  .then(() => {
    UserNotification.success('证书更新成功。');
  })
  .catch((error) => {
    UserNotification.error(`证书续期失败，错误为：${error}`);
  });

export const fetchDataNodes = async (params: SearchParams) => {
  const url = PaginationURL('/system/cluster/datanodes', params.page, params.pageSize, params.query, { sort: params.sort?.attributeId, order: params.sort?.direction });

  return fetch('GET', qualifyUrl(url)).then(({ attributes, pagination, elements }) => ({
    attributes,
    list: elements,
    pagination,
  }));
};

export const keyFn = (searchParams: SearchParams) => ['datanodes', searchParams];

export type DataNodeResponse = {
  list: DataNodes,
  pagination: PaginatedResponseType,
  attributes: Array<Attribute>
}

const useDataNodes = (searchParams: SearchParams = {
  query: '-datanode_status:UNAVAILABLE',
  page: 1,
  pageSize: 0,
  sort: undefined,
}, { enabled }: Options = { enabled: true }, refetchInterval : number | false = 5000) : {
  data: DataNodeResponse,
  refetch: () => void,
  isInitialLoading: boolean,
  error: FetchError,
} => {
  const { data, refetch, isInitialLoading, error } = useQuery<DataNodeResponse, FetchError>(
    keyFn(searchParams),
    () => fetchDataNodes(searchParams),
    {
      onError: (errorThrown) => {
        UserNotification.error(`加载数据节点失败，状态：${errorThrown}`,
          '无法加载数据节点。');
      },
      notifyOnChangeProps: ['data', 'error'],
      refetchInterval,
      enabled,
    },
  );

  return ({
    data: data || {
      attributes: [],
      list: [],
      pagination: {
        query: '',
        page: 1,
        per_page: 0,
        total: 0,
        count: 0,
      },
    },
    refetch,
    isInitialLoading,
    error,
  });
};

export default useDataNodes;
