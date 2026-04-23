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
import { useCallback, useMemo } from 'react';

import { MultiSelect } from 'components/common';
import { Col, ControlLabel, FormGroup, HelpBlock, Row } from 'components/bootstrap';
// TODO: This should be moved to a general place outside of `views`
import useFieldTypes from 'views/logic/fieldtypes/useFieldTypes';
import { ALL_MESSAGES_TIMERANGE } from 'views/Constants';
import { getPathnameWithoutId } from 'util/URLUtils';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import { defaultCompare } from 'logic/DefaultCompare';

import AggregationConditionsForm from './AggregationConditionsForm';

import commonStyles from '../common/commonStyles.css';
import type { EventDefinition, EventProcessorConfig } from '../event-definitions-types';

type Props = {
  eventDefinition: EventDefinition;
  validation: {};
  aggregationFunctions: Array<{}>;
  onChange: (key: string, newValue: any) => void;
};

const AggregationForm = ({ aggregationFunctions, eventDefinition, validation, onChange }: Props) => {
  const { data: allFieldTypes } = useFieldTypes(eventDefinition?.config?.streams ?? [], ALL_MESSAGES_TIMERANGE);
  // Memoize function to only format fields when they change. Use joined fieldNames as cache key.
  const formattedFields = useMemo(() => allFieldTypes ?? [], [allFieldTypes]);
  const formattedFieldOptions = useMemo(
    () =>
      formattedFields
        .sort((ftA, ftB) => defaultCompare(ftA.name, ftB.name))
        .map((fieldType) => ({
          label: `${fieldType.name} – ${fieldType.value.type.type}`,
          value: fieldType.name,
        })),
    [formattedFields],
  );

  const { pathname } = useLocation();
  const sendTelemetry = useSendTelemetry();

  const propagateConfigChange = useCallback(
    (update: Partial<EventProcessorConfig>) => {
      const nextConfig = { ...eventDefinition.config, ...update };

      onChange('config', nextConfig);
    },
    [eventDefinition.config, onChange],
  );

  const handleGroupByChange = useCallback(
    (selected: string) => {
      const nextValue = selected === '' ? [] : selected.split(',');

      sendTelemetry(TELEMETRY_EVENT_TYPE.EVENTDEFINITION_CONDITION.AGGREGATION_GROUP_BY_FIELD_SELECTED, {
        app_pathname: getPathnameWithoutId(pathname),
        app_section: 'event-definition-condition',
        app_action_value: 'group-by-field-select',
        selection_count: nextValue.length,
      });

      propagateConfigChange({ group_by: nextValue });
    },
    [pathname, propagateConfigChange, sendTelemetry],
  );

  return (
    <fieldset>
      <h2 className={commonStyles.title}>聚合</h2>
      <p>
        使用函数汇总上述过滤器匹配的日志消息。您可以选择按相同的字段值对过滤器结果进行分组。
      </p>
      <Row>
        <Col lg={7}>
          <FormGroup controlId="group-by">
            <ControlLabel>
              按字段分组 <small className="text-muted">（可选）</small>
            </ControlLabel>
            <MultiSelect
              id="group-by"
              onChange={handleGroupByChange}
              options={formattedFieldOptions}
              ignoreAccents={false}
              value={(eventDefinition.config.group_by ?? []).join(',')}
              allowCreate
            />
            <HelpBlock>
              选择字段以在具有相同值时分组过滤结果。 <b>示例:</b>
              <br />
              假设您已创建一个过滤器，用于筛选网络中所有失败的登录尝试，当失败的登录尝试总数超过 5 次时，可能会触发告警。现在，添加 <code>username</code> 作为按字段分组，并将触发告警{' '}
              <em>
                对于每个 <code>username</code>
              </em>{' '}
              登录尝试失败超过 5 次。
            </HelpBlock>
          </FormGroup>
        </Col>
      </Row>

      <hr />

      <AggregationConditionsForm
        eventDefinition={eventDefinition}
        validation={validation}
        formattedFields={formattedFields}
        aggregationFunctions={aggregationFunctions}
        onChange={propagateConfigChange}
      />
    </fieldset>
  );
};

export default AggregationForm;
