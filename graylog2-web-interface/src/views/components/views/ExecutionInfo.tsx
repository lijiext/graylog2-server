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
import numeral from 'numeral';
import isEmpty from 'lodash/isEmpty';

import useAppSelector from 'stores/useAppSelector';
import { selectCurrentQueryResults } from 'views/logic/slices/viewSelectors';
import { Timestamp } from 'components/common';

const ExecutionInfo = () => {
  const result = useAppSelector(selectCurrentQueryResults);

  if (isEmpty(result)) {
    return <i>尚未执行查询。</i>;
  }

  const total = result?.searchTypes && Object.values(result?.searchTypes)?.find((e) => e.total)?.total;

  return (
    <i>
      查询执行时间{' '}
      {numeral(result?.duration).format('0,0')}毫秒 <Timestamp dateTime={result?.timestamp} />
      {' '}总结果数： {numeral(total).format('0,0')}
    </i>
  );
};

export default ExecutionInfo;
