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
import { useFormikContext } from 'formik';
import styled, { css } from 'styled-components';

import useScopePermissions from 'hooks/useScopePermissions';
import { Input } from 'components/bootstrap';
import { FormikFormGroup, JSONValueInput } from 'components/common';
import type { LookupTableType } from 'components/lookup-tables/lookup-table-form';

const StyledJSONValueInput = styled(JSONValueInput)`
  margin: 0;
  padding: 0 10px;
`;

const StyledDefaultValueSection = styled.div(
  ({ theme }) => css`
    border: 1px solid ${theme.colors.variant.lighter.default};
    border-radius: 10px;
    margin-bottom: ${theme.spacings.xxs};
    padding: 10px;
    margin-top: ${theme.spacings.md};
  `,
);

function LookupTableFormFields() {
  const { setFieldValue, setFieldTouched, touched, values, errors } = useFormikContext<LookupTableType>();
  const { loadingScopePermissions, scopePermissions } = useScopePermissions(values);

  const canModify = React.useMemo(
    () => !values.id || (!loadingScopePermissions && scopePermissions?.is_mutable),
    [values.id, loadingScopePermissions, scopePermissions?.is_mutable],
  );

  React.useEffect(() => {
    setFieldValue('enable_single_value', !!values.default_single_value);
    setFieldValue('enable_multi_value', !!values.default_multi_value);
  }, [values.default_single_value, values.default_multi_value, setFieldValue]);

  return (
    <fieldset>
      <FormikFormGroup
        type="text"
        name="title"
        label="标题 *"
        help={touched.title && errors.title ? undefined : 'A short title for this lookup table.'}
        labelClassName="d-block mb-1"
        wrapperClassName="d-block"
        formGroupClassName="mb-3"
        disabled={!canModify}
      />

      <FormikFormGroup
        type="text"
        name="description"
        label="描述"
        help="查找表的描述。"
        labelClassName="d-block mb-1"
        wrapperClassName="d-block"
        formGroupClassName="mb-3"
        disabled={!canModify}
      />

      <FormikFormGroup
        type="text"
        name="name"
        label="名称 *"
        help={
          touched.name && errors.name
            ? undefined
            : 'The name that is being used to refer to this lookup table. Must be unique.'
        }
        labelClassName="d-block mb-1"
        wrapperClassName="d-block"
        formGroupClassName="mb-3"
        disabled={!canModify}
      />

      <StyledDefaultValueSection>
        <Input
          id="enable_single_value"
          name="enable_single_value"
          type="checkbox"
          label="启用单个默认值"
          help="如果查找表应为单值提供默认值，请启用。"
          labelClassName="d-block mb-1"
          wrapperClassName="d-block"
          formGroupClassName="mb-3"
          disabled={!canModify}
          checked={values.enable_single_value}
          onChange={() => {
            setFieldValue('enable_single_value', !values.enable_single_value);

            if (values.enable_single_value) {
              setFieldValue('default_single_value', '');
              setFieldValue('default_single_value_type', 'NULL');
            }
          }}
        />
        {values.enable_single_value && (
          <StyledJSONValueInput
            label="默认单值 *"
            help={
              (touched.default_single_value && errors.default_single_value) ||
              'The single value that is being used as lookup result if the data adapter or cache does not find a value.'
            }
            validationState={touched.default_single_value && errors.default_single_value ? 'error' : undefined}
            onBlur={() => setFieldTouched('default_single_value', true)}
            update={(value, valueType) => {
              setFieldValue('default_single_value', value);
              setFieldValue('default_single_value_type', valueType);
            }}
            value={values.default_single_value}
            valueType={values.default_single_value_type || 'NULL'}
            allowedTypes={['STRING', 'NUMBER', 'BOOLEAN', 'NULL']}
            disabled={!canModify}
          />
        )}
      </StyledDefaultValueSection>

      <StyledDefaultValueSection>
        <Input
          id="enable_multi_value"
          name="enable_multi_value"
          type="checkbox"
          label="启用多默认值"
          help="如果查找表应为多值提供默认值，请启用。"
          labelClassName="d-block mb-1"
          wrapperClassName="d-block"
          formGroupClassName="mb-3"
          disabled={!canModify}
          checked={values.enable_multi_value}
          onChange={() => {
            setFieldValue('enable_multi_value', !values.enable_multi_value);

            if (values.enable_multi_value) {
              setFieldValue('default_multi_value', '');
              setFieldValue('default_multi_value_type', 'NULL');
            }
          }}
        />
        {values.enable_multi_value && (
          <StyledJSONValueInput
            label="默认多值 *"
            help={
              (touched.default_multi_value && errors.default_multi_value) ||
              'The multi value that is being used as lookup result if the data adapter or cache does not find a value.'
            }
            validationState={touched.default_multi_value && errors.default_multi_value ? 'error' : undefined}
            onBlur={() => setFieldTouched('default_multi_value', true)}
            update={(value, valueType) => {
              setFieldValue('default_multi_value', value);
              setFieldValue('default_multi_value_type', valueType);
            }}
            value={values.default_multi_value}
            valueType={values.default_multi_value_type || 'NULL'}
            allowedTypes={['OBJECT', 'NULL']}
            disabled={!canModify}
          />
        )}
      </StyledDefaultValueSection>
    </fieldset>
  );
}

export default LookupTableFormFields;
