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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Routes from 'routing/Routes';
import { LinkContainer } from 'components/common/router';
import {
  IfPermitted,
  ShareButton,
  ConfirmDialog,
} from 'components/common';
import {
  ButtonToolbar,
  MenuItem,
} from 'components/bootstrap';
import useGetPermissionsByScope from 'hooks/useScopePermissions';
import { EventDefinitionsActions } from 'stores/event-definitions/EventDefinitionsStore';
import EntityShareModal from 'components/permissions/EntityShareModal';
import UserNotification from 'util/UserNotification';
import { getPathnameWithoutId } from 'util/URLUtils';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import useSelectedEntities from 'components/common/EntityDataTable/hooks/useSelectedEntities';
import { MoreActions } from 'components/common/EntityDataTable';
import usePluginEntities from 'hooks/usePluginEntities';
import { useTableFetchContext } from 'components/common/PaginatedEntityTable';

import type { EventDefinition } from '../event-definitions-types';

type SigmaEventDefinitionConfig = EventDefinition['config'] & {
  sigma_rule_id: string,
}

type Props = {
  eventDefinition: EventDefinition,
}

const DIALOG_TYPES = {
  COPY: 'copy',
  DELETE: 'delete',
  DISABLE: 'disable',
  ENABLE: 'enable',
};

const DIALOG_TEXT = {
  [DIALOG_TYPES.COPY]: {
    dialogTitle: 'Copy Event Definition',
    dialogBody: (definitionTitle) => `Are you sure you want to create a copy of "${definitionTitle}"?`,
  },
  [DIALOG_TYPES.DELETE]: {
    dialogTitle: 'Delete Event Definition',
    dialogBody: (definitionTitle) => `Are you sure you want to delete "${definitionTitle}"?`,
  },
  [DIALOG_TYPES.DISABLE]: {
    dialogTitle: 'Disable Event Definition',
    dialogBody: (definitionTitle) => `Are you sure you want to disable "${definitionTitle}"?`,
  },
  [DIALOG_TYPES.ENABLE]: {
    dialogTitle: 'Enable Event Definition',
    dialogBody: (definitionTitle) => `Are you sure you want to enable "${definitionTitle}"?`,
  },
};

const EventDefinitionActions = ({ eventDefinition }: Props) => {
  const { refetch: refetchEventDefinitions } = useTableFetchContext();
  const { deselectEntity } = useSelectedEntities();
  const { scopePermissions } = useGetPermissionsByScope(eventDefinition);
  const [currentDefinition, setCurrentDefinition] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [showEntityShareModal, setShowEntityShareModal] = useState(false);
  const [showSigmaModal, setShowSigmaModal] = useState(false);
  const { pathname } = useLocation();
  const sendTelemetry = useSendTelemetry();
  const navigate = useNavigate();

  const showActions = (): boolean => scopePermissions?.is_mutable;

  const isSystemEventDefinition = (): boolean => eventDefinition?.config?.type === 'system-notifications-v1';

  const isAggregationEventDefinition = (): boolean => eventDefinition?.config?.type === 'aggregation-v1';

  const isSigmaEventDefinition = (): boolean => eventDefinition?.config?.type === 'sigma-v1';

  const getDeleteActionTitle = () => {
    if (isSystemEventDefinition()) {
      return 'System Event Definition cannot be deleted';
    }

    if (isSigmaEventDefinition()) {
      return 'Sigma Rules must be deleted from the Sigma Rules page';
    }

    return undefined;
  };

  const pluggableSigmaModal = usePluginEntities('eventDefinitions.components.editSigmaModal')
    .find((entity: { key: string }) => entity.key === 'coreSigmaModal');

  const CoreSigmaModal = pluggableSigmaModal
    ? pluggableSigmaModal.component as React.FC<{ ruleId: string, onCancel: () => void, onConfirm: () => void }>
    : null;

  const updateState = ({ show, type, definition }) => {
    setShowDialog(show);
    setDialogType(type);

    setCurrentDefinition(definition);
  };

  const handleAction = (action, definition) => {
    switch (action) {
      case DIALOG_TYPES.COPY:
        sendTelemetry(TELEMETRY_EVENT_TYPE.EVENTDEFINITION_LIST.ROW_ACTION_COPY_CLICKED, {
          app_pathname: getPathnameWithoutId(pathname),
          app_section: 'event-definition-row',
          app_action_value: 'copy-menuitem',
        });

        updateState({ show: true, type: DIALOG_TYPES.COPY, definition });

        break;
      case DIALOG_TYPES.DELETE:
        sendTelemetry(TELEMETRY_EVENT_TYPE.EVENTDEFINITION_LIST.ROW_ACTION_DELETE_CLICKED, {
          app_pathname: getPathnameWithoutId(pathname),
          app_section: 'event-definition-row',
          app_action_value: 'delete-menuitem',
        });

        updateState({ show: true, type: DIALOG_TYPES.DELETE, definition });

        break;
      case DIALOG_TYPES.ENABLE:
        sendTelemetry(TELEMETRY_EVENT_TYPE.EVENTDEFINITION_LIST.ROW_ACTION_ENABLE_CLICKED, {
          app_pathname: getPathnameWithoutId(pathname),
          app_section: 'event-definition-row',
          app_action_value: 'enable-menuitem',
        });

        updateState({ show: true, type: DIALOG_TYPES.ENABLE, definition });

        break;
      case DIALOG_TYPES.DISABLE:
        sendTelemetry(TELEMETRY_EVENT_TYPE.EVENTDEFINITION_LIST.ROW_ACTION_DISABLE_CLICKED, {
          app_pathname: getPathnameWithoutId(pathname),
          app_section: 'event-definition-row',
          app_action_value: 'disable-menuitem',
        });

        updateState({ show: true, type: DIALOG_TYPES.DISABLE, definition });

        break;
      default:
        break;
    }
  };

  const handleShare = () => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.EVENTDEFINITION_LIST.ROW_ACTION_SHARE_CLICKED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_section: 'event-definition-list',
      app_action_value: 'share-button',
    });

    setShowEntityShareModal(true);
  };

  const handleClearState = () => {
    updateState({ show: false, type: null, definition: null });
    refetchEventDefinitions();
  };

  const handleConfirm = () => {
    switch (dialogType) {
      case 'copy':
        EventDefinitionsActions.copy(currentDefinition).finally(() => {
          handleClearState();
        });

        break;
      case 'delete':
        EventDefinitionsActions.delete(currentDefinition).then(
          () => {
            deselectEntity(currentDefinition.id);

            UserNotification.success('事件定义删除成功',
              `事件定义 "${eventDefinition.title}" 已成功删除。`);
          },
          (error) => {
            const errorStatus = error?.additional?.body?.errors?.dependency.join(' ') || error;

            UserNotification.error(`删除事件定义 "${eventDefinition.title}" 失败，状态为：${errorStatus}`,
              '无法删除事件定义');
          },
        ).finally(() => {
          handleClearState();
        });

        break;
      case 'enable':
        EventDefinitionsActions.enable(currentDefinition).finally(() => {
          handleClearState();
        });

        break;
      case 'disable':
        EventDefinitionsActions.disable(currentDefinition).finally(() => {
          handleClearState();
        });

        break;
      default:
        break;
    }
  };

  const onEditEventDefinition = () => {
    if (isSigmaEventDefinition()) {
      setShowSigmaModal(true);
    } else {
      navigate(Routes.ALERTS.DEFINITIONS.edit(eventDefinition.id));
    }
  };

  const onSigmaModalClose = () => {
    refetchEventDefinitions();
    setShowSigmaModal(false);
  };

  const isEnabled = eventDefinition?.state === 'ENABLED';

  return (
    <>
      <ButtonToolbar key={`actions-${eventDefinition.id}`}>
        <ShareButton entityId={eventDefinition.id}
                     entityType="event_definition"
                     onClick={handleShare}
                     bsSize="xsmall" />
        <MoreActions>
          <IfPermitted permissions={`eventdefinitions:edit:${eventDefinition.id}`}>
            <MenuItem onClick={onEditEventDefinition} data-testid="edit-button">
              编辑
            </MenuItem>
          </IfPermitted>
          {!isSystemEventDefinition() && !isSigmaEventDefinition() && (
            <MenuItem onClick={() => handleAction(DIALOG_TYPES.COPY, eventDefinition)}>复制</MenuItem>
          )}
          <MenuItem divider />
          <MenuItem disabled={isSystemEventDefinition()}
                    title={isSystemEventDefinition() ? '系统事件定义无法禁用' : undefined}
                    onClick={isSystemEventDefinition() ? undefined : () => handleAction(isEnabled ? DIALOG_TYPES.DISABLE : DIALOG_TYPES.ENABLE, eventDefinition)}>
            {isEnabled ? '禁用' : '启用'}
          </MenuItem>

          {showActions() && (
            <IfPermitted permissions={`eventdefinitions:delete:${eventDefinition.id}`}>
              <MenuItem divider />
              <MenuItem disabled={isSystemEventDefinition() || isSigmaEventDefinition()}
                        title={getDeleteActionTitle()}
                        onClick={isSystemEventDefinition() || isSigmaEventDefinition() ? undefined : () => handleAction(DIALOG_TYPES.DELETE, eventDefinition)}
                        data-testid="delete-button">删除
              </MenuItem>
            </IfPermitted>
          )}
          {
            isAggregationEventDefinition() && (
              <>
                <MenuItem divider />
                <LinkContainer to={Routes.ALERTS.DEFINITIONS.replay_search(eventDefinition.id)}>
                  <MenuItem>
                    重播搜索
                  </MenuItem>
                </LinkContainer>

              </>
            )
          }
        </MoreActions>
      </ButtonToolbar>
      {showDialog && (
        <ConfirmDialog title={DIALOG_TEXT[dialogType].dialogTitle}
                       show
                       onConfirm={handleConfirm}
                       onCancel={handleClearState}>
          {DIALOG_TEXT[dialogType].dialogBody(currentDefinition.title)}
        </ConfirmDialog>
      )}
      {showEntityShareModal && (
        <EntityShareModal entityId={eventDefinition.id}
                          entityType="event_definition"
                          entityTypeTitle="event definition"
                          entityTitle={eventDefinition.title}
                          description="搜索要添加为此事件定义协作者的用户或团队。"
                          onClose={() => setShowEntityShareModal(false)} />
      )}
      {showSigmaModal && CoreSigmaModal && (
        <CoreSigmaModal ruleId={(eventDefinition.config as SigmaEventDefinitionConfig).sigma_rule_id}
                        onCancel={onSigmaModalClose}
                        onConfirm={onSigmaModalClose} />
      )}
    </>
  );
};

export default EventDefinitionActions;
