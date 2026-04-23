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
import { Formik, Form } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button, FormikInput, Space } from 'preflight/components/common';
import fetch from 'logic/rest/FetchProvider';
import { qualifyUrl } from 'util/URLUtils';
import UserNotification from 'preflight/util/UserNotification';
import { QUERY_KEY as DATA_NODES_CA_QUERY_KEY } from 'preflight/hooks/useDataNodesCA';

type FormValues = {}

const createCA = (caData: FormValues) => fetch(
  'POST',
  qualifyUrl('/api/ca/create'),
  caData,
  false,
);

const CACreateForm = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: onCreateCA } = useMutation(createCA, {
    onSuccess: () => {
      UserNotification.success('CA 创建成功');
      queryClient.invalidateQueries(DATA_NODES_CA_QUERY_KEY);
    },
    onError: (error) => {
      UserNotification.error(`CA 创建失败，错误：${error}`);
    },
  });

  const onSubmit = (formValues: FormValues) => onCreateCA(formValues).catch(() => {});

  return (
    <div>
      <p>
        在此您可以快速创建新的证书颁发机构。您只需点击“创建 CA"按钮即可。该 CA 仅应用于保护您的 Graylog 数据节点。
      </p>
      <Space h="xs" />
      <Formik initialValues={{ organization: 'Graylog CA' }} onSubmit={(formValues: FormValues) => onSubmit(formValues)}>
        {({ isSubmitting, isValid }) => (
          <Form>
            <FormikInput placeholder="组织名称"
                         name="organization"
                         label="组织名称"
                         required />
            <Space h="md" />
            <Button disabled={isSubmitting || !isValid} type="submit">
              {isSubmitting ? 'Creating CA...' : 'Create CA'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CACreateForm;
