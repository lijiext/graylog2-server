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
import React, { useEffect, useState } from 'react';

import { LinkContainer } from 'components/common/router';
import Routes from 'routing/Routes';
import { Button } from 'components/bootstrap';
import UserNotification from 'util/UserNotification';
import { DocumentTitle, PageHeader } from 'components/common';
import ContentPackEdit from 'components/content-packs/ContentPackEdit';
import ContentPack from 'logic/content-packs/ContentPack';
import Entity from 'logic/content-packs/Entity';
import { CatalogStore, CatalogActions } from 'stores/content-packs/CatalogStore';
import { ContentPacksActions } from 'stores/content-packs/ContentPacksStore';
import useHistory from 'routing/useHistory';
import { useStore } from 'stores/connect';

const CreateContentPackPage = () => {
  const history = useHistory();
  const { entityIndex } = useStore<{ entityIndex: string | undefined }>(CatalogStore);
  const [contentPackState, setContentPackState] = useState({
    contentPack: ContentPack.builder().build(),
    appliedParameter: {},
    selectedEntities: {},
    fetchedEntities: undefined,
  });

  useEffect(() => {
    CatalogActions.showEntityIndex();
  }, []);

  const _onStateChanged = (newState: { contentPack: unknown, selectedEntities: unknown, appliedParameter: unknown }) => {
    setContentPackState((cur) => ({
      ...cur,
      contentPack: newState.contentPack || cur.contentPack,
      selectedEntities: newState.selectedEntities || cur.selectedEntities,
      appliedParameter: newState.appliedParameter || cur.appliedParameter,
    }));
  };

  const _onSave = () => {
    const { contentPack } = contentPackState;

    ContentPacksActions.create.triggerPromise(contentPack.toJSON())
      .then(
        () => {
          UserNotification.success('内容包导入成功', '成功！');
          history.push(Routes.SYSTEM.CONTENTPACKS.LIST);
        },
        (response) => {
          const message = 'Error importing content pack, please ensure it is a valid JSON file. Check your '
            + 'Graylog logs for more information.';
          const title = '无法导入内容包';
          let smallMessage = '';

          if (response.additional && response.additional.body && response.additional.body.message) {
            smallMessage = `<br /><small>${response.additional.body.message}</small>`;
          }

          UserNotification.error(message + smallMessage, title);
        },
      );
  };

  const _getEntities = (selectedEntities: unknown) => {
    const { contentPack } = contentPackState;

    CatalogActions.getSelectedEntities(selectedEntities).then((result) => {
      const newContentPack = contentPack.toBuilder()
        /* Mark entities from server */
        .entities(result.entities.map((e) => Entity.fromJSON(e, true, contentPack.parameters)))
        .build();
      const fetchedEntities = result.entities.map((e) => Entity.fromJSON(e, false, contentPack.parameters));

      setContentPackState((cur) => ({ ...cur, contentPack: newContentPack, fetchedEntities }));
    });
  };

  return (
    <DocumentTitle title="内容包">
      <span>
        <PageHeader title="创建内容包"
                    topActions={(
                      <LinkContainer to={Routes.SYSTEM.CONTENTPACKS.LIST}>
                        <Button bsStyle="info">内容包</Button>
                      </LinkContainer>
                    )}>
          <span>
            内容包可加速特定数据源的设置过程。内容包可以包含输入端/提取器、数据流和仪表盘。
            <br />
            在以下位置查找更多内容包 {' '} <a href="https://marketplace.graylog.org/" target="_blank" rel="noopener noreferrer">Graylog 应用市场</a>.
          </span>
        </PageHeader>
        <ContentPackEdit contentPack={contentPackState.contentPack}
                         onGetEntities={_getEntities}
                         onStateChange={_onStateChanged}
                         fetchedEntities={contentPackState.fetchedEntities}
                         selectedEntities={contentPackState.selectedEntities}
                         appliedParameter={contentPackState.appliedParameter}
                         entityIndex={entityIndex}
                         onSave={_onSave} />
      </span>
    </DocumentTitle>
  );
};

export default CreateContentPackPage;
