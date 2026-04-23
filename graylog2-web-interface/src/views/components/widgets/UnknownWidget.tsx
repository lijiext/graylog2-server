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
import useProductName from 'brand-customization/useProductName';

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

type Props = WidgetComponentProps & EditWidgetComponentProps;
const UnknownWidget = ({ config, type }: Props) => {
  const productName = useProductName();

  return (
    <Container>
      <IconContainer>
        <Icon name="help" size="3x" />
      </IconContainer>
      <Description>
        <Row>
          <strong>未知小部件: {type}</strong>
        </Row>
        <Row>
          很抱歉，我们无法渲染此小部件，因为我们不知道如何处理类型为的小部件{' '}
          <strong>{type}</strong>。这可能是由以下情况之一引起的：
        </Row>

        <Row>
          <OrderedList>
            <li>您使用一个现已缺失的插件创建了此小部件。</li>
            <li>此小部件属于旧版仪表盘，由一个不再可用的插件创建。</li>
          </OrderedList>
        </Row>

        <Row>
          对此你能做什么？你可以重新加载插件，联系原始插件作者以获取适用于当前版本的插件 {productName}, or remove the widget if you do not need it anymore.
        </Row>
        <Row>
          Either way, you can copy the widget&rsquo;s config to the clipboard:{' '}
          <ClipboardButton
            title={<Icon name="content_copy" size="sm" />}
            text={JSON.stringify(config, null, 2)}
            bsSize="xsmall"
          />
        </Row>
      </Description>
    </Container>
  );
};

export default UnknownWidget;
