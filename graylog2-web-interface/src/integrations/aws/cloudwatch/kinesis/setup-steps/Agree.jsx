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
import PropTypes from 'prop-types';

const Agree = ({ groupName, streamName }) => (
  <>
    <p>此自动设置将创建以下 AWS 资源。点击下方以确认您了解这些资源将被创建，且您需独自承担由此产生的所有相关 AWS 费用。请注意，如果不再需要这些资源，您必须手动删除它们。</p>

    <ol>
      <li>创建 Kinesis 数据流，使用 <strong>1</strong> 分片。</li>
      <li>创建 IAM 角色和策略以允许指定的 CloudWatch 组 <strong>{groupName}</strong> 将日志消息发布到 Kinesis 数据流 <strong>{streamName}</strong></li>
      <li>创建 CloudWatch 订阅，将日志消息发布到 Kinesis 流。</li>
    </ol>
  </>
);

Agree.propTypes = {
  groupName: PropTypes.string.isRequired,
  streamName: PropTypes.string.isRequired,
};

export default Agree;
