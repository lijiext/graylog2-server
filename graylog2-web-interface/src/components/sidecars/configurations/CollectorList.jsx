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
// eslint-disable-next-line no-restricted-imports
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

import { LinkContainer } from 'components/common/router';
import { Col, Row, Button } from 'components/bootstrap';
import { DataTable, PaginatedList, SearchForm } from 'components/common';
import Routes from 'routing/Routes';

import CollectorRow from './CollectorRow';
import style from './CollectorList.css';

const CollectorList = createReactClass({
  // eslint-disable-next-line react/no-unused-class-component-methods
  propTypes: {
    collectors: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    query: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    onClone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onQueryChange: PropTypes.func.isRequired,
    validateCollector: PropTypes.func.isRequired,
  },
  // eslint-disable-next-line react/no-unstable-nested-components
  headerCellFormatter(header) {
    const className = (header === 'Actions' ? style.actionsColumn : '');

    return <th className={className}>{header}</th>;
  },
  // eslint-disable-next-line react/no-unstable-nested-components
  collectorFormatter(collector) {
    const { onClone, onDelete, validateCollector } = this.props;

    return (
      <CollectorRow collector={collector}
                    onClone={onClone}
                    onDelete={onDelete}
                    validateCollector={validateCollector} />
    );
  },

  render() {
    const { collectors, pagination, query, total, onPageChange, onQueryChange } = this.props;

    const headers = ['Name', 'Operating System', 'Actions'];

    return (
      <div>
        <Row>
          <Col md={12}>
            <div className="pull-right">
              <LinkContainer to={Routes.SYSTEM.SIDECARS.NEW_COLLECTOR}>
                <Button bsStyle="success" bsSize="small">创建日志采集器</Button>
              </LinkContainer>
            </div>
            <h2>日志采集器 <small>{total} total</small></h2>
          </Col>
          <Col md={12}>
            <p>管理日志采集器，您可以通过 Graylog Sidecar 和 Graylog Web 界面对其进行配置和监控。</p>
          </Col>
        </Row>

        <Row className={`row-sm ${style.collectorRow}`}>
          <Col md={12}>
            <SearchForm query={query}
                        onSearch={onQueryChange}
                        onReset={onQueryChange}
                        placeholder="查找采集器"
                        wrapperClass={style.inline}
                        topMargin={0}
                        useLoadingState />

            <PaginatedList activePage={pagination.page}
                           pageSize={pagination.pageSize}
                           pageSizes={[10, 25]}
                           totalItems={pagination.total}
                           onChange={onPageChange}
                           useQueryParameter={false}>
              <div className={style.collectorTable}>
                <DataTable id="collector-list"
                           className="table-hover"
                           headers={headers}
                           headerCellFormatter={this.headerCellFormatter}
                           rows={collectors}
                           dataRowFormatter={this.collectorFormatter}
                           noDataText="暂无日志采集器可供显示，为何不创建一个？"
                           filterLabel=""
                           filterKeys={[]}
                           useResponsiveTable={false} />
              </div>
            </PaginatedList>
          </Col>
        </Row>
      </div>
    );
  },
});

export default CollectorList;
