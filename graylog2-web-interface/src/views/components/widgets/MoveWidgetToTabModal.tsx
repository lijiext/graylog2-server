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
import React, { useState, useCallback } from 'react';

import { ListGroup, ListGroupItem } from 'components/bootstrap';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import Input from 'components/bootstrap/Input';
import QueryTitle from 'views/logic/queries/QueryTitle';
import type View from 'views/logic/views/View';
import useQueryIds from 'views/hooks/useQueryIds';
import useActiveQueryId from 'views/hooks/useActiveQueryId';

type Props = {
  view: View,
  widgetId: string,
  onCancel: () => void,
  onSubmit: (widgetId: string, selectedTab: string | undefined | null, keepCopy: boolean) => void,
};

type TabEntry = { id: string, name: string };

const _tabList = (view: View, queryIds): Array<TabEntry> => queryIds.map((queryId) => {
  const tabTitle = QueryTitle(view, queryId) || 'Unknown Page title';

  return ({ id: queryId, name: tabTitle });
});

const MoveWidgetToTabModal = ({ view, onCancel, onSubmit, widgetId }: Props) => {
  const [selectedTab, setSelectedTab] = useState(null);
  const [keepCopy, setKeepCopy] = useState(false);
  const activeQuery = useActiveQueryId();
  const queryIds = useQueryIds();
  const onKeepCopy = useCallback((e) => setKeepCopy(e.target.checked), [setKeepCopy]);
  const submit = useCallback(() => onSubmit(widgetId, selectedTab, keepCopy),
    [onSubmit, widgetId, selectedTab, keepCopy]);

  const list = _tabList(view, queryIds.toArray()).filter(({ id }) => id !== activeQuery);

  const tabList = list.map(({ id, name }) => (
    <ListGroupItem onClick={() => setSelectedTab(id)}
                   active={id === selectedTab}
                   key={id}>
      {name}
    </ListGroupItem>
  ));
  const renderResult = list && list.length > 0
    ? <ListGroup>{tabList}</ListGroup>
    : <span>未找到页面</span>;

  return (
    <BootstrapModalForm show
                        onCancel={onCancel}
                        submitButtonDisabled={!selectedTab}
                        submitButtonText={`${keepCopy ? '复制' : '移动'} 小部件`}
                        onSubmitForm={submit}
                        title="选择目标页面">
      {renderResult}
      <Input type="checkbox"
             id="keepCopy"
             name="keepCopy"
             label="在此页面保留副本"
             onChange={onKeepCopy}
             help="启用“在页面上保留副本”后，小部件将被复制而不会移动到其他页面"
             checked={keepCopy} />
    </BootstrapModalForm>
  );
};

export default MoveWidgetToTabModal;
