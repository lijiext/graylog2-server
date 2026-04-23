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
import React, { useState } from 'react';

import AppConfig from 'util/AppConfig';
import { Button, Row, Col } from 'components/bootstrap';
import { DocumentTitle, PageHeader } from 'components/common';
import { CreateIndexSet, IndicesPageNavigation } from 'components/indices';
import DocsHelper from 'util/DocsHelper';
import SelectIndexSetTemplateProvider from 'components/indices/IndexSetTemplates/contexts/SelectedIndexSetTemplateProvider';

const SelectTemplateButton = ({ onClick } : {onClick : () => void}) => {
  const isCloud = AppConfig.isCloud();
  if (isCloud) return null;

  return (
    <Button onClick={onClick}>选择模板</Button>);
};

const IndexSetCreationPage = () => {
  const [showSelectTemplateModal, setShowSelectTemplateModal] = useState<boolean>(true);

  return (
    <SelectIndexSetTemplateProvider>
      <DocumentTitle title="创建索引集">
        <IndicesPageNavigation />
        <div>
          <PageHeader title="创建索引集"
                      documentationLink={{
                        title: 'Index model documentation',
                        path: DocsHelper.PAGES.INDEX_MODEL,
                      }}
                      actions={<SelectTemplateButton onClick={() => setShowSelectTemplateModal(true)} />}>
            <span>
              创建新的索引集，允许您配置来自一个或多个数据流的消息的保留、分片和副本。
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <CreateIndexSet showSelectTemplateModal={showSelectTemplateModal}
                              setShowSelectTemplateModal={setShowSelectTemplateModal} />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    </SelectIndexSetTemplateProvider>
  );
};

export default IndexSetCreationPage;
