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
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DocumentTitle, Spinner } from 'components/common';
import PageHeader from 'components/common/PageHeader';
import ExtractorsList from 'components/extractors/ExtractorsList';
import { DropdownButton, MenuItem } from 'components/bootstrap';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import withParams from 'routing/withParams';
import { InputsActions } from 'stores/inputs/InputsStore';
import { NodesActions, NodesStore } from 'stores/nodes/NodesStore';
import { useStore } from 'stores/connect';
import useParams from 'routing/useParams';

const ExtractorsPage = () => {
  const params = useParams<{ inputId: string; nodeId: string }>();
  const node = useStore(NodesStore, (nodes) => {
    if (!nodes?.nodes) {
      return undefined;
    }

    return params.nodeId
      ? nodes.nodes?.[params.nodeId]
      : Object.values(nodes.nodes).filter((_node) => _node.is_leader)[0];
  });
  const { data: input } = useQuery({
    queryKey: ['input', params.inputId],
    queryFn: () => InputsActions.get(params.inputId),
  });

  useEffect(() => {
    NodesActions.list();
  }, []);

  const _isLoading = !(input && node);

  if (_isLoading) {
    return <Spinner />;
  }

  return (
    <DocumentTitle title={`${input.title} 的提取器`}>
      <div>
        <PageHeader
          title={
            <span>
              提取器 <em>{input.title}</em>
            </span>
          }
          actions={
            <DropdownButton bsStyle="info" id="extractor-actions-dropdown" title="操作" pullRight>
              <MenuItem href={Routes.import_extractors(node.node_id, input.id)}>导入提取器</MenuItem>
              <MenuItem href={Routes.export_extractors(node.node_id, input.id)}>导出提取器</MenuItem>
            </DropdownButton>
          }
          documentationLink={{
            title: 'Extractors documentation',
            path: DocsHelper.PAGES.EXTRACTORS,
          }}>
          <span>
            提取器应用于此输入端接收到的每条消息。使用它们来提取和转换{' '}
            将任何文本数据转换为字段，以便您稍后进行轻松过滤和分析。示例：从日志消息中提取 HTTP 响应代码，将其转换为数值字段并附加为{' '}
            <em>http_response_code</em> 到消息。
          </span>
        </PageHeader>
        <ExtractorsList input={input} node={node} />
      </div>
    </DocumentTitle>
  );
};

export default withParams(ExtractorsPage);
