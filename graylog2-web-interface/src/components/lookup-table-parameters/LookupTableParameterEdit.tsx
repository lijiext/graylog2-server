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
import styled from 'styled-components';

import { Panel, Input } from 'components/bootstrap';
import Select from 'components/common/Select';
import { naturalSortIgnoreCase } from 'util/SortUtils';
import Spinner from 'components/common/Spinner';
import type { LookupTable } from 'logic/lookup-tables/types';
import type { ValidationState } from 'components/common/types';

const StyledInlineCode = styled('code')`
  margin: 0 0.25em;
  white-space: nowrap;
`;

type Props = {
  onChange: (fieldName: string, value: string) => void;
  lookupTables: Array<LookupTable>;
  identifier: string | number;
  defaultExpandHelp?: boolean;
  parameter?: {
    lookupTable?: string;
    key?: string;
    defaultValue?: string;
    name?: string;
  };
  validationState?: {
    lookupTable?: [ValidationState, string];
    key?: [ValidationState, string];
  };
};

const LookupTableParameterEdit = ({
  validationState = {},
  onChange,
  lookupTables,
  identifier,
  parameter = {},
  defaultExpandHelp = true,
}: Props) => {
  const { lookupTable, key: tableKey, defaultValue, name } = parameter;
  const parameterSyntax = `$${name}$`;

  const _handleChange = (fieldName: string) => (value) => {
    onChange(fieldName, value);
  };

  const _handleInputChange =
    (attributeName: string) =>
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
      _handleChange(attributeName)(value);

  if (!lookupTables) {
    return <Spinner text="Loading lookup tables" />;
  }

  const lookupTableOptions = lookupTables
    .sort((lt1, lt2) => naturalSortIgnoreCase(lt1.title, lt2.title))
    .map((table) => ({ label: table.title, value: table.name }));

  return (
    <>
      <Input
        id={`lookup-table-parameter-table-${identifier}`}
        name="query-param-table-name"
        label="查找表"
        bsStyle={validationState?.lookupTable?.[0]}
        error={validationState?.lookupTable?.[1]}
        help="选择用于检索值的查找表。">
        <Select
          placeholder="选择查找表"
          onChange={_handleChange('lookupTable')}
          options={lookupTableOptions}
          value={lookupTable}
          autoFocus
          clearable={false}
          required
        />
      </Input>
      <Input
        type="text"
        id={`lookup-table-parameter-key-${identifier}`}
        label="查找表键"
        name="key"
        defaultValue={tableKey}
        onChange={_handleInputChange('key')}
        bsStyle={validationState?.key?.[0]}
        help="选择查找表键"
        error={validationState?.key?.[0] === 'error' ? validationState?.key?.[1] : undefined}
        spellCheck={false}
        required
      />
      <Input
        id={`lookup-table-parameter-default-value-${identifier}`}
        type="text"
        name="defaultValue"
        label="默认值"
        help="如果查找结果为空，请选择默认值"
        defaultValue={defaultValue}
        spellCheck={false}
        onChange={_handleInputChange('defaultValue')}
      />

      <Panel id="lookup-table-parameter-help" defaultExpanded={defaultExpandHelp}>
        <Panel.Heading>
          <Panel.Title toggle>如何使用查找表参数</Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <h5>常规用法</h5>
            <p>
              声明后，该参数
              <StyledInlineCode>{parameterSyntax}</StyledInlineCode>
              在您的查询中，将替换为来自查找表的结果列表。结果列表将以 Lucene BooleanQuery 的形式呈现。例如:
              <StyledInlineCode>(&quot;foo&quot; OR &quot;bar&quot; OR &quot;baz&quot;)</StyledInlineCode>
            </p>
            <h5>查找结果列表为空时的行为</h5>
            <p>
              仅当存在参数值时，才会执行事件定义查询。如果查找结果为空，则跳过执行，并视为 <i>搜索查询</i> 未找到任何消息。如果需要执行，请 <i>默认值</i> 需要提供能够产生所需搜索结果的内容。例如（根据用例），通配符如
              <StyledInlineCode>*</StyledInlineCode>
              可以是有效的默认值。
            </p>
            <h5>限制</h5>
            <p>
              请注意，支持的最大结果数量取决于
              <StyledInlineCode>opensearch_indices_query_bool_max_clause_count</StyledInlineCode> 设置。如果查找表返回更多结果，查询将在您的索引器中失败。
            </p>
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    </>
  );
};

export default LookupTableParameterEdit;
