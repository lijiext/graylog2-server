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
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Link } from 'components/common/router';
import Routes from 'routing/Routes';
import { Input } from 'components/bootstrap';
import { Icon } from 'components/common';
import { FormDataContext } from 'integrations/aws/context/FormData';
import { ApiContext } from 'integrations/aws/context/Api';
import useFetch from 'integrations/aws/common/hooks/useFetch';
import FormWrap from 'integrations/aws/common/FormWrap';
import { ApiRoutes } from 'integrations/aws/common/Routes';
import { DEFAULT_KINESIS_LOG_TYPE, KINESIS_LOG_TYPES } from 'integrations/aws/common/constants';

const Default = ({ value }) => (
  <>{value} <small>(默认)</small></>
);

Default.propTypes = {
  value: PropTypes.string.isRequired,
};

const StepReview = ({ onSubmit, onEditClick, externalInputSubmit }) => {
  const [formError, setFormError] = useState(null);
  const { formData } = useContext(FormDataContext);
  const { logData } = useContext(ApiContext);
  const {
    awsAuthenticationType,
    awsCloudWatchAddFlowLogPrefix = { value: undefined },
    awsCloudWatchAssumeARN = { value: undefined },
    awsCloudWatchAwsKey = { value: undefined },
    awsCloudWatchAwsRegion,
    awsCloudWatchBatchSize,
    awsEndpointCloudWatch = { value: undefined },
    awsCloudWatchKinesisInputType = { value: DEFAULT_KINESIS_LOG_TYPE },
    awsCloudWatchKinesisStream,
    awsCloudWatchName,
    awsCloudWatchThrottleEnabled = { value: undefined },
    awsEndpointDynamoDB = { value: undefined },
    awsEndpointIAM = { value: undefined },
    awsEndpointKinesis = { value: undefined },
  } = formData;

  const throttleEnabled = !!awsCloudWatchThrottleEnabled.value;
  const addPrefix = !!awsCloudWatchAddFlowLogPrefix.value;

  const [fetchSubmitStatus, setSubmitFetch] = useFetch(
    null,
    () => {
      onSubmit();
    },
    'POST',
    {
      name: awsCloudWatchName.value,
      region: awsCloudWatchAwsRegion.value,
      aws_input_type: awsCloudWatchKinesisInputType.value,
      stream_name: awsCloudWatchKinesisStream.value,
      batch_size: Number(awsCloudWatchBatchSize.value || awsCloudWatchBatchSize.defaultValue),
      enable_throttling: throttleEnabled,
      add_flow_log_prefix: addPrefix,
    },
  );

  useEffect(() => {
    if (fetchSubmitStatus.error) {
      setFormError({
        full_message: fetchSubmitStatus.error,
        nice_message: <span>无法保存您的输入端，请稍后再试。</span>,
      });
    }
  }, [fetchSubmitStatus.error]);

  const handleSubmit = () => {
    if (externalInputSubmit) {
      onSubmit(formData);

      return;
    }

    setSubmitFetch(ApiRoutes.INTEGRATIONS.AWS.KINESIS.SAVE);
  };

  return (
    <FormWrap onSubmit={handleSubmit}
              buttonContent="Complete CloudWatch Setup"
              loading={fetchSubmitStatus.loading}
              error={formError}
              title="最终审查"
              description="请检查下方的所有内容以确保正确，然后点击下方按钮完成 CloudWatch 设置！">

      <Container>
        <Subheader>设置 CloudWatch <small><EditAnchor onClick={onEditClick('authorize')}>编辑</EditAnchor></small></Subheader>
        <ReviewItems>
          <li>
            <strong>名称</strong>
            <span>{awsCloudWatchName.value}</span>
          </li>

          <li>
            <strong>认证类型</strong>
            <span>{awsAuthenticationType.value}</span>
          </li>

          {awsCloudWatchAwsKey.value && (
            <li>
              <strong>AWS 密钥</strong>
              <span>{awsCloudWatchAwsKey.value}</span>
            </li>
          )}

          {awsCloudWatchAssumeARN.value && (
            <li>
              <strong>AWS 假设 ARN 角色</strong>
              <span>{awsCloudWatchAssumeARN.value}</span>
            </li>
          )}

          {awsEndpointCloudWatch.value && (
            <li>
              <strong>CloudWatch VPC 端点</strong>
              <span>{awsEndpointCloudWatch.value}</span>
            </li>
          )}

          {awsEndpointDynamoDB.value && (
            <li>
              <strong>DynamoDB VPC 端点</strong>
              <span>{awsEndpointDynamoDB.value}</span>
            </li>
          )}

          {awsEndpointIAM.value && (
            <li>
              <strong>IAM VPC 端点</strong>
              <span>{awsEndpointIAM.value}</span>
            </li>
          )}

          {awsEndpointKinesis.value && (
            <li>
              <strong>Kinesis VPC 端点</strong>
              <span>{awsEndpointKinesis.value}</span>
            </li>
          )}

          <li>
            <strong>AWS 区域</strong>
            <span>{awsCloudWatchAwsRegion.value}</span>
          </li>
        </ReviewItems>

        <Subheader>设置 Kinesis <small><EditAnchor onClick={onEditClick('kinesis-setup')}>编辑</EditAnchor></small></Subheader>
        <ReviewItems>
          <li>
            <strong>数据流</strong>
            <span>{awsCloudWatchKinesisStream.value}</span>
          </li>
          <li>
            <strong>全局输入端</strong>
            <span><Icon name="done" /></span>
          </li>
          <li>
            <strong>记录批次大小</strong>
            <span>
              {
                awsCloudWatchBatchSize.value
                  ? awsCloudWatchBatchSize.value
                  : <Default value={awsCloudWatchBatchSize.defaultValue} />
              }
            </span>
          </li>
          <li>
            <strong>启用限流</strong>
            <span><Icon name={throttleEnabled ? 'check_circle' : 'cancel'} /></span>
          </li>
          <li>
            <strong>为字段名称添加流日志前缀</strong>
            <span><Icon name={addPrefix ? 'check_circle' : 'cancel'} /></span>
          </li>
        </ReviewItems>

        <Subheader>格式化</Subheader>
        <ReviewItems>
          <li>
            <strong>日志类型</strong>
            <span>{KINESIS_LOG_TYPES.find((type) => type.value === awsCloudWatchKinesisInputType.value).label}</span>
          </li>
        </ReviewItems>
        <p>如果您需要以不同方式解析日志，请查看我们的 <Link to={Routes.SYSTEM.PIPELINES.RULES}>管道规则</Link> 有关详细信息和说明。</p>

        <Input id="awsCloudWatchLog"
               type="textarea"
               label=""
               value={(logData && logData.message) || "We haven't received a response back from Amazon yet."}
               rows={10}
               disabled />
      </Container>
    </FormWrap>
  );
};

StepReview.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  externalInputSubmit: PropTypes.bool,
};

StepReview.defaultProps = {
  externalInputSubmit: false,
};

const Container = styled.div`
  border: 1px solid #a6afbd;
  margin: 25px 0;
  padding: 15px;
  border-radius: 4px;
`;

const Subheader = styled.h3`
  margin: 0 0 10px;
`;

const ReviewItems = styled.ul`
  list-style: none;
  margin: 0 0 25px 10px;
  padding: 0;

  li {
    padding: 5px;

    &:nth-of-type(odd) {
      background-color: rgb(220 225 229 / 40%);
    }
  }

  strong::after {
    content: ':';
    margin-right: 5px;
  }
`;

const EditAnchor = styled.a`
  font-size: 12px;
  margin-left: 5px;
  font-style: italic;
  cursor: pointer;

  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }
`;

export default StepReview;
