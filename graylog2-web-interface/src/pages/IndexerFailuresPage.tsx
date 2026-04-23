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
import numeral from 'numeral';
import moment from 'moment';

import { Col, Row } from 'components/bootstrap';
import DocsHelper from 'util/DocsHelper';
import { DocumentTitle, Spinner, PageHeader, PaginatedList } from 'components/common';
import { IndexerFailuresList } from 'components/indexers';
import withPaginationQueryParameter from 'components/common/withPaginationQueryParameter';
import { IndexerFailuresStore } from 'stores/indexers/IndexerFailuresStore';

type IndexerFailuresPageProps = {
  paginationQueryParameter: any;
};

class IndexerFailuresPage extends React.Component<
  IndexerFailuresPageProps,
  {
    [key: string]: any;
  }
> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    IndexerFailuresStore.count(moment().subtract(10, 'years')).then((response) => {
      this.setState({ total: response.count });
    });

    this.loadData();
  }

  loadData = (page = this.props.paginationQueryParameter.page, size = this.props.paginationQueryParameter.pageSize) => {
    IndexerFailuresStore.list(size, (page - 1) * size).then((response) => {
      this.setState({ failures: response.failures });
    });
  };

  _onChangePaginatedList = (page, size) => {
    this.loadData(page, size);
  };

  render() {
    if (this.state.total === undefined || !this.state.failures) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title="索引器故障">
        <span>
          <PageHeader
            title="索引器故障"
            documentationLink={{
              title: 'Indexer failures documentation',
              path: DocsHelper.PAGES.INDEXER_FAILURES,
            }}>
            <span>
              这是消息索引尝试失败的列表。失败表示消息已正确处理，但写入索引器集群失败。请注意，该列表大小限制为 50 MB，因此将包含大量失败日志，但不一定包含所有曾经发生的失败。
              <br />
              包含总计的集合 {numeral(this.state.total).format('0,0')} 索引器失败。
            </span>
          </PageHeader>
          <Row className="content">
            <Col md={12}>
              <PaginatedList totalItems={this.state.total} onChange={this._onChangePaginatedList}>
                <IndexerFailuresList failures={this.state.failures} />
              </PaginatedList>
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  }
}

export default withPaginationQueryParameter(IndexerFailuresPage);
