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
import { useState } from 'react';
import type { FormikErrors } from 'formik';
import { Formik, Form } from 'formik';
import styled from 'styled-components';

import { Alert, Input, Row, Col } from 'components/bootstrap';
import { SearchForm, Spinner, Icon } from 'components/common';
import { getValueFromInput } from 'util/FormsUtils';
import { compare as naturalSort } from 'logic/DefaultCompare';

import type { RemoteReindexRequest } from '../../hooks/useRemoteReindexMigrationStatus';
import type { MigrationActions, MigrationState, MigrationStepComponentProps, StepArgs } from '../../Types';
import MigrationStepTriggerButtonToolbar from '../common/MigrationStepTriggerButtonToolbar';
import useSaveRemoteReindexMigrationFormValues, { DEFAULT_THREADS_COUNT } from '../../hooks/useSaveRemoteReindexMigrationFormValues';

const IndicesContainer = styled.div`
  max-height: 300px;
  overflow-y: scroll;
  overflow: -moz-scrollbars-vertical;
  -ms-overflow-y: scroll;
`;

const SearchContainer = styled.div`
  margin-top: 12px;
`;

type RemoteIndex = {
  name: string,
  managed: boolean,
  closed: boolean,
}

type RemoteReindexCheckConnection = {
  indices: RemoteIndex[],
  error: any,
}

const MigrateExistingData = ({ currentStep, onTriggerStep, hideActions }: MigrationStepComponentProps) => {
  const [nextSteps, setNextSteps] = useState<MigrationActions[]>(['CHECK_REMOTE_INDEXER_CONNECTION']);
  const [errorMessage, setErrrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableIndices, setAvailableIndices] = useState<RemoteIndex[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<RemoteIndex[]>([]);
  const [queryIndex, setQueryIndex] = useState<string>('');

  const { initialValues, saveFormValues } = useSaveRemoteReindexMigrationFormValues();

  const handleConnectionCheck = (step: MigrationActions, data: MigrationState, args?: StepArgs) => {
    if (step === 'CHECK_REMOTE_INDEXER_CONNECTION') {
      const checkConnectionResult = data?.response as RemoteReindexCheckConnection;

      if (checkConnectionResult?.indices?.length) {
        setAvailableIndices(checkConnectionResult.indices.sort((a, b) => naturalSort({ numeric: true, sensitivity: 'base' })(a.name, b.name)));
        setSelectedIndices(checkConnectionResult.indices.filter((i) => i.managed));
        setNextSteps(currentStep.next_steps.filter((next_step) => next_step === 'START_REMOTE_REINDEX_MIGRATION'));
        saveFormValues(args as RemoteReindexRequest);
      } else if (checkConnectionResult?.error) {
        setErrrorMessage(checkConnectionResult.error);
      } else {
        setErrrorMessage('No available index has been found for remote reindex migration.');
      }
    }
  };

  const handleTriggerNextStep = async (step: MigrationActions, args?: StepArgs) => {
    setIsLoading(true);
    setErrrorMessage(null);

    return onTriggerStep(step, args).then((data) => {
      handleConnectionCheck(step, data, args);

      return data;
    }).catch((error) => {
      setErrrorMessage(error?.message);

      return {} as MigrationState;
    }).finally(() => setIsLoading(false));
  };

  const resetConnectionCheck = () => {
    setErrrorMessage(null);
    setIsLoading(false);
    setAvailableIndices([]);
    setSelectedIndices([]);
    setNextSteps(currentStep.next_steps.filter((step) => step === 'CHECK_REMOTE_INDEXER_CONNECTION'));
  };

  const handleChange = async (e: React.ChangeEvent<any>, callback: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<RemoteReindexRequest>>) => {
    let value;
    value = getValueFromInput(e.target);

    if (e.target.name === 'threads') {
      value = (value || 0) < 1 ? DEFAULT_THREADS_COUNT : value;
    }

    await callback(e.target.name, value, true);

    resetConnectionCheck();
  };

  const handleCheckboxChange = async (e: React.ChangeEvent<any>, callback: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<RemoteReindexRequest>>) => {
    await callback(e.target.name, e.target.checked);
    resetConnectionCheck();
  };

  const handleSelectIndices = (indexToToggle: RemoteIndex) => {
    if (selectedIndices.includes(indexToToggle)) {
      setSelectedIndices(selectedIndices.filter((index) => index !== indexToToggle));
    } else {
      setSelectedIndices([...selectedIndices, indexToToggle]);
    }
  };

  const filteredIndices = queryIndex ? availableIndices.filter((index) => index.name.includes(queryIndex)) : availableIndices;
  const filteredSelectedIndices = selectedIndices.filter((index) => filteredIndices.includes(index));
  const areAllIndicesSelected = filteredSelectedIndices.length === filteredIndices.length;

  const adaptArgs = (args: RemoteReindexRequest): RemoteReindexRequest => ({
    ...args,
    hostname: args.hostname.endsWith('/') ? args.hostname.slice(0, -1) : args.hostname,
    indices: filteredSelectedIndices.map((i) => i.name),
  });

  const validate = (values: RemoteReindexRequest) => {
    let errors = {};

    if (!values.hostname) {
      errors = { ...errors, hostname: 'Hostname is required.' };
    }

    return errors;
  };

  return (
    <Formik enableReinitialize
            initialValues={initialValues}
            validate={validate}
            onSubmit={() => {}}>
      {({
        values,
        errors,
        isValid,
        isValidating,
        setFieldValue,
      }) => (
        <Form role="form">
          <Input id="hostname"
                 name="hostname"
                 label="主机名"
                 help="调用远程重新索引命令的主机 URI (http://example:9200)"
                 placeholder="http://example:9200"
                 type="text"
                 disabled={isLoading}
                 value={values.hostname}
                 onChange={(e) => handleChange(e, setFieldValue)}
                 error={errors?.hostname}
                 required />
          <Row>
            <Col md={6}>
              <Input id="user"
                     name="user"
                     label="用户名"
                     type="text"
                     disabled={isLoading}
                     value={values.user}
                     onChange={(e) => handleChange(e, setFieldValue)} />
            </Col>
            <Col md={6}>
              <Input id="password"
                     name="password"
                     label="密码"
                     type="password"
                     disabled={isLoading}
                     value={values.password}
                     onChange={(e) => handleChange(e, setFieldValue)} />
            </Col>
          </Row>
          <Input id="allowlist"
                 name="allowlist"
                 label="白名单"
                 help="旧集群中所有机器的白名单（例如：9200,example:9201,example:9202 或正则表达式）"
                 placeholder="example:9200,example:9201,example:9202 或正则表达式"
                 type="text"
                 disabled={isLoading}
                 value={values.allowlist}
                 onChange={(e) => handleChange(e, setFieldValue)}
                 required />
          <Input id="threads"
                 name="threads"
                 label="线程数"
                 help="线程数定义将并行迁移多少个索引（最小值为 1，默认值为 4）"
                 type="number"
                 min={1}
                 step={1}
                 disabled={isLoading}
                 value={values.threads}
                 onChange={(e) => handleChange(e, setFieldValue)} />
          <Input id="trust_unknown_certs"
                 name="trust_unknown_certs"
                 label="信任未知证书"
                 help="在迁移过程中信任远程主机的所有证书。"
                 type="checkbox"
                 disabled={isLoading}
                 checked={values.trust_unknown_certs}
                 onChange={(e) => handleCheckboxChange(e, setFieldValue)}
                 required />
          {(availableIndices.length > 0) && (
            <Alert title="有效连接" bsStyle="success">
              以下是可用于远程重新索引迁移的索引， <b>{filteredSelectedIndices.length}/{availableIndices.length}</b> 项被选中。
              <SearchContainer>
                <SearchForm onSearch={setQueryIndex}
                            query={queryIndex} />
              </SearchContainer>
              {(filteredIndices.length === 0) ? 'No indices have been found' : (
                <Input type="checkbox"
                       formGroupClassName=""
                       label={<b>{areAllIndicesSelected ? 'Unselect all' : 'Select all'}</b>}
                       disabled={isLoading}
                       checked={areAllIndicesSelected}
                       onChange={() => {
                         if (areAllIndicesSelected) {
                           setSelectedIndices([]);
                         } else {
                           setSelectedIndices(filteredIndices);
                         }
                       }} />
              )}
              <IndicesContainer>
                {filteredIndices.map((index) => (
                  <Input type="checkbox"
                         key={index.name}
                         name={index.name}
                         id={index.name}
                         label={(
                           <>
                             <span>{index.name} </span>
                             {!index.managed && !index.closed && (
                               <Icon name="warning"
                                     title="这是由 Graylog 管理的索引。如果您导入它，将无法在 Graylog 中查询它。" />
                             )}
                             {index.closed && (
                               <Icon name="warning"
                                     title="此索引已关闭，将在迁移期间重新打开并再次关闭。" />
                             )}
                           </>
                         )}
                         disabled={isLoading}
                         checked={filteredSelectedIndices.includes(index)}
                         onChange={() => handleSelectIndices(index)} />
                ))}
              </IndicesContainer>
            </Alert>
          )}
          {errorMessage && (
            <Alert bsStyle="danger">{errorMessage}</Alert>
          )}
          {isLoading ? (
            <Spinner />
          ) : (
            <MigrationStepTriggerButtonToolbar hidden={hideActions}
                                               disabled={!isValid || isValidating}
                                               nextSteps={nextSteps || currentStep.next_steps}
                                               onTriggerStep={handleTriggerNextStep}
                                               args={adaptArgs(values)} />
          )}
        </Form>
      )}
    </Formik>
  );
};

export default MigrateExistingData;
