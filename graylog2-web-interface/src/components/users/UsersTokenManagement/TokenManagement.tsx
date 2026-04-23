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
import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';

import { DEFAULT_LAYOUT, ADDITIONAL_ATTRIBUTES, COLUMNS_ORDER } from 'components/users/UsersTokenManagement/constants';
import { Row, Col } from 'components/bootstrap';
import { fetchTokens, keyFn } from 'components/users/UsersTokenManagement/hooks/useTokens';
import type { Token } from 'components/users/UsersTokenManagement/hooks/useTokens';
import { PaginatedEntityTable, QueryHelper } from 'components/common';
import TokenActions from 'components/users/UsersTokenManagement/TokenManagementActions';

import CustomColumnRenderers from './ColumnRenderers';

const Container = styled.div`
  .data-table {
    overflow-x: visible;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const TokenManagement = () => {
  const tokenAction = useCallback(
    ({ user_id, username, id: tokenId, NAME: tokenName }: Token) => (
      <TokenActions userId={user_id} username={username} tokenId={tokenId} tokenName={tokenName} />
    ),
    [],
  );
  const columnRenderers = useMemo(() => CustomColumnRenderers(), []);
  const fieldMap = {
    username: 'The username of the token owner',
    name: 'The name of the token',
    created: 'The date of the token creation',
    last_access: 'The last time the token was used',
    external_user: 'Is the token owner a user from an external authentication backend',
    auth_backend: 'The user authentication bakend. N/A for internal users',
  };
  const tokenExamples = (
    <>
      <p>
        查找由给定用户创建的令牌:
        <br />
        <code>用户名：givenName</code>
        <br />
      </p>
      <p>
        根据给定的令牌名称查找令牌:
        <br />
        <code>名称：tokenName</code>
        <br />
      </p>
    </>
  );

  return (
    <Container>
      <Row className="content">
        <Col xs={12}>
          <Header>
            <h2>令牌</h2>
          </Header>
          <PaginatedEntityTable<Token>
            humanName="tokens"
            queryHelpComponent={
              <QueryHelper entityName="token" commonFields={[]} fieldMap={fieldMap} example={tokenExamples} />
            }
            columnsOrder={COLUMNS_ORDER}
            additionalAttributes={ADDITIONAL_ATTRIBUTES}
            actionsCellWidth={320}
            entityActions={tokenAction}
            tableLayout={DEFAULT_LAYOUT}
            fetchEntities={fetchTokens}
            keyFn={keyFn}
            entityAttributesAreCamelCase={false}
            columnRenderers={columnRenderers}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default TokenManagement;
