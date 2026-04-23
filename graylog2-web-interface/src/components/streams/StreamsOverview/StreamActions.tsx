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
import { useState, useCallback } from 'react';

import { ShareButton, IfPermitted, HoverForHelp } from 'components/common';
import { Button, ButtonToolbar, MenuItem, DeleteMenuItem } from 'components/bootstrap';
import type { Stream, StreamRule } from 'stores/streams/StreamsStore';
import StreamsStore from 'stores/streams/StreamsStore';
import Routes from 'routing/Routes';
import { StartpageStore } from 'stores/users/StartpageStore';
import StreamRuleModal from 'components/streamrules/StreamRuleModal';
import EntityShareModal from 'components/permissions/EntityShareModal';
import { StreamRulesStore } from 'stores/streams/StreamRulesStore';
import useCurrentUser from 'hooks/useCurrentUser';
import type { IndexSet } from 'stores/indices/IndexSetsStore';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import useSelectedEntities from 'components/common/EntityDataTable/hooks/useSelectedEntities';
import { MoreActions } from 'components/common/EntityDataTable';
import { LinkContainer } from 'components/common/router';
import HideOnCloud from 'util/conditional/HideOnCloud';
import UserNotification from 'util/UserNotification';
import StreamDeleteModal from 'components/streams/StreamsOverview/StreamDeleteModal';
import StreamModal from 'components/streams/StreamModal';
import usePluggableEntitySharedActions from 'hooks/usePluggableEntitySharedActions';

const DefaultStreamHelp = () => (
  <HoverForHelp displayLeftMargin>默认数据流不可用此操作</HoverForHelp>
);

const StreamActions = ({ stream, indexSets }: { stream: Stream; indexSets: Array<IndexSet> }) => {
  const currentUser = useCurrentUser();
  const { deselectEntity } = useSelectedEntities();
  const [showDeleteModal, setDeleteModal] = useState(false);
  const [showEntityShareModal, setShowEntityShareModal] = useState(false);
  const [showStreamRuleModal, setShowStreamRuleModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const sendTelemetry = useSendTelemetry();
  const setStartpage = useCallback(
    () => StartpageStore.set(currentUser.id, 'stream', stream.id),
    [stream.id, currentUser.id],
  );
  const { actions: pluggableActions, actionModals: pluggableActionModals } = usePluggableEntitySharedActions<Stream>(
    stream,
    'stream',
  );
  const moreActions = [pluggableActions.length ? pluggableActions : null].filter(Boolean);

  const isDefaultStream = stream.is_default;
  const isNotEditable = !stream.is_editable;
  const onToggleStreamStatus = useCallback(async () => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.STREAMS.STREAM_ITEM_STATUS_TOGGLED, {
      app_pathname: 'streams',
      app_action_value: ' stream-item-status',
      event_details: {
        enabled: !stream.disabled,
      },
    });

    setChangingStatus(true);

    if (stream.disabled) {
      await StreamsStore.resume(stream.id, (response) => response);
    }

    // eslint-disable-next-line no-alert
    if (!stream.disabled && window.confirm(`Do you really want to pause stream '${stream.title}'?`)) {
      await StreamsStore.pause(stream.id, (response) => response);
    }

    setChangingStatus(false);
  }, [sendTelemetry, stream.disabled, stream.id, stream.title]);

  const toggleEntityShareModal = useCallback(() => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.STREAMS.STREAM_ITEM_SHARE_MODAL_OPENED, {
      app_pathname: 'streams',
    });

    setShowEntityShareModal((cur) => !cur);
  }, [sendTelemetry]);

  const toggleDeleteModal = useCallback(() => {
    setDeleteModal((cur) => !cur);
  }, []);

  const toggleUpdateModal = useCallback(() => {
    setShowUpdateModal((cur) => !cur);
  }, []);

  const toggleCloneModal = useCallback(() => {
    setShowCloneModal((cur) => !cur);
  }, []);

  const toggleStreamRuleModal = useCallback(() => {
    setShowStreamRuleModal((cur) => !cur);
  }, []);

  const onDelete = useCallback(() => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.STREAMS.STREAM_ITEM_DELETED, {
      app_pathname: 'streams',
      app_action_value: 'stream-item-delete',
    });

    StreamsStore.remove(stream.id)
      .then(() => {
        deselectEntity(stream.id);
        UserNotification.success(`数据流 '${stream.title}' 已成功删除。`, '成功');
        toggleDeleteModal();
      })
      .catch((error) => {
        UserNotification.error(`删除数据流时发生错误。${error}`);
      });
  }, [deselectEntity, sendTelemetry, stream.id, stream.title, toggleDeleteModal]);

  const onSaveStreamRule = useCallback(
    (_streamRuleId: string, streamRule: StreamRule) =>
      StreamRulesStore.create(stream.id, streamRule, () => {
        sendTelemetry(TELEMETRY_EVENT_TYPE.STREAMS.STREAM_ITEM_RULE_SAVED, {
          app_pathname: 'streams',
          app_action_value: 'stream-item-rule',
        });

        UserNotification.success('数据流规则创建成功。', '成功');
      }),
    [sendTelemetry, stream.id],
  );

  const onUpdate = useCallback(
    (newStream: Stream) =>
      StreamsStore.update(stream.id, newStream, (response) => {
        sendTelemetry(TELEMETRY_EVENT_TYPE.STREAMS.STREAM_ITEM_UPDATED, {
          app_pathname: 'streams',
        });

        UserNotification.success(`数据流 '${newStream.title}' 已成功更新。`, '成功');

        return response;
      }),
    [sendTelemetry, stream.id],
  );

  const onCloneSubmit = useCallback(
    (newStream: Stream) => {
      sendTelemetry(TELEMETRY_EVENT_TYPE.STREAMS.STREAM_ITEM_CLONED, {
        app_pathname: 'streams',
      });

      return StreamsStore.cloneStream(stream.id, newStream, (response) => {
        UserNotification.success(`Stream was successfully cloned as '${newStream.title}'.`, '成功');

        return response;
      });
    },
    [sendTelemetry, stream.id],
  );

  return (
    <ButtonToolbar>
      <IfPermitted permissions={`streams:read:${stream.id}`}>
        <LinkContainer to={Routes.stream_view(stream.id)}>
          <Button
            disabled={isNotEditable}
            bsStyle="primary"
            bsSize="xsmall"
            onClick={() => {
              sendTelemetry(TELEMETRY_EVENT_TYPE.STREAMS.STREAM_ITEM_DATA_ROUTING_CLICKED, {
                app_pathname: 'stream',
              });
            }}>
            数据路由
          </Button>
        </LinkContainer>
      </IfPermitted>
      <ShareButton entityId={stream.id} entityType="stream" onClick={toggleEntityShareModal} bsSize="xsmall" />
      <MoreActions disabled={isNotEditable}>
        <IfPermitted permissions={[`streams:changestate:${stream.id}`, `streams:edit:${stream.id}`]} anyPermissions>
          <MenuItem onSelect={onToggleStreamStatus} disabled={isDefaultStream || isNotEditable}>
            {changingStatus ? (
              <span>{stream.disabled ? 'Starting Stream...' : 'Stopping Stream...'}</span>
            ) : (
              <span>{stream.disabled ? 'Start Stream' : 'Stop Stream'}</span>
            )}
            {isDefaultStream && <DefaultStreamHelp />}
          </MenuItem>
        </IfPermitted>
        <IfPermitted permissions={`streams:edit:${stream.id}`}>
          <MenuItem onSelect={toggleStreamRuleModal} disabled={isDefaultStream}>
            快速添加规则 {isDefaultStream && <DefaultStreamHelp />}
          </MenuItem>
        </IfPermitted>
        <IfPermitted permissions={`streams:edit:${stream.id}`}>
          <MenuItem onSelect={toggleUpdateModal} disabled={isDefaultStream}>
            编辑数据流 {isDefaultStream && <DefaultStreamHelp />}
          </MenuItem>
        </IfPermitted>

        <IfPermitted permissions={[`streams:edit:${stream.id}`]}>
          <MenuItem divider />
        </IfPermitted>

        <IfPermitted permissions={[`streams:edit:${stream.id}`]}>
          <MenuItem disabled={isDefaultStream || isNotEditable} href={Routes.stream_edit(stream.id)}>
            管理规则 {isDefaultStream && <DefaultStreamHelp />}
          </MenuItem>
        </IfPermitted>
        <HideOnCloud>
          <IfPermitted permissions="stream_outputs:read">
            <MenuItem href={Routes.stream_outputs(stream.id)}>管理输出端</MenuItem>
          </IfPermitted>
        </HideOnCloud>
        <IfPermitted permissions={`streams:edit:${stream.id}`}>
          <MenuItem href={Routes.stream_alerts(stream.id)}>管理告警</MenuItem>
        </IfPermitted>
        {moreActions}
        <IfPermitted permissions={`streams:edit:${stream.id}`}>
          <MenuItem divider />
        </IfPermitted>

        <MenuItem onSelect={setStartpage} disabled={currentUser.readOnly}>
          设为起始页
        </MenuItem>

        <IfPermitted permissions={['streams:create', `streams:read:${stream.id}`]}>
          <MenuItem onSelect={toggleCloneModal} disabled={isDefaultStream}>
            克隆此数据流 {isDefaultStream && <DefaultStreamHelp />}
          </MenuItem>
        </IfPermitted>

        <IfPermitted permissions={`streams:edit:${stream.id}`}>
          <DeleteMenuItem onSelect={toggleDeleteModal} disabled={isDefaultStream}>
            删除此数据流 {isDefaultStream && <DefaultStreamHelp />}
          </DeleteMenuItem>
        </IfPermitted>
      </MoreActions>
      {showUpdateModal && (
        <StreamModal
          title="编辑数据流"
          onSubmit={onUpdate}
          onClose={toggleUpdateModal}
          submitButtonText="更新数据流"
          submitLoadingText="正在更新数据流..."
          initialValues={stream}
          indexSets={indexSets}
        />
      )}
      {showCloneModal && (
        <StreamModal
          title="克隆数据流"
          initialValues={stream}
          onSubmit={onCloneSubmit}
          onClose={toggleCloneModal}
          submitButtonText="克隆数据流"
          submitLoadingText="正在克隆数据流..."
          indexSets={indexSets}
        />
      )}
      {showStreamRuleModal && (
        <StreamRuleModal
          onClose={toggleStreamRuleModal}
          title="新建数据流规则"
          submitButtonText="创建规则"
          submitLoadingText="正在创建规则..."
          onSubmit={onSaveStreamRule}
        />
      )}
      {showEntityShareModal && (
        <EntityShareModal
          entityId={stream.id}
          entityType="stream"
          entityTitle={stream.title}
          description="搜索用户或团队以将其添加为此数据流的协作者。"
          onClose={toggleEntityShareModal}
        />
      )}
      {showDeleteModal && (
        <StreamDeleteModal
          streamTitle={stream.title}
          streamId={stream.id}
          onCancel={toggleDeleteModal}
          onDelete={onDelete}
        />
      )}
      {pluggableActionModals}
    </ButtonToolbar>
  );
};

export default StreamActions;
