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
import styled from 'styled-components';

import { LinkContainer } from 'components/common/router';
import { Alert, Col, Row, Button } from 'components/bootstrap';
import { Spinner } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';
import { DocumentationLink } from 'components/support';
import { IndexerFailuresStore } from 'stores/indexers/IndexerFailuresStore';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const formatTextForFailureCount = (count) => {
  if (count === 0) {
    return 'No failed indexing attempts in the last 24 hours.';
  }

  return <strong>存在 {numeral(count).format('0,0')} 过去 24 小时内失败的索引尝试。</strong>;
};

class IndexerFailuresComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    const since = moment().subtract(24, 'hours');

    IndexerFailuresStore.count(since).then((response) => {
      this.setState({ total: response.count });
    });
  }

  _formatFailuresSummary = () => (
    <Alert bsStyle={this.state.total === 0 ? 'success' : 'danger'}>
      {formatTextForFailureCount(this.state.total)}

      <LinkContainer to={Routes.SYSTEM.INDICES.FAILURES}>
        <Button bsStyle="info" bsSize="xs" className="pull-right">
          显示错误
        </Button>
      </LinkContainer>
    </Alert>
  );

  render() {
    let content;

    if (this.state.total === undefined) {
      content = <Spinner />;
    } else {
      content = this._formatFailuresSummary();
    }

    return (
      <Row className="content">
        <Col md={12}>
          <Header>
            <h2>索引器故障</h2>
            <DocumentationLink page={DocsHelper.PAGES.INDEXER_FAILURES} text="Indexer failures documentation" displayIcon />
          </Header>
          <p className="description">
            每条未能成功索引入的消息都将被记录为索引器失败。
          </p>
          {content}
        </Col>
      </Row>
    );
  }
}

export default IndexerFailuresComponent;
