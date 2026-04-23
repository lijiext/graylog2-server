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
import styled, { css } from 'styled-components';

type Props = {
  gracePeriod: string,
};

const Wrapper = styled.div(({ theme }) => css`
  margin-bottom: ${theme.spacings.md};
  overflow: auto;
`);

const StyledDefList = styled.dl.attrs({ className: 'deflist' })(({ theme }) => css`
  &&.deflist {
    dd {
      padding-left: ${theme.spacings.md};
      display: table-cell;
    }
  }
`);

const GlobalProcessingView = ({ gracePeriod }: Props) => (
  <Wrapper>
    <h2>全局处理规则配置</h2>
    <p>全局处理规则在输入端接收后应用，并在消息处理器应用的处理规则之前应用。</p>
    <StyledDefList>
      <dt>未来时间戳规范化：</dt>
      <dd>{gracePeriod ? 'Enabled' : 'Disabled'}</dd>
      <dt>宽限期：</dt>
      <dd>{gracePeriod}</dd>
    </StyledDefList>
  </Wrapper>
);

export default GlobalProcessingView;
