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
import upperFirst from 'lodash/upperFirst';
import toNumber from 'lodash/toNumber';
import toString from 'lodash/toString';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { Select } from 'components/common';
import { Button, Col, ControlLabel, FormGroup, HelpBlock, Row, Input } from 'components/bootstrap';
import EventDefinitionPriorityEnum from 'logic/alerts/EventDefinitionPriorityEnum';
import usePluginEntities from 'hooks/usePluginEntities';
import usePluggableLicenseCheck from 'hooks/usePluggableLicenseCheck';
import * as FormsUtils from 'util/FormsUtils';
import { getPathnameWithoutId } from 'util/URLUtils';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

import type { EventDefinition } from '../event-definitions-types';
import { isSystemEventDefinition } from '../event-definitions-types';
import commonStyles from '../common/commonStyles.css';

const priorityOptions = Object.entries(EventDefinitionPriorityEnum.properties)
  .map(([key, value]) => ({
    value: key,
    label: upperFirst(value.name),
  }))
  .sort((a, b) => Number(b.value) - Number(a.value));

type Props = {
  eventDefinition: EventDefinition;
  eventDefinitionEventProcedure: string;
  validation: {
    errors: {
      title?: string;
    };
  };
  onChange: (name: string, value: string | number) => void;
  canEdit: boolean;
};

const EventDetailsForm = ({ eventDefinition, eventDefinitionEventProcedure, validation, onChange, canEdit }: Props) => {
  const theme = useMantineTheme();
  const ltXl = useMediaQuery(`(min-width: ${theme.breakpoints.xl}`);
  const { pathname } = useLocation();
  const sendTelemetry = useSendTelemetry();
  const [showAddEventProcedureForm, setShowAddEventProcedureForm] = React.useState<boolean>(false);
  const {
    data: { valid: validSecurityLicense },
  } = usePluggableLicenseCheck('/license/security');

  const readOnly = React.useMemo(
    () => !canEdit || isSystemEventDefinition(eventDefinition) || eventDefinition.config.type === 'sigma-v1',
    [canEdit, eventDefinition],
  );
  const showEventProcedureSummar = React.useMemo(
    () => !!eventDefinitionEventProcedure && !showAddEventProcedureForm && validSecurityLicense,
    [eventDefinitionEventProcedure, showAddEventProcedureForm, validSecurityLicense],
  );
  const showAddNewEventProcedure = React.useMemo(
    () => !eventDefinitionEventProcedure && !showAddEventProcedureForm && !readOnly && validSecurityLicense,
    [eventDefinitionEventProcedure, showAddEventProcedureForm, readOnly, validSecurityLicense],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = event.target;

    onChange(name, FormsUtils.getValueFromInput(event.target));
  };

  const handlePriorityChange = (nextPriority: string) => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.EVENTDEFINITION_DETAILS.PRIORITY_CHANGED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_section: 'event-definition-details',
      app_action_value: 'priority-select',
      priority: priorityOptions[toNumber(nextPriority) - 1]?.label,
    });

    onChange('priority', toNumber(nextPriority));
  };

  const PluggableEventProcedureForm = usePluginEntities('views.components.eventProcedureForm')?.[0]?.component;
  const PluggableEventProcedureSummary = usePluginEntities('views.components.eventProcedureSummary')?.[0]?.component;

  return (
    <Row>
      <Col md={7} lg={12}>
        <h2 className={commonStyles.title}>事件详情</h2>
        <fieldset>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
            <Input
              id="event-definition-title"
              name="title"
              label="标题"
              type="text"
              bsStyle={validation.errors.title ? 'error' : null}
              help={
                validation?.errors?.title?.[0] ?? 'Title for this Event Definition, Events and Alerts created from it.'
              }
              value={eventDefinition.title}
              onChange={handleChange}
              readOnly={readOnly}
              required
            />

            <FormGroup controlId="event-definition-priority">
              <ControlLabel>优先级</ControlLabel>
              <Select
                options={priorityOptions}
                value={toString(eventDefinition.priority)}
                onChange={handlePriorityChange}
                clearable={false}
                disabled={readOnly}
                required
              />
              <HelpBlock>选择从此事件定义创建的事件的优先级。</HelpBlock>
            </FormGroup>
          </div>

          <Input
            id="event-definition-description"
            name="description"
            label={
              <span>
                描述 <small className="text-muted">（可选）</small>
              </span>
            }
            type="textarea"
            help="此事件定义的更长描述。"
            value={eventDefinition.description}
            onChange={handleChange}
            readOnly={readOnly}
            rows={2}
          />
          {showAddEventProcedureForm && (
            <PluggableEventProcedureForm
              eventProcedureId={eventDefinitionEventProcedure}
              remediationSteps={eventDefinition?.remediation_steps}
              onClose={() => setShowAddEventProcedureForm(false)}
              onSave={(eventProcedureId) => {
                onChange('event_procedure', eventProcedureId);
                setShowAddEventProcedureForm(false);
              }}
              onRemove={() => {
                onChange('event_procedure', null);
                setShowAddEventProcedureForm(false);
              }}
            />
          )}
          {showEventProcedureSummar && (
            <Col>
              <ControlLabel>事件过程摘要</ControlLabel>
              <PluggableEventProcedureSummary
                eventProcedureId={eventDefinitionEventProcedure}
                canEdit={!readOnly}
                onEdit={() => setShowAddEventProcedureForm(true)}
                onRemove={() => onChange('event_procedure', null)}
                row={ltXl}
              />
            </Col>
          )}
          {showAddNewEventProcedure && (
            <>
              <ControlLabel>事件过程摘要</ControlLabel>
              <p>此事件定义尚未配置任何事件处理程序。</p>
              <Button bsStyle="primary" onClick={() => setShowAddEventProcedureForm(true)}>
                添加事件过程
              </Button>
            </>
          )}
        </fieldset>
      </Col>
    </Row>
  );
};

export default EventDetailsForm;
