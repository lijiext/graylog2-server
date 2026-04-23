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
import React, { useContext, useEffect } from 'react';
import styled, { css } from 'styled-components';

import { Button } from 'components/bootstrap';
import RenderCompletionCallback from 'views/components/widgets/RenderCompletionCallback';
import { UPDATE_WIDGET_BTN_TEXT } from 'views/components/widgets/SaveOrCancelButtons';
import { UPDATE_WIDGET_PREVIEW_BTN_TEXT } from 'views/components/aggregationwizard/ElementsConfigurationActions';

import InteractiveContext from '../contexts/InteractiveContext';

type Props = {
  toggleEdit: () => void;
  editing?: boolean;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: inherit;
`;

const SpacedHeading = styled.h2(
  ({ theme }) => css`
    margin-bottom: ${theme.spacings.sm};
  `,
);

const EmptyAggregationContent = ({ toggleEdit, editing = false }: Props) => {
  const onRenderComplete = useContext(RenderCompletionCallback);

  useEffect(() => {
    if (onRenderComplete) {
      onRenderComplete();
    }
  }, [onRenderComplete]);

  const interactive = useContext(InteractiveContext);
  const text = editing ? (
    <p>
      您现在正在编辑小部件。
      <br />
      要查看结果，请添加至少一个指标。您可以通过添加行/列来对数据进行分组。
      <br />
      您可以通过点击"来预览小部件的搜索结果{UPDATE_WIDGET_PREVIEW_BTN_TEXT}&quot;.
      <br />
      完成，请点击 "{UPDATE_WIDGET_BTN_TEXT}按"保存"以保存，按"取消"以放弃更改。
    </p>
  ) : (
    <p>
      请{' '}
      {interactive ? (
        <Button bsStyle="info" onClick={toggleEdit}>
          编辑
        </Button>
      ) : (
        'edit'
      )}{' '}
      在此处查看结果的组件。
    </p>
  );

  return (
    <Container>
      <div>
        <SpacedHeading>空聚合</SpacedHeading>

        {text}
      </div>
    </Container>
  );
};

export default EmptyAggregationContent;
