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

import { Input } from 'components/bootstrap';
import { FormDataContext } from 'integrations/aws/context/FormData';
import { AdvancedOptionsContext } from 'integrations/aws/context/AdvancedOptions';
import AdditionalFields from 'integrations/aws/common/AdditionalFields';

const FormAdvancedOptions = ({ onChange }) => {
  const { formData } = useContext(FormDataContext);
  const { isAdvancedOptionsVisible, setAdvancedOptionsVisibility } = useContext(AdvancedOptionsContext);

  const {
    awsCloudWatchBatchSize,
    awsCloudWatchThrottleEnabled,
    awsCloudWatchAddFlowLogPrefix,
  } = formData;

  const handleToggle = (visible) => {
    setAdvancedOptionsVisibility(visible);
  };

  return (
    <StyledAdditionalFields title="高级选项" visible={isAdvancedOptionsVisible} onToggle={handleToggle}>
      <Input id="awsCloudWatchThrottleEnabled"
             type="checkbox"
             value="enable-throttling"
             defaultChecked={awsCloudWatchThrottleEnabled && awsCloudWatchThrottleEnabled.value}
             onChange={onChange}
             label="启用限流"
             help="如果启用，在 Graylog 追上其消息负载之前，不会从此输入端读取新消息。这通常适用于从文件或消息队列系统（如 AMQP 或 Kafka）读取的输入端。如果您定期轮询外部系统（例如通过 HTTP），通常应保持此选项禁用。" />

      <Input id="awsCloudWatchAddFlowLogPrefix"
             type="checkbox"
             value="enable-logprefix"
             defaultChecked={awsCloudWatchAddFlowLogPrefix && awsCloudWatchAddFlowLogPrefix.value}
             onChange={onChange}
             label="添加流日志字段名称前缀"
             help='添加带有 Flow Log 前缀的字段，例如 "src_addr" -> "flow_log_src_addr"。' />

      <Input id="awsCloudWatchBatchSize"
             type="number"
             value={awsCloudWatchBatchSize.value || awsCloudWatchBatchSize.defaultValue}
             onChange={onChange}
             label="Kinesis 记录批次大小"
             help="每次获取的 Kinesis 记录数。每条记录大小可达 1MB。AWS 默认值为 10,000。输入较小的值以每次处理较小的数据块。" />
    </StyledAdditionalFields>
  );
};

FormAdvancedOptions.propTypes = {
  onChange: PropTypes.func.isRequired,
};

const StyledAdditionalFields = styled(AdditionalFields)`
margin: 0 0 35px;
`;

export default FormAdvancedOptions;
