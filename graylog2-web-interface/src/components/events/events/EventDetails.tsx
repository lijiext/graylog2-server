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
import isEmpty from 'lodash/isEmpty';

import usePluginEntities from 'hooks/usePluginEntities';
import { Col, Row } from 'components/bootstrap';
import { Timestamp } from 'components/common';
import { MarkdownPreview } from 'components/common/MarkdownEditor';
import type { Event, EventDefinitionContext } from 'components/events/events/types';
import EventFields from 'components/events/events/EventFields';
import EventDefinitionLink from 'components/event-definitions/event-definitions/EventDefinitionLink';
import LinkToReplaySearch from 'components/event-definitions/replay-search/LinkToReplaySearch';
import PriorityName from 'components/events/events/PriorityName';

export const usePluggableEventActions = (eventId: string) => {
  const pluggableEventActions = usePluginEntities('views.components.eventActions');

  return pluggableEventActions.filter(
    (perspective) => (perspective.useCondition ? !!perspective.useCondition() : true),
  ).map(
    ({ component: PluggableEventAction, key }) => (
      <PluggableEventAction key={key} eventId={eventId} />
    ),
  );
};

type Props = {
  event: Event,
  eventDefinitionContext: EventDefinitionContext,
};

const EventDetails = ({ event, eventDefinitionContext }: Props) => {
  const eventDefinitionTypes = usePluginEntities('eventDefinitionTypes');
  const pluggableActions = usePluggableEventActions(event.id);

  const plugin = useMemo(() => {
    if (event.event_definition_type === undefined) {
      return null;
    }

    return eventDefinitionTypes.find((edt) => edt.type === event.event_definition_type);
  }, [event, eventDefinitionTypes]);

  return (
    <Row>
      <Col md={6}>
        <dl>
          <dt>ID</dt>
          <dd>{event.id}</dd>
          <dt>优先级</dt>
          <dd>
            <PriorityName priority={event.priority} />
          </dd>
          <dt>时间戳</dt>
          <dd> <Timestamp dateTime={event.timestamp} />
          </dd>
          <dt>事件定义</dt>
          <dd>
            <EventDefinitionLink event={event} eventDefinitionContext={eventDefinitionContext} />
            &emsp;
            ({(plugin && plugin.displayName) || event.event_definition_type})
          </dd>
          <dt>补救步骤</dt>
          <dd>
            {eventDefinitionContext?.remediation_steps ? (
              <MarkdownPreview show
                               withFullView
                               noBorder
                               noBackground
                               value={eventDefinitionContext.remediation_steps} />
            ) : (
              <i>无修复步骤</i>
            )}
          </dd>
          {!event.event_definition_type.startsWith('system-notifications') && (
            <>
              <dt>操作</dt>
              {event.replay_info && (
              <dd>
                <LinkToReplaySearch id={event.id} isEvent />
              </dd>
              )}
              {pluggableActions}
            </>
          )}
        </dl>
      </Col>
      <Col md={6}>
        <dl>
          {event.timerange_start && event.timerange_end && (
            <>
              <dt>聚合时间范围</dt>
              <dd>
                <Timestamp dateTime={event.timerange_start} />
                &ensp;&mdash;&ensp;
                <Timestamp dateTime={event.timerange_end} />
              </dd>
            </>
          )}
          <dt>事件键</dt>
          <dd>{event.key || 'No Key set for this Event.'}</dd>
          <dt>附加字段</dt>
          {isEmpty(event.fields)
            ? <dd>未向此事件添加其他字段。</dd>
            : <EventFields fields={event.fields} />}
          <dt>分组字段</dt>
          {isEmpty(event.group_by_fields)
            ? <dd>此事件无分组字段。</dd>
            : <EventFields fields={event.group_by_fields} />}
        </dl>
      </Col>
    </Row>
  );
};

export default EventDetails;
