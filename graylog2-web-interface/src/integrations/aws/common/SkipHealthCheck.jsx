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
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import FormWrap from 'integrations/aws/common/FormWrap';
import AdditionalFields from 'integrations/aws/common/AdditionalFields';
import { renderOptions } from 'integrations/aws/common/Options';
import ValidatedInput from 'integrations/aws/common/ValidatedInput';
import { KINESIS_LOG_TYPES } from 'integrations/aws/common/constants';
import { FormDataContext } from 'integrations/aws/context/FormData';

const SkipHealthCheck = ({ onChange, onSubmit }) => {
  const { formData } = useContext(FormDataContext);

  return (
    <AdditionalFields title="跳过健康检查">
      <StyledFormWrap onSubmit={onSubmit}
                      buttonContent="Confirm"
                      title="选择日志类型并跳过健康检查"
                      disabled={!(formData.awsCloudWatchKinesisInputType && formData.awsCloudWatchKinesisInputType.value)}
                      description={(
                        <p>如果您确定新数据中包含的内容 <strong>{formData.awsCloudWatchKinesisStream.value}</strong> 数据流，然后在下方选择您的选项以跳过我们的自动检查。</p>
                      )}>

        <ValidatedInput id="awsCloudWatchKinesisInputType"
                        type="select"
                        fieldData={formData.awsCloudWatchKinesisInputType}
                        onChange={onChange}
                        label="选择 AWS 输入类型"
                        required>
          {renderOptions(KINESIS_LOG_TYPES, 'Choose Log Type')}
        </ValidatedInput>
      </StyledFormWrap>
    </AdditionalFields>
  );
};

SkipHealthCheck.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

const StyledFormWrap = styled(FormWrap)`
  padding-top: 25px;
`;

export default SkipHealthCheck;
