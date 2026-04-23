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
import styled from 'styled-components';

import { Spinner, ConfirmDialog, NoSearchResult } from 'components/common';
import { Col, Row, Table, Button } from 'components/bootstrap';
import type { BundleFile } from 'hooks/useClusterSupportBundle';
import useClusterSupportBundle from 'hooks/useClusterSupportBundle';
import ClusterSupportBundleInfo from 'components/loggers/ClusterSupportBundleInfo';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AlignRightCell = styled.td`
  text-align: right;
`;

const AlignRightHeadCell = styled.th`
  text-align: right;
`;

const FilenameCol = styled.col`
  width: 33%;
`;

const DownloadButton = styled(Button)`
  margin-right: 6px;
`;

const LoadingSpinner = styled(Spinner)(({ theme }) => `
  margin-left: 6px;
  font-size: ${theme.fonts.size.h5};
`);

const ClusterSupportBundleOverview = () => {
  const { list, isCreating, onCreate, onDelete, onDownload } = useClusterSupportBundle();
  const [bundleNameToDelete, setBundleNameToDelete] = useState<string | null>(null);

  const renderRow = (bundle: BundleFile) => (
    <tr key={bundle.file_name}>
      <td>
        {bundle.file_name}
      </td>
      <AlignRightCell>
        {bundle.size}
      </AlignRightCell>
      <AlignRightCell>
        <DownloadButton bsSize="xsmall"
                        bsStyle="info"
                        onClick={() => onDownload(bundle.file_name)}>下载
        </DownloadButton>
        <Button bsSize="xsmall"
                bsStyle="default"
                onClick={() => setBundleNameToDelete(bundle.file_name)}>删除
        </Button>
      </AlignRightCell>
    </tr>
  );

  return (
    <div>
      <Row className="content">
        <Col xs={12}>
          <Header>
            <h2>集群支持包</h2>
            <Button bsStyle="success" onClick={onCreate} disabled={isCreating}>
              创建支持包
              {isCreating && <LoadingSpinner text="" delay={0} />}
            </Button>
          </Header>
          <ClusterSupportBundleInfo />
          {(list.length > 0) ? (
            <Table className="table-striped table-condensed table-hover">
              <colgroup>
                <FilenameCol />
              </colgroup>
              <thead>
                <tr>
                  <th>文件名</th>
                  <AlignRightHeadCell>大小</AlignRightHeadCell>
                </tr>
              </thead>
              <tbody>
                {list.map(renderRow)}
              </tbody>
            </Table>
          ) : (
            <NoSearchResult>
              未找到任何支持包。
            </NoSearchResult>
          )}
        </Col>
      </Row>
      <ConfirmDialog title="删除支持包"
                     show={Boolean(bundleNameToDelete)}
                     onConfirm={() => {
                       onDelete(bundleNameToDelete);
                       setBundleNameToDelete(null);
                     }}
                     onCancel={() => setBundleNameToDelete(null)}>
        <>您确定要删除 <strong>{bundleNameToDelete}</strong>?</>
      </ConfirmDialog>
    </div>
  );
};

export default ClusterSupportBundleOverview;
