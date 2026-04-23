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

const EventKeyHelpPopover = () => (
  <>
    事件键是用于将事件分组排列的字段。为每个唯一键创建一个组，生成的事件数量等于找到的唯一键数量。示例：
    <p />
    <b>无事件键:</b> 每个事件一个 <em>登录失败</em> 消息。
    <br />
    <b>
      事件键 <code>username</code>:
    </b>{' '}
    每个用户名一个事件，包含 <em>登录失败</em> 消息。
  </>
);

export default EventKeyHelpPopover;
