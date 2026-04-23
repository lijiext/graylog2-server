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

import { Button } from 'components/bootstrap';
import Popover from 'components/common/Popover';
import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';

import DecoratorStyles from './decoratorStyles.css';

const PopoverHelp = () => (
  <Popover width={275} position="right" withArrow withinPortal>
    <Popover.Target>
      <Button bsStyle="link" className={DecoratorStyles.helpLink}>
        什么是消息装饰器？
      </Button>
    </Popover.Target>
    <Popover.Dropdown>
      <p className="description">
        装饰器可以动态修改搜索结果中显示的消息。这些更改不会被存储，仅显示在搜索结果中。装饰器配置会被存储 <strong>每个数据流</strong>.
      </p>
      <p className="description">使用拖放功能修改装饰器的处理顺序。</p>
      <p>
        有关消息装饰器的更多信息，请查看{' '}
        <DocumentationLink page={DocsHelper.PAGES.DECORATORS} text="documentation" />.
      </p>
    </Popover.Dropdown>
  </Popover>
);

export default PopoverHelp;
