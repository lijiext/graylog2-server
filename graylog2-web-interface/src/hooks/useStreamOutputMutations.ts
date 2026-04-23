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

import { useMutation } from '@tanstack/react-query';

import { StreamOutputs } from '@graylog/server-api';
import UserNotification from 'util/UserNotification';

const addStreamOutput = async ({ streamId, outputs }: { streamId: string, outputs: { outputs: Array<string>}}) => StreamOutputs.add(streamId, outputs);
const removeStreamOutput = async ({ streamId, outputId }: { streamId: string, outputId: string}) => StreamOutputs.remove(streamId, outputId);

const useStreamOutputMutation = () => {
  const addMutation = useMutation(addStreamOutput, {
    onError: (errorThrown) => {
      UserNotification.error(`向数据流添加输出失败，状态为：${errorThrown}`,
        '无法将输出端添加到数据流');
    },
    onSuccess: () => {
      UserNotification.success('输出端已成功添加到数据流。', '成功！');
    },

  });

  const removeMutation = useMutation(removeStreamOutput, {
    onError: (errorThrown) => {
      UserNotification.error(`从数据流删除输出失败，状态为：${errorThrown}`,
        '无法从数据流删除输出端');
    },
    onSuccess: () => {
      UserNotification.success('输出端已成功从数据流中移除。', '成功！');
    },
  });

  return { addStreamOutput: addMutation.mutateAsync, removeStreamOutput: removeMutation.mutateAsync };
};

export default useStreamOutputMutation;
