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

/**
 * Component that renders a page when there was an error and certain information can't be fetched. Use it
 * only when the page would make no sense if the information is not available (i.e. a node page where we
 * can't reach the node).
 */
const PageErrorOverview = ({ errors }) => {
  const formattedErrors = errors ? errors.map((error) => <li key={`key-${error.toString()}`}>{error.toString()}</li>) : [];
  const description = <p>获取构建此页面所需的部分数据时遇到问题，因此这里提供了一张图片。</p>;

  return (
    <ErrorPage title="获取数据时出错" description={description} displayPageLayout={false}>
      <ul>
        {formattedErrors}
        <li>请查看 Graylog 日志以获取更多信息。</li>
      </ul>
    </ErrorPage>
  );
};

PageErrorOverview.propTypes = {
  /** Array of errors that prevented the original page to load. */
  errors: PropTypes.array.isRequired,
};

export default PageErrorOverview;
