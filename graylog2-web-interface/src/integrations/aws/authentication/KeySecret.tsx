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
import React from 'react';
import styled from 'styled-components';

import ValidatedInput from 'integrations/aws/common/ValidatedInput';
import MaskedInput from 'integrations/aws/common/MaskedInput';

const StyledMaskedInput = styled(MaskedInput)`
  margin-bottom: 0;
`;

type KeySecretProps = {
  onChange: (...args: any[]) => void;
  awsKey?: any;
  awsSecret?: any;
};

const KeySecret = ({ onChange, awsKey = undefined, awsSecret = undefined }: KeySecretProps) => (
  <>
    <ValidatedInput
      id="awsAccessKey"
      type="text"
      label="AWS 访问密钥"
      placeholder="AK****************"
      onChange={onChange}
      fieldData={awsKey}
      autoComplete="off"
      maxLength={512}
      help='您的 AWS Key 应为以字母 "AK" 开头的 20 位字母数字字符串。'
      required
    />

    <StyledMaskedInput
      id="awsSecretKey"
      label="AWS 密钥"
      placeholder="***********"
      onChange={onChange}
      fieldData={awsSecret}
      autoComplete="off"
      maxLength={512}
      help="您的 AWS Secret 通常是一个 40 字符长、base-64 编码的字符串。"
      required
    />
  </>
);

export default KeySecret;