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

import { Link } from 'components/common/router';
import { Col, Row } from 'components/bootstrap';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { isPermitted } from 'util/PermissionsMixin';
import useCurrentUser from 'hooks/useCurrentUser';
import SidecarListContainer from 'components/sidecars/sidecars/SidecarListContainer';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import SidecarsPageNavigation from 'components/sidecars/common/SidecarsPageNavigation';
import useBasicSidecarUser from 'components/sidecars/hooks/useBasicSidecarUser';

const SidecarsPage = () => {
  const currentUser = useCurrentUser();
  const canCreateSidecarUserTokens = isPermitted(currentUser?.permissions, ['users:tokencreate:graylog-sidecar']);
  const canReadSidecarUser = isPermitted(currentUser?.permissions, ['users:read:graylog-sidecar']);
  const shouldFetchSidecarUser = canCreateSidecarUserTokens && canReadSidecarUser;
  const { data: sidecarUser } = useBasicSidecarUser({ enabled: shouldFetchSidecarUser });

  return (
    <DocumentTitle title="Sidecars">
      <SidecarsPageNavigation />
      <PageHeader
        title="采集器概览"
        documentationLink={{
          title: 'Sidecar documentation',
          path: DocsHelper.PAGES.COLLECTOR_SIDECAR,
        }}>
        <span>
          Sidecars 可以可靠地转发来自您服务器的日志文件或 Windows 事件日志的内容。
          {canCreateSidecarUserTokens &&
            (sidecarUser ? (
              <span>
                <br />
                您需要为 Sidecar 获取 API 令牌吗？ 
                <Link to={Routes.SYSTEM.USERS.TOKENS.edit(sidecarUser.id)}>
                  创建或重用用于的令牌 <em>{sidecarUser.username}</em> user
                </Link>
              </span>
            ) : (
              <Spinner />
            ))}
        </span>
      </PageHeader>

      <Row className="content">
        <Col md={12}>
          <SidecarListContainer />
        </Col>
      </Row>
    </DocumentTitle>
  );
};

export default SidecarsPage;
