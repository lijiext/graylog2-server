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
import BarVisualization from 'views/components/visualizations/bar/BarVisualization';
import BarVisualizationConfig, { DEFAULT_BARMODE } from 'views/logic/aggregationbuilder/visualizations/BarVisualizationConfig';
import { hasAtLeastOneMetric } from 'views/components/visualizations/validations';
import type { AxisType } from 'views/logic/aggregationbuilder/visualizations/XYVisualization';
import { axisTypes, DEFAULT_AXIS_TYPE } from 'views/logic/aggregationbuilder/visualizations/XYVisualization';

type BarVisualizationConfigFormValues = {
  barmode: 'group' | 'stack' | 'relative' | 'overlay',
  axisType: AxisType,
};

const validate = hasAtLeastOneMetric('Bar chart');

const barChart: VisualizationType<typeof BarVisualization.type, BarVisualizationConfig, BarVisualizationConfigFormValues> = {
  type: BarVisualization.type,
  displayName: '条形图',
  component: BarVisualization,
  config: {
    createConfig: () => ({ barmode: DEFAULT_BARMODE, axisType: DEFAULT_AXIS_TYPE }),
    fromConfig: (config: BarVisualizationConfig | undefined) => ({ barmode: config?.barmode ?? DEFAULT_BARMODE, axisType: config?.axisType ?? DEFAULT_AXIS_TYPE }),
    toConfig: (formValues: BarVisualizationConfigFormValues) => BarVisualizationConfig.create(formValues.barmode, formValues.axisType),
    fields: [{
      name: 'barmode',
      title: 'Mode',
      type: 'select',
      options: [['Group', 'group'], ['Stack', 'stack'], ['Relative', 'relative'], ['Overlay', 'overlay']],
      required: true,
      helpComponent: () => {
        const options = {
          group: {
            label: 'Group',
            help: '图表中的每个系列都由其独立的条形表示。',
          },
          stack: {
            label: 'Stack',
            help: '所有系列相互堆叠，最终形成一根条形。',
          },
          relative: {
            label: '相对',
            help: '所有系列相互堆叠，最终形成一个图表。但负值系列将显示在零线下方。',
          },
          overlay: {
            label: '覆盖层',
            help: 'All series are placed as bars upon each other. To be able to see the bars the opacity is reduced to 75%.'
              + ' It is recommended to use this option with not more than 3 series.',
          },
        };

        return (
          <ul>
            {Object.values(options).map(({ label, help }) => (
              <li key={label}>
                <h4>{label}</h4>
                {help}
              </li>
            ))}
          </ul>
        );
      },
    }, {
      name: 'axisType',
      title: '轴类型',
      type: 'select',
      options: axisTypes,
      required: true,
    }],
  },
  capabilities: ['event-annotations'],
  validate,
};

export default barChart;
