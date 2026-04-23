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
import { useCallback, useContext, useState } from 'react';

import { DEFAULT_HIGHLIGHT_COLOR } from 'views/Constants';
import HighlightingRulesContext from 'views/components/contexts/HighlightingRulesContext';
import IconButton from 'components/common/IconButton';
import { SortableList } from 'components/common';
import { updateHighlightingRules } from 'views/logic/slices/highlightActions';
import useAppDispatch from 'stores/useAppDispatch';
import type HighlightingRuleType from 'views/logic/views/formatting/highlighting/HighlightingRule';
import type { DraggableProps, DragHandleProps } from 'components/common/SortableList';

import HighlightingRule, { Container, RuleContainer } from './HighlightingRule';
import ColorPreview from './ColorPreview';
import HighlightForm from './HighlightForm';

import SectionInfo from '../SectionInfo';
import SectionSubheadline from '../SectionSubheadline';

type SortableHighlightingRuleProps = {
  item: { id: string, rule: HighlightingRuleType },
  draggableProps: DraggableProps,
  dragHandleProps: DragHandleProps,
  className?: string,
  ref: React.Ref<HTMLDivElement>
}
const SortableHighlightingRule = ({ item: { id, rule }, draggableProps, dragHandleProps, className, ref }: SortableHighlightingRuleProps) => (
  <HighlightingRule key={id}
                    rule={rule}
                    dragHandleProps={dragHandleProps}
                    draggableProps={draggableProps}
                    className={className}
                    ref={ref} />
);

SortableHighlightingRule.defaultProps = {
  className: undefined,
};

const HighlightingRules = () => {
  const [showForm, setShowForm] = useState(false);
  const rules = useContext(HighlightingRulesContext) ?? [];
  const rulesWithId = rules.map((rule) => ({ rule, id: `${rule.field}-${rule.value}-${rule.color}-${rule.condition}` }));
  const dispatch = useAppDispatch();

  const updateRules = useCallback((newRulesWithId: Array<{ id: string, rule: HighlightingRuleType }>) => {
    const newRules = newRulesWithId.map(({ rule }) => rule);

    return dispatch(updateHighlightingRules(newRules));
  }, [dispatch]);

  return (
    <>
      <SectionInfo>
        搜索词和字段值可以高亮显示。在搜索结果中高亮显示您的搜索查询可以在 Graylog 服务器配置中启用/禁用。通过点击值并选择“高亮显示此值”，可以高亮显示任何字段值。如果某个词或值有多个规则，则使用第一个匹配的规则。
      </SectionInfo>
      <SectionSubheadline>
        活动高亮 <IconButton className="pull-right"
                                      name="add"
                                      onClick={() => setShowForm(!showForm)}
                                      title="添加高亮规则" />
      </SectionSubheadline>
      {showForm && <HighlightForm onClose={() => setShowForm(false)} />}
      <Container $displayBorder={!!rulesWithId?.length}>
        <ColorPreview color={DEFAULT_HIGHLIGHT_COLOR} />
        <RuleContainer>搜索词</RuleContainer>
      </Container>
      <SortableList items={rulesWithId}
                    onMoveItem={updateRules}
                    customListItemRender={SortableHighlightingRule} />
    </>
  );
};

export default HighlightingRules;
