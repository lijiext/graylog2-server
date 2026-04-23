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

import type { VisualizationType } from 'views/types';
import NumberVisualization from 'views/components/visualizations/number/NumberVisualization';
import NumberVisualizationConfig from 'views/logic/aggregationbuilder/visualizations/NumberVisualizationConfig';

type NumberVisualizationConfigFormValues = {
  trend: boolean;
  trend_preference: 'LOWER' | 'NEUTRAL' | 'HIGHER';
};

const singleNumber: VisualizationType<
  typeof NumberVisualization.type,
  NumberVisualizationConfig,
  NumberVisualizationConfigFormValues
> = {
  type: NumberVisualization.type,
  displayName: 'Single Number',
  component: NumberVisualization,
  config: {
    fromConfig: (config: NumberVisualizationConfig | undefined) => ({
      trend: config?.trend,
      trend_preference: config?.trendPreference,
    }),
    toConfig: ({ trend = false, trend_preference }: NumberVisualizationConfigFormValues) =>
      NumberVisualizationConfig.create(trend, trend_preference),
    fields: [
      {
        name: 'trend',
        title: 'Trend',
        type: 'boolean',
        description: 'Show trend information for this number.',
        helpComponent: () => (
          <>
            <p>
              如果用户启用了趋势功能，将在当前值下方显示一个单独的框，通过图标指示变化方向，并显示当前值与前一值之间的绝对差值和相对差值。
            </p>

            <p>
              前一个值是通过在后台执行两次搜索计算得出的，这两次搜索除了时间范围外完全相同。第一次搜索的时间范围与为此查询/此小部件配置的时间范围相同，第二次搜索的时间范围相同，但偏移了时间范围长度并向前推移。
            </p>
          </>
        ),
      },
      {
        name: 'trend_preference',
        title: 'Trend Preference',
        type: 'select',
        options: [
          ['Lower', 'LOWER'],
          ['Neutral', 'NEUTRAL'],
          ['Higher', 'HIGHER'],
        ],
        required: true,
        isShown: (formValues: NumberVisualizationConfigFormValues) => formValues?.trend === true,
      },
    ],
  },
};

export default singleNumber;
