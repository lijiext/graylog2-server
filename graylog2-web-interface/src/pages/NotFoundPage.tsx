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

import ErrorPage from 'components/errors/ErrorPage';
import { Link } from 'components/common/router';
import Routes from 'routing/Routes';

type Props = {
  displayPageLayout?: boolean;
};

const NotFoundPage = ({ displayPageLayout = true }: Props) => {
  const description = (
    <>
      <p>您正在查找的页面不存在（或已不再存在）。</p>
      <p>
        您可以返回到 <Link to={Routes.WELCOME}>主页</Link> 并从此处进行导航。
      </p>
    </>
  );

  return <ErrorPage title="未找到页面" description={description} displayPageLayout={displayPageLayout} />;
};

export default NotFoundPage;
