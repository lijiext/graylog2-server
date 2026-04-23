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
import styled from 'styled-components';

import { PaginatedList, SearchForm, Spinner, NoSearchResult, NoEntitiesExist } from 'components/common';
import { Row, Col, Table } from 'components/bootstrap';
import LUTTableEntry from 'components/lookup-tables/LUTTableEntry';
import withPaginationQueryParameter from 'components/common/withPaginationQueryParameter';
import { LookupTablesActions } from 'stores/lookup-tables/LookupTablesStore';
import type { LookupTable, LookupTableAdapter, LookupTableCache, PaginationType } from 'logic/lookup-tables/types';
import type { PaginationQueryParameterResult } from 'hooks/usePaginationQueryParameter';
import QueryHelper from 'components/common/QueryHelper';

import Styles from './Overview.css';

const ScrollContainer = styled.div`
  overflow-x: auto;
`;
const queryExample = (
  <p>
    在不指定字段名的情况下搜索将匹配 <code>title</code> 字段:
    <br />
    <kbd>geoip</kbd> <br />
    与...相同
    <br />
    <kbd>标题：GeoIP</kbd>
  </p>
);
const queryHelpComponent = (
  <QueryHelper entityName="lookup table" commonFields={['id', 'title', 'name', 'description']} example={queryExample} />
);

type ItemProps = {
  table: LookupTable;
  caches: LookupTableCache[];
  dataAdapters: LookupTableAdapter[];
  errorStates: { [key: string]: { [key: string]: string } };
};

const LUTItem = ({ table, caches, dataAdapters, errorStates }: ItemProps) => {
  const lookupName = (id: string, map: LookupTableCache[] | LookupTableAdapter[]) => {
    const empty = { title: 'none' };

    if (!map) return empty;

    return map[id] || empty;
  };

  const lookupAdapterError = () => {
    if (errorStates.dataAdapters && dataAdapters) {
      const adapter = dataAdapters[table.data_adapter_id];

      if (!adapter) return null;

      return errorStates.dataAdapters[adapter.name];
    }

    return null;
  };

  const cache = lookupName(table.cache_id, caches);
  const dataAdapter = lookupName(table.data_adapter_id, dataAdapters);
  const errors = {
    table: errorStates.tables[table.name],
    cache: null,
    dataAdapter: lookupAdapterError(),
  };

  return <LUTTableEntry table={table} cache={cache} dataAdapter={dataAdapter} errors={errors} />;
};

const NoResults = ({ query }: { query: string }) => (
  <tbody>
    <tr>
      <td colSpan={6}>
        {query ? (
          <NoSearchResult>未找到标题为 " 的表{query}&quot;</NoSearchResult>
        ) : (
          <NoEntitiesExist>没有要列出的数据适配器</NoEntitiesExist>
        )}
      </td>
    </tr>
  </tbody>
);

const DataRow = ({
  tables,
  caches,
  dataAdapters,
  query,
  errorStates,
}: {
  tables: LookupTable[];
  caches: LookupTableCache[];
  dataAdapters: LookupTableAdapter[];
  query: string;
  errorStates: { [key: string]: { [key: string]: string } };
}) =>
  tables.length > 0 ? (
    <>
      {tables.map((table: LookupTable) => (
        <LUTItem
          key={`table-item-${table.id}`}
          table={table}
          caches={caches}
          dataAdapters={dataAdapters}
          errorStates={errorStates}
        />
      ))}
    </>
  ) : (
    <NoResults query={query} />
  );

type Props = {
  tables: LookupTable[];
  caches: LookupTableCache[];
  dataAdapters: LookupTableAdapter[];
  pagination: PaginationType;
  errorStates: { [key: string]: { [key: string]: string } };
  paginationQueryParameter: PaginationQueryParameterResult;
};

const LookupTablesOverview = ({
  tables,
  caches,
  dataAdapters,
  pagination,
  errorStates,
  paginationQueryParameter,
}: Props) => {
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

    LookupTablesActions.searchPaginated(currentPage, currentPageSize, currentQuery).then(() => setLoading(false));
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
          已配置的查找表 <small>{pagination.total} total</small>
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
                  <th className={Styles.rowCache}>缓存</th>
                  <th className={Styles.rowAdapter}>数据适配器</th>
                  <th className={Styles.rowActions}>操作</th>
                </tr>
              </thead>
              {loading ? (
                <Spinner text="Loading data adapters" />
              ) : (
                <DataRow
                  tables={tables}
                  caches={caches}
                  dataAdapters={dataAdapters}
                  query={localPagination.currentQuery}
                  errorStates={errorStates}
                />
              )}
            </Table>
          </ScrollContainer>
        </PaginatedList>
      </Col>
    </Row>
  );
};

export default withPaginationQueryParameter(LookupTablesOverview);
