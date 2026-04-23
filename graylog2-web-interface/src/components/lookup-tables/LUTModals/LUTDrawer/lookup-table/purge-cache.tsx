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

import { Button, Input } from 'components/bootstrap';
import { Col, Row } from 'components/lookup-tables/layout-componets';
import type { LookupTable } from 'logic/lookup-tables/types';
import { usePurgeAllLookupTableKey, usePurgeLookupTableKey } from 'components/lookup-tables/hooks/useLookupTablesAPI';

import { Description } from '.';

const INIT_INPUT = { value: '', valid: false };

type Props = {
  table: LookupTable;
};

function PurgeCache({ table }: Props) {
  const [purgeKey, setPurgeKey] = React.useState<{ value: string; valid: boolean }>(INIT_INPUT);
  const { purgeLookupTableKey } = usePurgeLookupTableKey();
  const { purgeAllLookupTableKey } = usePurgeAllLookupTableKey();

  const handlePurgeKey = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (purgeKey.valid) {
      purgeLookupTableKey({ table, key: purgeKey.value }).then(() => {
        setPurgeKey(INIT_INPUT);
      });
    }
  };

  const onChange = (event: React.BaseSyntheticEvent) => {
    const newValue = { ...purgeKey };
    newValue.valid = event.target.value && event.target.value.replace(/\s/g, '').length > 0;
    newValue.value = event.target.value;
    setPurgeKey(newValue);
  };

  const hadlePurgeAll = (event: React.SyntheticEvent) => {
    event.preventDefault();
    purgeAllLookupTableKey(table);
  };

  return (
    <Col $gap="sm">
      <Col $gap="xs">
        <h2>清除缓存</h2>
        <Description>
          您可以清除此查找表的整个缓存，或仅清除单个键的缓存条目。
        </Description>
      </Col>
      <form onSubmit={handlePurgeKey} style={{ width: '100%' }}>
        <fieldset>
          <Input
            type="text"
            id="purge-key"
            name="purgekey"
            placeholder="插入应被清除的密钥"
            label="键"
            onChange={onChange}
            help="要清除的缓存键"
            required
            value={purgeKey.value}
          />
          <Row $justify="flex-end">
            <Button type="submit" disabled={!purgeKey.valid}>
              清除密钥
            </Button>
            <Button type="button" bsStyle="primary" onClick={hadlePurgeAll}>
              清除全部
            </Button>
          </Row>
        </fieldset>
      </form>
    </Col>
  );
}

export default PurgeCache;
