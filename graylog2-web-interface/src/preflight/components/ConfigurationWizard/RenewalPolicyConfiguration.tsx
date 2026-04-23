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
import { Formik, Form, Field } from 'formik';
import styled from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';

import { Title, Space, Button, Group, NumberInput, Input } from 'preflight/components/common';
import UserNotification from 'preflight/util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import { qualifyUrl } from 'util/URLUtils';
import Select from 'preflight/components/common/Select';
import { QUERY_KEY as RENEWAL_POLICY_QUERY_KEY } from 'preflight/hooks/useRenewalPolicy';

type FormValues = {
  renewal_policy: 'Automatic' | 'Manual',
  lifetime_value: number,
  lifetime_unit: 'hours' | 'days' | 'months' | 'years',
}

const createPolicy = ({ renewal_policy, lifetime_unit, lifetime_value }: FormValues) => {
  const lifetime = moment.duration(lifetime_value, lifetime_unit);
  const payload = {
    mode: renewal_policy,
    certificate_lifetime: lifetime.toISOString(),
  };

  return fetch(
    'POST',
    qualifyUrl('/api/renewal_policy'),
    payload,
    false,
  );
};

const StyledForm = styled(Form)`
  > div:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const MINIMUM_LIFETIME = moment.duration(2, 'hours');

const validateForm = (formValues: FormValues) => {
  const duration = moment.duration(formValues.lifetime_value, formValues.lifetime_unit);

  return duration.subtract(MINIMUM_LIFETIME).asMilliseconds() < 0
    ? { lifetime_value: `Must be at least ${MINIMUM_LIFETIME.humanize()}` }
    : {};
};

const unitOptions = [
  { label: 'Hour(s)', value: 'hours' },
  { label: 'Day(s)', value: 'days' },
  { label: 'Month(s)', value: 'months' },
  { label: 'Year(s)', value: 'years' },
];

const defaultFormValues = {
  renewal_policy: 'Automatic',
  lifetime_value: 30,
  lifetime_unit: 'days',
};

const RenewalPolicyConfiguration = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: onCreateRenewalPolicy } = useMutation(createPolicy, {
    onSuccess: () => {
      UserNotification.success('续订策略创建成功');
      queryClient.invalidateQueries(RENEWAL_POLICY_QUERY_KEY);
    },
    onError: (error) => {
      UserNotification.error(`续订策略创建失败，错误：${error}`);
    },
  });

  const onSubmit = (formValues: FormValues) => onCreateRenewalPolicy(formValues).catch(() => {});

  return (
    <>
      <Title order={3}>配置续订策略</Title>
      <p>
        在此步骤中，您可以配置是否自动续期即将过期的证书。<br />
        如果您选择手动续订，当到期日临近时，系统将显示通知，要求您确认续订。
      </p>
      <Space h="md" />
      <Formik initialValues={defaultFormValues} onSubmit={(formValues: FormValues) => onSubmit(formValues)} validate={validateForm}>
        {({ isSubmitting, isValid, setFieldValue, errors }) => (
          <StyledForm>
            <Field name="renewal_policy">
              {({ field: { value, name } }) => (
                <Select placeholder="选择续订策略"
                        data={['Automatic', 'Manual']}
                        required
                        value={value}
                        onChange={(newPolicy) => setFieldValue(name, newPolicy)}
                        label="续订策略" />
              )}
            </Field>
            <Input.Label required>证书有效期</Input.Label>
            <Group>
              <Field name="lifetime_value">
                {({ field: { name, value } }) => (
                  <NumberInput value={value}
                               onChange={(newValue) => setFieldValue(name, newValue)}
                               required
                               placeholder="输入生存期"
                               step={1} />
                )}
              </Field>
              <Field name="lifetime_unit">
                {({ field: { name, value } }) => (
                  <Select placeholder="选择单位"
                          data={unitOptions}
                          required
                          value={value}
                          onChange={(unit) => setFieldValue(name, unit)} />
                )}
              </Field>
            </Group>
            {errors?.lifetime_value && <Input.Error>{errors?.lifetime_value}</Input.Error>}
            <Button disabled={isSubmitting || !isValid} type="submit">
              {isSubmitting ? '正在创建策略...' : '创建策略'}
            </Button>
          </StyledForm>
        )}
      </Formik>
    </>

  );
};

export default RenewalPolicyConfiguration;
