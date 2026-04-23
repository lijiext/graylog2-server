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

import ThrottlingCheckbox from 'integrations/components/ThrottlingCheckbox';
import { Input } from 'components/bootstrap';
import FormDataContext from 'integrations/contexts/FormDataContext';
import { AdvancedOptionsContext } from 'integrations/aws/context/AdvancedOptions';
import AdditionalFields from 'integrations/aws/common/AdditionalFields';

type FormAdvancedOptionsProps = {
  onChange: (...args: any[]) => void;
};

const FormAdvancedOptions = ({ onChange }: FormAdvancedOptionsProps) => {
  const { formData } = useContext(FormDataContext);
  const { isAdvancedOptionsVisible, setAdvancedOptionsVisibility } = useContext(AdvancedOptionsContext);

  const { awsCloudWatchBatchSize, overrideSource, awsCloudWatchThrottleEnabled, awsCloudWatchAddFlowLogPrefix } =
    formData;

  const handleToggle = (visible) => {
    setAdvancedOptionsVisibility(visible);
  };

  return (
    <AdditionalFields title="高级选项" visible={isAdvancedOptionsVisible} onToggle={handleToggle}>
      <ThrottlingCheckbox
        id="awsCloudWatchThrottleEnabled"
        defaultChecked={awsCloudWatchThrottleEnabled?.value}
        onChange={onChange}
      />

      <Input
        id="awsCloudWatchAddFlowLogPrefix"
        type="checkbox"
        value="enable-logprefix"
        defaultChecked={awsCloudWatchAddFlowLogPrefix && awsCloudWatchAddFlowLogPrefix.value}
        onChange={onChange}
        label="添加流日志字段名称前缀"
        help='添加带有 Flow Log 前缀的字段，例如 "src_addr" -> "flow_log_src_addr"。'
      />

      <Input
        id="overrideSource"
        type="text"
        value={overrideSource?.value}
        onChange={onChange}
        label="覆盖源（可选）"
        help="消息源默认设置为 aws-kinesis-raw-logs。如有需要，您可以使用自定义值覆盖它。"
      />

      <Input
        id="awsCloudWatchBatchSize"
        type="number"
        value={awsCloudWatchBatchSize.value || awsCloudWatchBatchSize.defaultValue}
        onChange={onChange}
        label="Kinesis 记录批次大小"
        help="每次获取的 Kinesis 记录数。每条记录大小可达 1MB。AWS 默认值为 10,000。输入较小的值可分批次处理较小的数据块。"
      />
    </AdditionalFields>
  );
};

export default FormAdvancedOptions;
