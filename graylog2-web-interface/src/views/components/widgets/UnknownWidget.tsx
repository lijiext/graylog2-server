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
import styled from 'styled-components';

import type { EditWidgetComponentProps, WidgetComponentProps } from 'views/types';
import { Icon } from 'components/common';
import ClipboardButton from 'components/common/ClipboardButton';

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IconContainer = styled.div`
  margin: 3px 15px 0 0;
`;

const Description = styled.div`
  max-width: 700px;
`;

const Row = styled.div`
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const OrderedList = styled.ol`
  padding: 0;
  list-style: decimal inside none;
`;

const UnknownWidget: React.ComponentType<WidgetComponentProps & EditWidgetComponentProps> = ({ config, type }: WidgetComponentProps & EditWidgetComponentProps) => (
  <Container>
    <IconContainer>
      <Icon name="help" size="3x" />
    </IconContainer>
    <Description>
      <Row>
        <strong>未知的小部件： {type}</strong>
      </Row>
      <Row>
        很遗憾，我们无法渲染此小部件，因为我们不知道如何处理类型为 <strong>{type}</strong>。这可能是由以下情况之一引起的：
      </Row>

      <Row>
        <OrderedList>
          <li>您使用一个现已缺失的插件创建了此小部件。</li>
          <li>此小部件属于旧版仪表盘，由不再可用的插件创建。</li>
        </OrderedList>
      </Row>

      <Row>
        您能做什么？您可以重新加载插件，联系原始插件作者以获取适用于 Graylog 3.2+ 的插件，或者如果您不再需要该小部件，请将其移除。
      </Row>
      <Row>
        无论哪种方式，您都可以将小部件的配置复制到剪贴板： <ClipboardButton title={<Icon name="content_copy" size="sm" />} text={JSON.stringify(config, null, 2)} bsSize="xsmall" />
      </Row>
    </Description>
  </Container>
);

export default UnknownWidget;
