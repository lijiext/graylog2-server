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
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';

import UserNotification from 'util/UserNotification';
import { isPermitted } from 'util/PermissionsMixin';
import HumanReadableStreamRule from 'components/streamrules/HumanReadableStreamRule';
import { useStore } from 'stores/connect';
import { ConfirmDialog, Icon } from 'components/common';
import { Button } from 'components/bootstrap';
import StreamRuleModal from 'components/streamrules/StreamRuleModal';
import { StreamRulesInputsActions, StreamRulesInputsStore } from 'stores/inputs/StreamRulesInputsStore';
import { StreamRulesStore } from 'stores/streams/StreamRulesStore';
import type { StreamRule as StreamRuleTypeDefinition, Stream, StreamRule } from 'stores/streams/StreamsStore';

import useCurrentUser from '../../hooks/useCurrentUser';

const ActionButtonsWrap = styled.span(({ theme }) => css`
  margin-right: ${theme.spacings.xs};
  float: right;
`);

const StyledDeleteButton = styled(Button)(({ theme }) => css`
  margin: 0 ${theme.spacings.xxs};
`);

type Props = {
  matchData?: {
    matches: boolean,
    rules: { [id: string]: false },
  },
  stream: Stream,
  onDelete: (ruleId: string) => void,
  onSubmit: (ruleId: string, data: unknown) => void,
  streamRule: StreamRuleTypeDefinition
}

const DetailsStreamRule = ({ stream, streamRule, onSubmit, onDelete }: Props) => {
  const { permissions } = useCurrentUser();
  const [showStreamRuleForm, setShowStreamRuleForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { inputs } = useStore(StreamRulesInputsStore);
  const queryClient = useQueryClient();
  const STREAM_QUERY_KEY = ['stream', stream.id];

  useEffect(() => {
    StreamRulesInputsActions.list();
  }, []);

  const onConfirmDelete = () => {
    StreamRulesStore.remove(stream.id, streamRule.id, () => {
      if (onDelete) {
        onDelete(streamRule.id);
      }

      queryClient.invalidateQueries(STREAM_QUERY_KEY);
      setShowConfirmDelete(false);
      UserNotification.success('流规则已成功删除。', '成功');
    });
  };

  const _onSubmit = (streamRuleId: string, data: StreamRule) => StreamRulesStore.update(stream.id, streamRuleId, data, () => {
    if (onSubmit) {
      onSubmit(streamRuleId, data);
    }

    queryClient.invalidateQueries(STREAM_QUERY_KEY);
    UserNotification.success('流规则已成功更新。', '成功');
  });

  const _formatActionItems = () => (
    <ActionButtonsWrap className="align-right">
      <StyledDeleteButton bsStyle="default"
                          bsSize="xsmall"
                          onClick={() => setShowStreamRuleForm(true)}
                          title="编辑数据流规则">
        <Icon name="edit_square" type="regular" />
      </StyledDeleteButton>
      <Button bsStyle="danger"
              bsSize="xsmall"
              onClick={() => setShowConfirmDelete(true)}
              title="删除数据流规则">
        <Icon name="delete" type="regular" />
      </Button>

    </ActionButtonsWrap>
  );

  const actionItems = isPermitted(permissions, [`streams:edit:${stream.id}`]) ? _formatActionItems() : null;
  const description = streamRule.description ? <small>{' '}({streamRule.description})</small> : null;

  return (
    <tr key={streamRule.id}>
      {}
      <td>
        <HumanReadableStreamRule streamRule={streamRule} inputs={inputs} />
        {description}
      </td>
      <td>{actionItems}</td>
      {showStreamRuleForm && (
        <StreamRuleModal initialValues={streamRule}
                         onClose={() => setShowStreamRuleForm(false)}
                         title="编辑数据流规则"
                         submitButtonText="更新规则"
                         submitLoadingText="正在更新规则..."
                         onSubmit={_onSubmit} />
      )}
      {showConfirmDelete && (
        <ConfirmDialog show={showConfirmDelete}
                       onConfirm={onConfirmDelete}
                       onCancel={() => setShowConfirmDelete(false)}
                       title="删除数据流规则。"
                       btnConfirmText="Ok">
          确定要删除此数据流规则吗？
        </ConfirmDialog>
      )}
    </tr>
  );
};

DetailsStreamRule.propTypes = {
  matchData: PropTypes.shape({
    matches: PropTypes.bool,
    rules: PropTypes.object,
  }),
  onDelete: PropTypes.func,
  onSubmit: PropTypes.func,
  stream: PropTypes.object.isRequired,
  streamRule: PropTypes.object.isRequired,
};

DetailsStreamRule.defaultProps = {
  matchData: {},
  onSubmit: () => {},
  onDelete: () => {},
};

export default DetailsStreamRule;
