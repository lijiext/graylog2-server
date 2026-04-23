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

import usePluginEntities from 'hooks/usePluginEntities';
import { LinkContainer } from 'components/common/router';
import { Row, Col, Button, Input } from 'components/bootstrap';
import { getValueFromInput } from 'util/FormsUtils';
import Routes from 'routing/Routes';
import { LookupTableDataAdaptersActions } from 'stores/lookup-tables/LookupTableDataAdaptersStore';
import type { LookupTableAdapter } from 'logic/lookup-tables/types';
import useScopePermissions from 'hooks/useScopePermissions';

import type { DataAdapterPluginType } from './types';
import ConfigSummaryDefinitionListWrapper from './ConfigSummaryDefinitionListWrapper';

type Props = {
  dataAdapter: LookupTableAdapter,
};

const DataAdapter = ({ dataAdapter }: Props) => {
  const [lookupKey, setLookupKey] = React.useState('');
  const [lookupResult, setLookupResult] = React.useState(null);
  const { loadingScopePermissions, scopePermissions } = useScopePermissions(dataAdapter);

  const _onChange = (event: React.SyntheticEvent) => {
    setLookupKey(getValueFromInput(event.target));
  };

  const _lookupKey = (event: React.SyntheticEvent) => {
    event.preventDefault();

    LookupTableDataAdaptersActions.lookup(dataAdapter.name, lookupKey).then((result: LookupTableAdapter[]) => {
      setLookupResult(result);
    });
  };

  const plugin = usePluginEntities('lookupTableAdapters').find((p: DataAdapterPluginType) => p.type === dataAdapter.config?.type);

  if (!plugin) {
    return <p>未知的数据适配器类型 {dataAdapter.config.type}。插件是否缺失？</p>;
  }

  const { title: adapterTitle, description: adapterDescription, name: adapterName } = dataAdapter;
  const summary = plugin.summaryComponent;

  return (
    <Row className="content">
      <Col md={6}>
        <h2>
          {adapterTitle}
          {' '}
          <small>({plugin.displayName})</small>
        </h2>
        <ConfigSummaryDefinitionListWrapper>
          <dl>
            <dt>描述</dt>
            <dd>{adapterDescription || <em>无描述。</em>}</dd>
          </dl>
        </ConfigSummaryDefinitionListWrapper>
        <h4>配置</h4>
        <ConfigSummaryDefinitionListWrapper>
          {React.createElement(summary, { dataAdapter: dataAdapter })}
        </ConfigSummaryDefinitionListWrapper>
        {(!loadingScopePermissions && scopePermissions?.is_mutable) && (
          <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.DATA_ADAPTERS.edit(adapterName)}>
            <Button bsStyle="success" role="button" name="edit_square">编辑</Button>
          </LinkContainer>
        )}
      </Col>
      <Col md={6}>
        <h3>测试查找</h3>
        <p>您可以使用此表单手动触发数据适配器。数据将不会被缓存。</p>
        <form onSubmit={_lookupKey}>
          <fieldset>
            <Input type="text"
                   id="key"
                   name="key"
                   label="密钥"
                   required
                   onChange={_onChange}
                   help="用于查找值的密钥。"
                   value={lookupKey} />
            <Button type="submit" bsStyle="success">查找</Button>
          </fieldset>
        </form>
        {lookupResult && (
          <div>
            <h4>查找结果</h4>
            <pre>{JSON.stringify(lookupResult, null, 2)}</pre>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default DataAdapter;
