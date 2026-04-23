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
import React from 'react';
import styled from 'styled-components';

import { PaginatedList, SearchForm, Spinner, NoSearchResult, NoEntitiesExist } from 'components/common';
import { Row, Col, Table } from 'components/bootstrap';
import CacheTableEntry from 'components/lookup-tables/CacheTableEntry';
import withPaginationQueryParameter from 'components/common/withPaginationQueryParameter';
import { LookupTableCachesActions } from 'stores/lookup-tables/LookupTableCachesStore';
import type { LookupTableCache, PaginationType } from 'logic/lookup-tables/types';
import type { PaginationQueryParameterResult } from 'hooks/usePaginationQueryParameter';
import QueryHelper from 'components/common/QueryHelper';

import Styles from './Overview.css';

const ScrollContainer = styled.div`
  overflow-x: auto;
`;

const queryExamples = (
  <>
    <p>
      按名称部分查找缓存：
      <br />
      <kbd>名称：guava</kbd>
      <br />
      <kbd>name:gua</kbd>
    </p>
    <p>
      在不指定字段名的情况下搜索将匹配 <code>title</code> 字段:
      <br />
      <kbd>guava</kbd> <br />
      与...相同
      <br />
      <kbd>标题：guava</kbd>
    </p>
  </>
);

const NoResults = ({ query }: { query: string }) => (
  <tbody>
    <tr>
      <td colSpan={7}>
        {query ? (
          <NoSearchResult>未找到标题为 " 的缓存{query}&quot;</NoSearchResult>
        ) : (
          <NoEntitiesExist>没有要列出的缓存</NoEntitiesExist>
        )}
      </td>
    </tr>
  </tbody>
);

const DataRow = ({ caches, query }: { caches: LookupTableCache[]; query: string }) =>
  caches.length > 0 ? (
    <>
      {caches.map((cache: LookupTableCache) => (
        <CacheTableEntry key={`cache-item-${cache.id}`} cache={cache} />
      ))}
    </>
  ) : (
    <NoResults query={query} />
  );

type Props = {
  caches: LookupTableCache[];
  pagination: PaginationType;
  paginationQueryParameter: PaginationQueryParameterResult;
};

const queryHelpComponent = (
  <QueryHelper entityName="cache" example={queryExamples} commonFields={['id', 'title', 'name', 'description']} />
);

const CachesOverview = ({ caches, pagination, paginationQueryParameter }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [localPagination, setLocalPagination] = React.useState({
    currentPage: paginationQueryParameter.page || 1,
    currentPageSize: paginationQueryParameter.pageSize || 10,
    currentQuery: pagination.query ? decodeURI(pagination.query) : '',
    resetPage: paginationQueryParameter.resetPage,
    setPagination: paginationQueryParameter.setPagination,
  });

  React.useEffect(() => {
    const { currentPage, currentPageSize, currentQuery } = localPagination;

    LookupTableCachesActions.searchPaginated(currentPage, currentPageSize, currentQuery).then(() => setLoading(false));
  }, [localPagination]);

  const onPageChange = React.useCallback(
    (newPage: number, newPerPage: number) => {
      setLocalPagination({ ...localPagination, currentPage: newPage, currentPageSize: newPerPage });
    },
    [localPagination],
  );

  const onSearch = React.useCallback(
    (query: string) => {
      localPagination.resetPage();
      localPagination.setPagination({ page: 1, pageSize: localPagination.currentPageSize });
      setLocalPagination({ ...localPagination, currentPage: 1, currentQuery: query });
    },
    [localPagination],
  );

  const onReset = React.useCallback(() => {
    localPagination.resetPage();
    localPagination.setPagination({ page: 1, pageSize: localPagination.currentPageSize });
    setLocalPagination({ ...localPagination, currentPage: 1, currentQuery: '' });
  }, [localPagination]);

  return (
    <Row className="content">
      <Col md={12}>
        <h2 style={{ marginBottom: 16 }}>
          配置的查找缓存 <small>{pagination.total} total</small>
        </h2>
        <PaginatedList
          activePage={localPagination.currentPage}
          pageSize={localPagination.currentPageSize}
          onChange={onPageChange}
          totalItems={pagination.total}>
          <SearchForm onSearch={onSearch} onReset={onReset} queryHelpComponent={queryHelpComponent} />
          <ScrollContainer>
            <Table condensed hover className={Styles.overviewTable}>
              <thead>
                <tr>
                  <th className={Styles.rowTitle}>标题</th>
                  <th className={Styles.rowDescription}>描述</th>
                  <th className={Styles.rowName}>名称</th>
                  <th>条目</th>
                  <th>命中率</th>
                  <th>吞吐量</th>
                  <th className={Styles.rowActions}>操作</th>
                </tr>
              </thead>
              {loading ? (
                <Spinner text="Loading data adapters" />
              ) : (
                <DataRow caches={caches} query={localPagination.currentQuery} />
              )}
            </Table>
          </ScrollContainer>
        </PaginatedList>
      </Col>
    </Row>
  );
};

export default withPaginationQueryParameter(CachesOverview);
