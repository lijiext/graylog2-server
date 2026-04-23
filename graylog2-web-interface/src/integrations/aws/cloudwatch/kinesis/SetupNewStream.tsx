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
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button } from 'components/bootstrap';
import ValidatedInput from 'integrations/aws/common/ValidatedInput';
import FormWrap from 'integrations/aws/common/FormWrap';
import { ApiRoutes } from 'integrations/aws/common/Routes';
import { renderOptions } from 'integrations/aws/common/Options';
import useFetch from 'integrations/hooks/useFetch';
import formValidation from 'integrations/aws/utils/formValidation';
import FormDataContext from 'integrations/contexts/FormDataContext';
import { ApiContext } from 'integrations/aws/context/Api';
import { toAWSRequest } from 'integrations/aws/common/formDataAdapter';

import SetupModal from './setup-steps/SetupModal';

const BackButton = styled(Button)`
  margin-right: 9px;
`;

type KinesisSetupProps = {
  onSubmit: (...args: any[]) => void;
  onChange: (...args: any[]) => void;
  toggleSetup?: (...args: any[]) => void;
};

const KinesisSetup = ({ onChange, onSubmit, toggleSetup = null }: KinesisSetupProps) => {
  const { availableGroups, setGroups, clearLogData } = useContext(ApiContext);
  const { formData } = useContext(FormDataContext);
  const [formError, setFormError] = useState(null);
  const [disabledForm, setDisabledForm] = useState(false);
  const [disabledGroups, setDisabledGroups] = useState(false);
  const [showTOS, setShowTOS] = useState(false);
  const [groupNamesStatus, setGroupNamesUrl] = useFetch(
    ApiRoutes.INTEGRATIONS.AWS.CLOUDWATCH.GROUPS,
    (response) => {
      setGroups(response);
    },
    'POST',
    toAWSRequest(formData, { region: formData.awsCloudWatchAwsRegion.value }),
  );

  useEffect(() => {
    if (groupNamesStatus.error) {
      setGroupNamesUrl(null);

      const noGroups = /No CloudWatch log groups/g;

      if (groupNamesStatus.error.match(noGroups)) {
        setFormError({
          full_message: groupNamesStatus.error,
          nice_message: (
            <span>
              我们无法在所选区域中找到任何组。请尝试选择其他区域。
            </span>
          ),
        });

        setDisabledGroups(true);
      } else {
        setFormError({
          full_message: groupNamesStatus.error,
        });
      }
    }

    return () => {
      setGroups({ log_groups: [] });
    };
  }, [groupNamesStatus.error, setGroupNamesUrl, setGroups]);

  const handleAgreeSubmit = () => {
    clearLogData();
    onSubmit();
  };

  const handleFormSubmit = () => {
    setDisabledForm(true);
    setShowTOS(true);
  };

  const handleAgreeCancel = () => {
    setDisabledForm(false);
    setShowTOS(false);
  };

  return (
    <FormWrap
      onSubmit={handleFormSubmit}
      buttonContent="Begin Automated Setup"
      disabled={
        formValidation.isFormValid(['awsCloudWatchKinesisStream', 'awsCloudWatchAwsGroupName'], formData) ||
        disabledForm
      }
      loading={groupNamesStatus.loading}
      error={formError}
      title="自动设置 Kinesis"
      description="">
      <p>
        填写以下字段以启动自动 Kinesis 设置。这将在您的 AWS 账户内执行以下操作。请参见{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/SubscriptionFilters.html">
          使用 CloudWatch Logs 订阅过滤器
        </a>{' '}
        有关更多信息，请参阅 AWS 文档。
      </p>

      <ol>
        <li>使用指定的名称创建新的 Kinesis 数据流。</li>
        <li>创建 IAM 角色/策略，以便将 Kinesis 数据流订阅到 CloudWatch 日志组。</li>
        <li>将新的 Kinesis 数据流订阅到日志组。</li>
      </ol>

      <ValidatedInput
        id="awsCloudWatchKinesisStream"
        type="text"
        label="Kinesis 数据流名称"
        placeholder="数据流名称"
        onChange={onChange}
        fieldData={formData.awsCloudWatchKinesisStream}
        disabled={disabledForm}
        pattern="[a-zA-Z0-9_.-]{1,128}$"
        help="1-128 个字母数字字符以及特殊字符下划线 (_)、句点 (.) 和连字符 (-)。"
        required
      />

      <ValidatedInput
        id="awsCloudWatchAwsGroupName"
        type="select"
        fieldData={formData.awsCloudWatchAwsGroupName}
        onChange={onChange}
        label="CloudWatch 组名称"
        required
        disabled={groupNamesStatus.loading || disabledGroups || disabledForm}>
        {renderOptions(availableGroups, 'Choose CloudWatch Group', groupNamesStatus.loading)}
      </ValidatedInput>

      {toggleSetup && (
        <BackButton onClick={toggleSetup} type="button" disabled={disabledForm}>
          返回数据流选择
        </BackButton>
      )}

      {showTOS && (
        <SetupModal
          onSubmit={handleAgreeSubmit}
          onCancel={handleAgreeCancel}
          groupName={formData.awsCloudWatchAwsGroupName.value}
          streamName={formData.awsCloudWatchKinesisStream.value}
        />
      )}
    </FormWrap>
  );
};

export default KinesisSetup;
