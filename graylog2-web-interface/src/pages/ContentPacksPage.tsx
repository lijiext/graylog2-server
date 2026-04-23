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
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';

import { LinkContainer } from 'components/common/router';
import { Row, Col, ButtonToolbar, Button } from 'components/bootstrap';
import Routes from 'routing/Routes';
import Spinner from 'components/common/Spinner';
import UserNotification from 'util/UserNotification';
import { DocumentTitle, PageHeader } from 'components/common';
import ContentPacksList from 'components/content-packs/ContentPacksList';
import ContentPackUploadControls from 'components/content-packs/ContentPackUploadControls';
import { ContentPacksActions, ContentPacksStore } from 'stores/content-packs/ContentPacksStore';
import { useStore } from 'stores/connect';
import type { ContentPackInstallation, ContentPackMetadata } from 'components/content-packs/Types';

const ConfigurationBundles = styled.div(({ theme }) => css`
  font-size: ${theme.fonts.size.body};
  font-weight: normal;
  margin-top: 15px;
`);

const _deleteContentPack = (contentPackId: string) => {
  // eslint-disable-next-line no-alert
  if (window.confirm('You are about to delete this Content Pack, are you sure?')) {
    ContentPacksActions.delete(contentPackId).then(() => {
      UserNotification.success('内容包删除成功。', '成功');
      ContentPacksActions.list();
    }, (error) => {
      let err_message = error.message;
      const err_body = error.additional.body;

      if (err_body && err_body.message) {
        err_message = error.additional.body.message;
      }

      UserNotification.error(`删除捆绑包失败：${err_message}`, '错误');
    });
  }
};

const _installContentPack = (contentPackId: string, contentPackRev: string, parameters: unknown) => {
  ContentPacksActions.install(contentPackId, contentPackRev, parameters).then(() => {
    UserNotification.success('内容包安装成功。', '成功');
    ContentPacksActions.list();
  }, (error) => {
    UserNotification.error(`安装内容包失败，状态为：${error}。
         无法安装 ID 为 ${contentPackId} 的内容包`);
  });
};

const ContentPacksPage = () => {
  const { contentPacks, contentPackMetadata } = useStore<{ contentPacks: Array<ContentPackInstallation>, contentPackMetadata: ContentPackMetadata }>(ContentPacksStore);

  useEffect(() => {
    ContentPacksActions.list();
  }, []);

  if (!contentPacks) {
    return (<Spinner />);
  }

  return (
    <DocumentTitle title="内容包">
      <span>
        <PageHeader title="内容包"
                    topActions={<Button bsStyle="info">内容包</Button>}
                    actions={(
                      <ButtonToolbar>
                        <ContentPackUploadControls />
                        <LinkContainer to={Routes.SYSTEM.CONTENTPACKS.CREATE}>
                          <Button bsStyle="success">创建内容包</Button>
                        </LinkContainer>
                      </ButtonToolbar>
                      )}>
          <span>
            内容包可加速特定数据源的设置过程。内容包可以包含输入端/提取器、数据流和仪表盘。
            <br />
            在以下位置查找更多内容包 {' '}
            <a href="https://marketplace.graylog.org/" target="_blank" rel="noopener noreferrer">Graylog 应用市场</a>.
          </span>
        </PageHeader>

        <Row className="content">
          <Col md={12}>
            <ConfigurationBundles>
              <ContentPacksList contentPacks={contentPacks}
                                contentPackMetadata={contentPackMetadata}
                                onDeletePack={_deleteContentPack}
                                onInstall={_installContentPack} />
            </ConfigurationBundles>
          </Col>
        </Row>
      </span>
    </DocumentTitle>
  );
};

export default ContentPacksPage;
