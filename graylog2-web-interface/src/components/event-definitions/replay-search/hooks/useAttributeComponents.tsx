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
import React, { useMemo } from 'react';
import moment from 'moment/moment';
import styled, { css } from 'styled-components';
import upperFirst from 'lodash/upperFirst';

import { TIME_UNITS } from 'components/event-definitions/event-definition-types/FilterForm';
import EventDefinitionPriorityEnum from 'logic/alerts/EventDefinitionPriorityEnum';
import useAlertAndEventDefinitionData from 'hooks/useAlertAndEventDefinitionData';
import { extractDurationAndUnit } from 'components/common/TimeUnitInput';
import { Timestamp, HoverForHelp } from 'components/common';
import { Link } from 'components/common/router';
import Routes from 'routing/Routes';

import AggregationConditions from '../AggreagtionConditions';
import Notifications from '../Notifications';

const AlertTimestamp = styled(Timestamp)(({ theme }) => css`
  color: ${theme.colors.variant.darker.warning};
`);

const useAttributeComponents = () => {
  const { eventData, eventDefinition, isEventDefinition } = useAlertAndEventDefinitionData();

  return useMemo(() => {
    if (!eventDefinition) {
      return [
        { title: '时间戳', content: <Timestamp dateTime={eventData?.timestamp} />, show: !isEventDefinition },
      ];
    }

    const searchWithin = extractDurationAndUnit(eventDefinition.config.search_within_ms, TIME_UNITS);
    const executeEvery = extractDurationAndUnit(eventDefinition.config.execute_every_ms, TIME_UNITS);
    const isEDUpdatedAfterEvent = !isEventDefinition && moment(eventDefinition.updated_at).diff(eventData.timestamp) > 0;

    return [
      { title: '时间戳', content: <Timestamp dateTime={eventData?.timestamp} />, show: !isEventDefinition },
      {
        title: '事件定义更新时间',
        content: (
          <>
            <AlertTimestamp dateTime={eventDefinition.updated_at} />
            <HoverForHelp displayLeftMargin iconSize="xs">
              事件定义 <i>{eventDefinition.title}</i> 此事件发生后进行了编辑。某些聚合小部件可能无法代表此事件。
            </HoverForHelp>
          </>
        ),
        show: isEDUpdatedAfterEvent,
      },
      {
        title: '事件定义',
        content: (
          <Link target="_blank"
                to={Routes.ALERTS.DEFINITIONS.show(eventDefinition.id)}>
            {eventDefinition.title}
          </Link>
        ),
        show: !isEventDefinition,
      },
      {
        title: '优先级',
        content: upperFirst(EventDefinitionPriorityEnum.properties[eventDefinition.priority].name),
      },
      { title: '每${var}执行搜索', content: executeEvery?.duration && executeEvery?.unit && `${executeEvery.duration} ${executeEvery.unit.toLowerCase()}` },
      { title: '在...中搜索', content: searchWithin?.duration && searchWithin?.unit && `${searchWithin.duration} ${searchWithin.unit.toLowerCase()}` },
      { title: '描述', content: eventDefinition.description },
      {
        title: '通知',
        content: <Notifications />,
      },
      {
        title: '聚合条件',
        content: <AggregationConditions />,
      },
    ];
  }, [
    eventData?.timestamp,
    eventDefinition,
    isEventDefinition,
  ]);
};

export default useAttributeComponents;
