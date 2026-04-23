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
import * as React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import fetch from 'logic/rest/FetchProvider';
import { Button, Title, Group, Space } from 'preflight/components/common';
import Alert from 'components/bootstrap/Alert';
import URLUtils from 'util/URLUtils';
import UserNotification from 'preflight/util/UserNotification';
import useDataNodes, { DATA_NODES_OVERVIEW_QUERY_KEY } from 'preflight/hooks/useDataNodes';

const onProvisionCertificate = () => fetch(
  'POST',
  URLUtils.qualifyUrl('api/generate'),
  undefined,
  false,
);

type Props = {
  onSkipProvisioning: () => void,
}

const CertificateProvisioning = ({ onSkipProvisioning }: Props) => {
  const queryClient = useQueryClient();
  const { data: dataNodes, isInitialLoading } = useDataNodes();
  const [isProvisioning, setIsProvisioning] = useState(false);

  const { mutate: provisionCertificate } = useMutation(onProvisionCertificate, {
    onSuccess: () => {
      UserNotification.success('证书配置启动成功');
      queryClient.invalidateQueries(DATA_NODES_OVERVIEW_QUERY_KEY);
    },
    onError: (error) => {
      UserNotification.error(`启动证书配置失败，错误：${error}`);
      queryClient.invalidateQueries(DATA_NODES_OVERVIEW_QUERY_KEY);
      setIsProvisioning(false);
    },
  });

  const onSubmit = useCallback(() => {
    setIsProvisioning(true);
    provisionCertificate();
  }, [provisionCertificate]);

  return (
    <div>
      <Title order={3}>配置证书</Title>
      <p>
        证书颁发机构已成功配置。<br />
        您现在可以为数据节点配置证书。
      </p>
      {(!dataNodes.length && !isInitialLoading) ? (
        <Alert bsStyle="warning">
          在配置证书之前，至少需要运行一个 Graylog 数据节点。
        </Alert>
      ) : <Space h="sm" />}
      <Group>
        <Button onClick={() => onSubmit()} disabled={!dataNodes.length || isProvisioning}>
          {isProvisioning ? '正在配置证书...' : '配置证书并继续'}
        </Button>
        <Button onClick={() => onSkipProvisioning()} variant="light" disabled={isProvisioning}>
          跳过配置
        </Button>
      </Group>
    </div>
  );
};

export default CertificateProvisioning;
