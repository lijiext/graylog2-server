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
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { Input } from 'components/bootstrap';
import UserNotification from 'util/UserNotification';
import StreamsStore, { type Stream } from 'stores/streams/StreamsStore';

import ConfirmDialog from '../common/ConfirmDialog';

const StreamRuleConnector = styled.div(({ theme }) => css`
  margin-top: 10px;
  margin-bottom: 13px;

  label {
    font-size: ${theme.fonts.size.small};
  }

  .form-group {
    margin-bottom: 5px;
  }

  .radio {
    margin-top: 0;
    margin-bottom: 0;
  }

  input[type='radio'] {
    margin-top: 2px;
    margin-bottom: 2px;
  }
`);

type Props = {
  stream: Stream,
  onChange: () => void,
}

const MatchingTypeSwitcher = ({ stream, onChange }: Props) => {
  const [matchingType, setMatchingType] = useState<'AND'|'OR'|undefined>(undefined);

  const handleTypeChange = (newValue: 'AND'|'OR') => {
    StreamsStore.update(stream.id, { matching_type: newValue }, (response) => {
      onChange();

      UserNotification.success(`当匹配 ${newValue === 'AND' ? 'all' : 'any'} 规则时，消息现在将被路由到数据流`,
        '成功');

      return response;
    });
  };

  return (
    <StreamRuleConnector>
      <div>
        <Input id="streamrule-and-connector"
               type="radio"
               label="消息必须匹配以下所有规则"
               checked={stream.matching_type === 'AND'}
               onChange={() => setMatchingType('AND')} />
        <Input id="streamrule-or-connector"
               type="radio"
               label="消息必须匹配以下至少一条规则"
               checked={stream.matching_type === 'OR'}
               onChange={() => setMatchingType('OR')} />
      </div>
      {matchingType && (
        <ConfirmDialog show
                       title={`将匹配类型切换为 ${matchingType === 'AND' ? 'ALL' : 'ANY'}`}
                       onConfirm={() => handleTypeChange(matchingType)}
                       onCancel={() => setMatchingType(undefined)}>
          您即将更改规则应用于此数据流的方式，是否继续？更改将立即生效。
        </ConfirmDialog>
      )}
    </StreamRuleConnector>
  );
};

export default MatchingTypeSwitcher;
