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

import { styled } from 'styled-components';
import React, { useMemo } from 'react';
import { Formik, Form, FieldArray, Field } from 'formik';
import countBy from 'lodash/countBy';

import type { IndexSetFieldTypeProfileForm } from 'components/indices/IndexSetFieldTypeProfiles/types';
import { FormikInput, IconButton, Select, FormSubmit, Spinner, InputOptionalInfo } from 'components/common';
import { Button, Col, HelpBlock, Input } from 'components/bootstrap';
import useFieldTypes from 'views/logic/fieldtypes/useFieldTypes';
import useFieldTypesForMapping from 'views/logic/fieldactions/ChangeFieldType/hooks/useFieldTypesForMappings';
import { defaultCompare } from 'logic/DefaultCompare';
import isReservedField from 'views/logic/IsReservedField';

const SelectContainer = styled.div`
  flex-basis: 100%;
`;

const SelectGroup = styled.div`
  flex-grow: 1;
  display: flex;
  gap: 5px;
`;
const List = styled.div`
  display: flex;
  flex-direction: column;
`;
const StyledLabel = styled.h5`
  font-weight: bold;
  margin-bottom: 5px;
`;

const Item = styled.div`
  display: flex;
  gap: 5px;
`;

const StyledFormSubmit = styled(FormSubmit)`
  margin-top: 30px;
`;
type Props = {
  initialValues?: IndexSetFieldTypeProfileForm,
  submitButtonText: string,
  submitLoadingText: string,
  onCancel: () => void,
  onSubmit: (profile: IndexSetFieldTypeProfileForm) => void
}

const getFieldError = (field: string, occurrences: number) => {
  if (!field) return 'Field is required';
  if (isReservedField(field)) return 'Field is reserved';
  if (occurrences > 1) return 'This field occurs several times';

  return undefined;
};

const validate = (formValues: IndexSetFieldTypeProfileForm) => {
  const errors: { name?: string, customFieldMappings?: Array<{ field?: string, type?: string }>} = {};

  if (!formValues.name) {
    errors.name = 'Profile name is required';
  }

  const fieldsOccurrences = countBy(formValues.customFieldMappings, 'field');

  const customFieldMappings: Array<{ field: string, type: string }> = formValues
    .customFieldMappings
    .map(({ field, type }) => {
      if (field && type && (fieldsOccurrences[field] === 1)) return undefined;

      return ({
        field: getFieldError(field, fieldsOccurrences[field]),
        type: !type ? 'Type is required' : undefined,
      });
    });

  if (customFieldMappings.filter((item) => item).length > 0) {
    errors.customFieldMappings = customFieldMappings;
  }

  return errors;
};

type ProfileFormSelectProps = {
  onChange: (param: { target: { value: string, name: string } }) => void,
  options: Array<{ value: string, label: string, disabled?: boolean }>,
  error: string,
  name: string,
  value: string | undefined | null,
  placeholder: string,
  allowCreate: boolean,
}

const ProfileFormSelect = ({ onChange, options, error, name, value, placeholder, allowCreate }: ProfileFormSelectProps) => (
  <SelectContainer>
    <Input error={error} name={name} id={name}>
      <Select options={options}
              value={value}
              inputId={name}
              onChange={(newVal) => {
                onChange({ target: { value: newVal, name } });
              }}
              inputProps={{ 'aria-label': `Select ${name}` }}
              placeholder={placeholder}
              allowCreate={allowCreate} />
    </Input>
  </SelectContainer>
);

const ProfileForm = ({ initialValues, submitButtonText, submitLoadingText, onCancel, onSubmit }: Props) => {
  const { data, isLoading } = useFieldTypes(undefined, undefined);
  const { data: { fieldTypes }, isLoading: isLoadingFieldTypes } = useFieldTypesForMapping();
  const fieldTypeOptions = useMemo(() => Object.entries(fieldTypes)
    .sort(([, label1], [, label2]) => defaultCompare(label1, label2))
    .map(([value, label]) => ({
      value,
      label,
    })), [fieldTypes]);
  const fields = useMemo(() => (isLoading ? [] : data.map(({ value: { name } }) => ({ value: name, label: name, disabled: isReservedField(name) }))), [data, isLoading]);

  const _onSubmit = (profile: IndexSetFieldTypeProfileForm) => {
    onSubmit(profile);
  };

  return (
    <Col lg={8}>
      <Formik<IndexSetFieldTypeProfileForm> initialValues={initialValues}
                                            onSubmit={_onSubmit}
                                            validate={validate}
                                            validateOnChange>
        {({ isSubmitting, isValid, isValidating, values: { customFieldMappings } }) => (
          <Form>
            <FormikInput name="name"
                         label="配置文件名称"
                         id="index-set-field-type-profile-name"
                         placeholder="输入配置文件名称"
                         help="新配置文件的描述性名称"
                         required />
            <FormikInput name="description"
                         id="index-set-field-type-profile-description"
                         placeholder="输入配置文件描述"
                         label={<>描述 <InputOptionalInfo /></>}
                         type="textarea"
                         help="配置的更长描述"
                         rows={6} />
            <FieldArray name="customFieldMappings"
                        render={({ remove, push }) => (
                          <>
                            <StyledLabel>设置映射</StyledLabel>
                            <HelpBlock>
                              您可以在这里为任何字段设置类型映射。
                            </HelpBlock>
                            <List>
                              {(isLoading || isLoadingFieldTypes) ? <Spinner /> : customFieldMappings.map(({ field }, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <Item key={index} data-testid={`custom-mapping-row-for-${field}`}>
                                  <SelectGroup>
                                    <Field name={`customFieldMappings.${index}.field`} required>
                                      {({ field: { name, value, onChange }, meta: { error } }) => (
                                        <ProfileFormSelect value={value}
                                                           onChange={onChange}
                                                           options={fields}
                                                           name={name}
                                                           error={error}
                                                           placeholder="选择或输入字段名"
                                                           allowCreate />
                                      )}
                                    </Field>
                                    <Field name={`customFieldMappings.${index}.type`} required>
                                      {({ field: { name, value, onChange }, meta: { error } }) => (
                                        <ProfileFormSelect value={value}
                                                           onChange={onChange}
                                                           options={fieldTypeOptions}
                                                           name={name}
                                                           error={error}
                                                           placeholder="选择字段类型"
                                                           allowCreate={false} />
                                      )}
                                    </Field>
                                  </SelectGroup>
                                  {(customFieldMappings.length > 1) && <IconButton name="delete" onClick={() => (remove(index))} title="移除映射" />}
                                </Item>
                              ))}
                            </List>
                            <Button bsSize="xs" onClick={() => push({})} name="plus" title="添加映射">添加映射</Button>
                          </>
                        )} />
            <StyledFormSubmit submitButtonText={submitButtonText}
                              onCancel={onCancel}
                              disabledSubmit={isValidating || !isValid}
                              isSubmitting={isSubmitting}
                              submitLoadingText={submitLoadingText} />
          </Form>
        )}
      </Formik>
    </Col>
  );
};

ProfileForm.defaultProps = {
  initialValues: { name: '', description: '', customFieldMappings: [{ type: '', field: '' }] },
};

export default ProfileForm;
