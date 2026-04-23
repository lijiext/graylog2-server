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

import PageHeader from 'components/common/PageHeader';
import SectionComponent from 'components/common/Section/SectionComponent';
import { Link } from 'components/common/router';
import Routes from 'routing/Routes';
import type { StartPage } from 'logic/users/User';
import ContentStreamContainer from 'components/content-stream/ContentStreamContainer';

import LastOpenList from './LastOpenList';
import FavoriteItemsList from './FavoriteItemsList';
import RecentActivityList from './RecentActivityList';

import SectionGrid from '../common/Section/SectionGrid';
import useCurrentUser from '../../hooks/useCurrentUser';

const StyledSectionComponent = styled(SectionComponent)`
  flex-grow: 1;
`;

type HelperProps = { readOnly: boolean, userId: string, startpage: StartPage }

const ChangeStartPageHelper = ({ readOnly, userId, startpage }: HelperProps) => {
  const defaultPageIsDefined = startpage !== null;

  if (defaultPageIsDefined || readOnly) {
    return (
      <span>
        这是您的个人页面，可让您轻松访问最相关的内容。
      </span>
    );
  }

  return (
    <>
      <span>
        这是您的个人起始页，可轻松访问对您最相关的内容。
      </span>
      <span>
        {' '}
        您可以在 上更改您的个人起始页面 <Link to={Routes.SYSTEM.USERS.edit(userId)}>编辑个人资料</Link> 页面。
      </span>
    </>
  );
};

const Welcome = () => {
  const { permissions, readOnly, id: userId, startpage } = useCurrentUser();
  const isAdmin = permissions.includes('*');

  return (
    <>
      <PageHeader title="欢迎使用 Graylog!">
        <ChangeStartPageHelper userId={userId} readOnly={readOnly} startpage={startpage} />
      </PageHeader>
      <SectionGrid>
        <StyledSectionComponent title="上次打开">
          <p className="description">最近访问的保存搜索和仪表盘概览。</p>
          <LastOpenList />
        </StyledSectionComponent>
        <StyledSectionComponent title="收藏项">
          <p className="description">您收藏的保存搜索和仪表盘概览。</p>
          <FavoriteItemsList />
        </StyledSectionComponent>
      </SectionGrid>
      <StyledSectionComponent title="最近活动">
        <p className="description">
          {isAdmin
            ? '此列表包含 Graylog 用户执行的所有操作，例如创建或共享实体。'
            : '关于您或他人对与您相关的实体执行的操作的概述，例如创建或共享实体。'}
        </p>
        <RecentActivityList />
      </StyledSectionComponent>
      <ContentStreamContainer />
    </>
  );
};

export default Welcome;
