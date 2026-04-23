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
import { useState } from 'react';
import styled, { css } from 'styled-components';

import { ARCHIVE_RETENTION_STRATEGY } from 'stores/indices/IndicesStore';
import { Icon, Section, Spinner, Timestamp } from 'components/common';
import { IndexSetsStore, type IndexSet } from 'stores/indices/IndexSetsStore';
import { Table, Button, Alert } from 'components/bootstrap';
import { LinkContainer } from 'components/common/router';
import Routes from 'routing/Routes';
import { useStore } from 'stores/connect';
import type { Stream } from 'stores/streams/StreamsStore';
import NumberUtils from 'util/NumberUtils';
import useStreamOutputFilters from 'components/streams/hooks/useStreamOutputFilters';
import IndexSetArchivingCell from 'components/streams/StreamDetails/routing-destination/IndexSetArchivingCell';
import IndexSetUpdateForm from 'components/streams/StreamDetails/routing-destination/IndexSetUpdateForm';
import IndexSetFilters from 'components/streams/StreamDetails/routing-destination/IndexSetFilters';
import DestinationSwitch from 'components/streams/StreamDetails/routing-destination/DestinationSwitch';
import SectionCountLabel from 'components/streams/StreamDetails/SectionCountLabel';
import useIndexSetStats from 'hooks/useIndexSetStats';
import { DEFAULT_PAGINATION } from 'stores/PaginationTypes';

type Props = {
  indexSet: IndexSet,
  stream: Stream,
};

const ActionButtonsWrap = styled.span(() => css`
  float: right;
`);

const DestinationIndexSetSection = ({ indexSet, stream }: Props) => {
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const archivingEnabled = indexSet.retention_strategy_class === ARCHIVE_RETENTION_STRATEGY || indexSet?.data_tiering?.archive_before_deletion;
  const { indexSets } = useStore(IndexSetsStore);
  const { data, isLoading } = useStreamOutputFilters(stream.id, 'indexer', pagination);
  /* eslint-disable no-constant-condition */
  const title = true ? '已启用' : '已禁用'; // TODO use api to check if enabled
  const { data: indexSetStats, isSuccess: isStatsLoaded } = useIndexSetStats(indexSet.id);

  if (isLoading) {
    <Spinner />;
  }

  const onPaginationChange = (newPage: number, newPerPage: number) => setPagination({
    ...pagination,
    page: newPage,
    perPage: newPerPage,
  });

  return (
    <Section title="索引集"
             collapsible
             defaultClosed
             headerLeftSection={(
               <>
                 <DestinationSwitch aria-label="切换索引集"
                                    name="toggle-indexset"
                                    checked
                                    label={title}
                                    disabled
                                    onChange={() => {}} />
                 <SectionCountLabel>FILTERS {data?.pagination?.total || 0}</SectionCountLabel>
               </>
             )}
             actions={(
               <IndexSetUpdateForm initialValues={{ index_set_id: indexSet.id }}
                                   indexSets={indexSets}
                                   stream={stream} />
            )}>
      <Alert bsStyle="default">
        路由到 <b>搜索集群</b> 将在 Graylog 中可搜索并计入 Graylog 许可证使用情况。<br />
        这些消息将存储在定义的索引集中，直到满足保留策略条件。<br />
        注意：未路由到 <b>搜索集群</b> 将在 Graylog 中不可搜索。
      </Alert>
      <Table>
        <thead>
          <tr>
            <td>名称</td>
            <td>总大小</td>
            <td>最旧的消息 (日期)</td>
            <td colSpan={2}>归档中</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{indexSet?.title}</td>
            <td>{(isStatsLoaded && indexSetStats?.size) ? NumberUtils.formatBytes(indexSetStats.size) : 0}</td>
            <td><Timestamp dateTime={indexSet.creation_date} /></td>
            <td>
              <IndexSetArchivingCell isArchivingEnabled={archivingEnabled} streamId={stream.id} />
            </td>
            {}
            <td>
              <ActionButtonsWrap>
                <LinkContainer to={Routes.SYSTEM.INDEX_SETS.SHOW(indexSet.id)}>
                  <Button bsStyle="default"
                          bsSize="xsmall"
                          onClick={() => {}}
                          title="查看索引集">
                    <Icon name="pageview" type="regular" />
                  </Button>
                </LinkContainer>
              </ActionButtonsWrap>
            </td>
          </tr>
        </tbody>
      </Table>
      {data && (<IndexSetFilters streamId={stream.id} paginatedFilters={data} onPaginationChange={onPaginationChange} />)}
    </Section>
  );
};

export default DestinationIndexSetSection;
