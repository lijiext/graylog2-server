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

import { Alert, Button } from 'components/bootstrap';
import IndexRangeSummary from 'components/indices/IndexRangeSummary';
import { IndicesActions } from 'stores/indices/IndicesStore';

type ClosedIndexDetailsProps = {
  indexName: string;
  indexRange?: any;
};

class ClosedIndexDetails extends React.Component<
  ClosedIndexDetailsProps,
  {
    [key: string]: any;
  }
> {
  static defaultProps = {
    indexRange: undefined,
  };

  _onReopen = () => {
    IndicesActions.reopen(this.props.indexName);
  };

  _onDeleteIndex = () => {
    if (window.confirm(`Really delete index ${this.props.indexName}?`)) {
      IndicesActions.delete(this.props.indexName);
    }
  };

  render() {
    const { indexRange } = this.props;

    return (
      <div className="index-info">
        <IndexRangeSummary indexRange={indexRange} />
        <Alert bsStyle="info">
          该索引已关闭。当前无法获取索引信息，请重新打开索引并重试。
        </Alert>
        <hr style={{ marginBottom: '5', marginTop: '10' }} />
        <Button bsStyle="warning" bsSize="xs" onClick={this._onReopen}>
          重新打开索引
        </Button>{' '}
        <Button bsStyle="danger" bsSize="xs" onClick={this._onDeleteIndex}>
          删除索引
        </Button>
      </div>
    );
  }
}

export default ClosedIndexDetails;
