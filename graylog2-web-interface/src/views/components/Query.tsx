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

import DocsHelper from 'util/DocsHelper';
import { Jumbotron } from 'components/bootstrap';
import DocumentationLink from 'components/support/DocumentationLink';
import IfDashboard from 'views/components/dashboard/IfDashboard';
import IfSearch from 'views/components/search/IfSearch';
import WidgetGrid from 'views/components/WidgetGrid';
import useWidgets from 'views/hooks/useWidgets';
import usePluggableUpsellWrapper from 'hooks/usePluggableUpsellWrapper';

const StyledJumbotron = styled(Jumbotron)(
  ({ theme }) => css`
    .container-fluid & {
      border: 1px solid ${theme.colors.gray[80]};
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      margin-bottom: 0;
    }
  `,
);

const NoWidgetsInfo = () => {
  const UpsellWrapper = usePluggableUpsellWrapper();

  return (
    <StyledJumbotron>
      <h2>
        <IfDashboard>此仪表盘尚未包含任何小部件</IfDashboard>
        <IfSearch>未定义用于可视化搜索结果的组件</IfSearch>
      </h2>
      <br />
      <p>
        在左侧边栏的“创建”部分选择小部件类型以创建新的小部件。
        <br />
      </p>
      <p>一些关于创建搜索和仪表盘的提示</p>
      <ul>
        <li>
          <p>
            1. 从开始 <b>question</b> 您想要回答的问题。请定义您想要解决的问题。
          </p>
        </li>
        <li>
          <p>
            2. <b>限制</b> 仅显示您想要查看的数据点。
          </p>
        </li>
        <li>
          <p>
            3. <b>可视化</b> 数据。它是否回答了您的问题？
          </p>
        </li>
        <IfDashboard>
          <li>
            <p>
              4. <b>分享</b> 与您的同事共享仪表盘。准备好它 <b>reuse</b> 通过使用参数
              <UpsellWrapper>
                {' '}
                (包含在{' '}
                <a href="https://www.graylog.org/graylog-enterprise-edition" target="_blank" rel="noopener noreferrer">
                  Graylog 企业版
                </a>
                )
              </UpsellWrapper>
              .
            </p>
          </li>
        </IfDashboard>
      </ul>
      <p>
        您也可以查看 <DocumentationLink page={DocsHelper.PAGES.DASHBOARDS} text="documentation" />,
        to learn more about the widget creation.
      </p>
    </StyledJumbotron>
  );
};

const useHasWidgets = () => {
  const widgets = useWidgets();

  return widgets?.size > 0;
};

const Query = () => {
  const hasWidgets = useHasWidgets();

  return hasWidgets ? <WidgetGrid /> : <NoWidgetsInfo />;
};

const memoizedQuery = React.memo(Query);
memoizedQuery.displayName = 'Query';

export default memoizedQuery;
