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
import React, { useState, useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components';

import HumanReadableStreamRule from 'components/streamrules/HumanReadableStreamRule';
import { useStore } from 'stores/connect';
import { Icon } from 'components/common';
import { Button, ListGroupItem } from 'components/bootstrap';
import { isPermitted } from 'util/PermissionsMixin';
import StreamRuleModal from 'components/streamrules/StreamRuleModal';
import UserNotification from 'util/UserNotification';
import { StreamRulesInputsActions, StreamRulesInputsStore } from 'stores/inputs/StreamRulesInputsStore';
import { StreamRulesStore } from 'stores/streams/StreamRulesStore';
import type { StreamRule as StreamRuleTypeDefinition, Stream } from 'stores/streams/StreamsStore';

import useCurrentUser from '../../hooks/useCurrentUser';

const ActionButtonsWrap = styled.span`
  margin-right: 6px;
`;

type Props = {
  matchData?: {
    matches: boolean;
    rules: { [id: string]: false };
  };
  stream: Stream;
  onDelete?: (ruleId: string) => void;
  onSubmit?: (ruleId: string, data: unknown) => void;
  streamRule: StreamRuleTypeDefinition;
};

const StreamRule = ({ matchData = undefined, stream, streamRule, onSubmit = () => {}, onDelete = () => {} }: Props) => {
  const { permissions } = useCurrentUser();
  const [showStreamRuleForm, setShowStreamRuleForm] = useState(false);
  const { inputs } = useStore(StreamRulesInputsStore);

  useEffect(() => {
    StreamRulesInputsActions.list();
  }, []);

  const _onEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    setShowStreamRuleForm(true);
  };

  const _onDelete = (event: React.MouseEvent) => {
    event.preventDefault();

    /* TODO: Replace with custom confirmation dialog */
    // eslint-disable-next-line no-alert
    if (window.confirm('Do you really want to delete this stream rule?')) {
      StreamRulesStore.remove(stream.id, streamRule.id, () => {
        if (onDelete) {
          onDelete(streamRule.id);
        }

        UserNotification.success('数据流规则已成功删除。', '成功');
      });
    }
  };

  const _onSubmit = (streamRuleId: string, data: StreamRuleTypeDefinition) =>
    StreamRulesStore.update(stream.id, streamRuleId, data, () => {
      if (onSubmit) {
        onSubmit(streamRuleId, data);
      }

      UserNotification.success('数据流规则已成功更新。', '成功');
    });

  const _formatActionItems = () => (
    <ActionButtonsWrap>
      <Button bsStyle="link" bsSize="xsmall" onClick={_onDelete} title="删除数据流规则">
        <Icon name="delete" type="regular" />
      </Button>
      <Button bsStyle="link" bsSize="xsmall" onClick={_onEdit} title="编辑数据流规则">
        <Icon name="edit_square" />
      </Button>
    </ActionButtonsWrap>
  );

  const matchDataStyle = () => (matchData.rules[streamRule.id] ? 'success' : 'danger');
  const actionItems = isPermitted(permissions, [`streams:edit:${stream.id}`]) ? _formatActionItems() : null;
  const description = streamRule.description ? <small> ({streamRule.description})</small> : null;
  const listGroupStyle = !isEmpty(matchData) ? matchDataStyle() : null;

  return (
    <ListGroupItem bsStyle={listGroupStyle}>
      {actionItems}
      <HumanReadableStreamRule streamRule={streamRule} inputs={inputs} />
      {showStreamRuleForm && (
        <StreamRuleModal
          initialValues={streamRule}
          onClose={() => setShowStreamRuleForm(false)}
          title="编辑数据流规则"
          submitButtonText="更新规则"
          submitLoadingText="正在更新规则..."
          onSubmit={_onSubmit}
        />
      )}
      {description}
    </ListGroupItem>
  );
};

export default StreamRule;
