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
import { useNavigate } from 'react-router-dom';

import Routes from 'routing/Routes';
import { ButtonToolbar, Row, Col, Button, Input } from 'components/bootstrap';
import { Link } from 'components/common/router';
import { LookupTablesActions } from 'stores/lookup-tables/LookupTablesStore';
import useScopePermissions from 'hooks/useScopePermissions';
import type { LookupTable, LookupTableCache, LookupTableAdapter } from 'logic/lookup-tables/types';

type Props = {
  table: LookupTable,
  cache: LookupTableCache,
  dataAdapter: LookupTableAdapter,
};

type InputType = { value: string, valid: boolean };
const INIT_INPUT = { value: '', valid: false };

const LookupTableView = ({ table, cache, dataAdapter }: Props) => {
  const navigate = useNavigate();
  const { loadingScopePermissions, scopePermissions } = useScopePermissions(table);
  const [purgeKey, setPurgeKey] = React.useState<InputType>(INIT_INPUT);
  const [lookupKey, setLookupKey] = React.useState<InputType>(INIT_INPUT);
  const [lookupResult, setLookupResult] = React.useState<any>(null);

  const handleEdit = (tableName: string) => () => {
    navigate(Routes.SYSTEM.LOOKUPTABLES.edit(tableName));
  };

  const handleInputOnChange = (event: React.BaseSyntheticEvent) => {
    const newValue = event.target.name === 'purgekey' ? { ...purgeKey } : { ...lookupKey };

    newValue.valid = event.target.value
                  && event.target.value.replace(/\s/g, '').length > 0;

    newValue.value = event.target.value;

    switch (event.target.name) {
      case 'purgekey':
        setPurgeKey(newValue);
        break;
      case 'lookupkey':
        setLookupKey(newValue);
        setLookupResult(null);
        break;
      default:
        break;
    }
  };

  const handlePurgeKey = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (purgeKey.valid) {
      LookupTablesActions.purgeKey(table, purgeKey.value).then(() => {
        setPurgeKey(INIT_INPUT);
      });
    }
  };

  const hadlePurgeAll = (event: React.SyntheticEvent) => {
    event.preventDefault();
    LookupTablesActions.purgeAll(table);
  };

  const handleLookupKey = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (lookupKey.valid) {
      LookupTablesActions.lookup(table.name, lookupKey.value).then((resp: any) => {
        setLookupResult(JSON.stringify(resp, null, 2));
        setLookupKey(INIT_INPUT);
      });
    }
  };

  return (
    <Row className="content">
      <Col md={6}>
        <h2>{table.title}</h2>
        <p>{table.description}</p>
        <dl>
          <dt>数据适配器</dt>
          <dd>
            <Link to={Routes.SYSTEM.LOOKUPTABLES.DATA_ADAPTERS.show(dataAdapter.name)}>
              {dataAdapter.title}
            </Link>
          </dd>
          <dt>缓存</dt>
          <dd>
            <Link to={Routes.SYSTEM.LOOKUPTABLES.CACHES.show(cache.name)}>{cache.title}</Link>
          </dd>
        </dl>
        {(!loadingScopePermissions && scopePermissions?.is_mutable) && (
          <Button bsStyle="success"
                  onClick={handleEdit(table.name)}
                  role="button"
                  name="edit_square">
            编辑
          </Button>
        )}
        {(table.default_single_value || table.default_multi_value) && (
          <dl>
            <dt>默认单值</dt>
            <dd><code>{table.default_single_value}</code>{' '}({table.default_single_value_type.toLowerCase()})</dd>
            <dt>默认多值</dt>
            <dd><code>{table.default_multi_value}</code>{' '}({table.default_multi_value_type.toLowerCase()})</dd>
          </dl>
        )}
        <hr />
        <h2>清除缓存</h2>
        <p>您可以清除此查找表的整个缓存，或仅清除单个键的缓存条目。</p>
        <form onSubmit={handlePurgeKey}>
          <fieldset>
            <Input type="text"
                   id="purge-key"
                   name="purgekey"
                   placeholder="插入要清除的键"
                   label="密钥"
                   onChange={handleInputOnChange}
                   help="要从缓存中清除的密钥"
                   required
                   value={purgeKey.value} />
            <ButtonToolbar>
              <Button type="submit" bsStyle="success" disabled={!purgeKey.valid}>清除键</Button>
              <Button type="button" bsStyle="info" onClick={hadlePurgeAll}>清除全部</Button>
            </ButtonToolbar>
          </fieldset>
        </form>
      </Col>
      <Col md={6}>
        <h2>测试查找</h2>
        <p>您可以使用此表单手动查询查找表。数据将按 Graylog 的配置进行缓存。</p>
        <form onSubmit={handleLookupKey}>
          <fieldset>
            <Input type="text"
                   id="key"
                   name="lookupkey"
                   placeholder="插入要查找的键"
                   label="密钥"
                   required
                   onChange={handleInputOnChange}
                   help="用于查找值的密钥。"
                   value={lookupKey.value} />
            <Button type="submit" name="lookupbutton" bsStyle="success" disabled={!lookupKey.valid}>查找</Button>
          </fieldset>
        </form>
        {lookupResult && (
          <div style={{ marginTop: '16px' }}>
            <h4>查找结果</h4>
            <pre>{lookupResult}</pre>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default LookupTableView;
