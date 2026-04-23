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

import ErrorPage from 'components/errors/ErrorPage';

type Props = {
  displayPageLayout?: boolean,
}

const NotFoundPage = ({ displayPageLayout }: Props) => {
  const description = (
    <>
      <p>派对大猩猩刚才还在这里，但还有另一场派对要去狂欢。</p>
      <p>哦，派对大猩猩！我们多么想念你！我们还能再见到你吗？</p>
    </>
  );

  return (<ErrorPage title="未找到页面" description={description} displayPageLayout={displayPageLayout} />);
};

NotFoundPage.propTypes = {
  displayPageLayout: PropTypes.bool,
};

NotFoundPage.defaultProps = {
  displayPageLayout: true,
};

export default NotFoundPage;
