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
import numeral from 'numeral';
import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components';

import { Timestamp } from 'components/common';
import useGlobalOverride from 'views/hooks/useGlobalOverride';
import useViewType from 'views/hooks/useViewType';
import View from 'views/logic/views/View';
import type QueryResult from 'views/logic/QueryResult';

const EffectiveTimeRange = styled.div`
  margin-bottom: 10px;
`;

const EffectiveTimeRangeTable = styled.table`
  margin-bottom: 5px;

  td:first-child {
    padding-right: 10px;
  }
`;

type Props = {
  results: QueryResult,
};

const SearchResultOverview = ({ results }: Props) => {
  const { timerange: globalOverrideTimeRange } = useGlobalOverride() ?? {};
  const viewType = useViewType();

  if (isEmpty(results)) {
    return <i>尚未执行查询。</i>;
  }

  const { timestamp, duration, effectiveTimerange, searchTypes } = results;
  const total = searchTypes && Object.values(searchTypes)?.[0]?.total;
  const isVariesPerWidget = (viewType === View.Type.Dashboard && !globalOverrideTimeRange);

  return (
    <>
      <p>
        查询执行时间 <br />
        {numeral(duration).format('0,0')}毫秒 <Timestamp dateTime={timestamp} />
      </p>
      <EffectiveTimeRange>
        有效时间范围<br />
        {isVariesPerWidget ? <i>因小部件而异</i>
          : (
            <EffectiveTimeRangeTable>
              <tbody>
                <tr>
                  <td>从</td>
                  <td aria-label="有效时间范围自"><Timestamp dateTime={effectiveTimerange.from} format="complete" /></td>
                </tr>
                <tr>
                  <td>至</td>
                  <td aria-label="有效时间范围至"><Timestamp dateTime={effectiveTimerange.to} format="complete" /></td>
                </tr>
              </tbody>
            </EffectiveTimeRangeTable>
          )}
      </EffectiveTimeRange>
      <p>
        总结果数<br />
        {isVariesPerWidget ? <i>因小部件而异</i> : numeral(total).format('0,0')}
      </p>
    </>
  );
};

SearchResultOverview.propTypes = {
  results: PropTypes.object.isRequired,
};

export default SearchResultOverview;
