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
import PropTypes from 'prop-types';
import numeral from 'numeral';

import HideOnCloud from 'util/conditional/HideOnCloud';
import { LinkContainer } from 'components/common/router';
import { Alert, Row, Col, Panel, Button, ButtonToolbar } from 'components/bootstrap';
import { DocumentTitle, PageHeader, Spinner, Icon } from 'components/common';
import {
  IndicesConfigurationDropdown,
  IndicesMaintenanceDropdown,
  IndicesOverview,
  IndexSetDetails,
  IndicesPageNavigation,
} from 'components/indices';
import { IndexerClusterHealthSummary } from 'components/indexers';
import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';
import withParams from 'routing/withParams';
import connect from 'stores/connect';
import type { IndexSet } from 'stores/indices/IndexSetsStore';
import type { IndexerOverview } from 'stores/indexers/IndexerOverviewStore';
import type { Indices } from 'stores/indices/IndicesStore';
import { IndexerOverviewActions, IndexerOverviewStore } from 'stores/indexers/IndexerOverviewStore';
import { IndexSetsActions, IndexSetsStore } from 'stores/indices/IndexSetsStore';
import { IndicesActions, IndicesStore } from 'stores/indices/IndicesStore';

const REFRESH_INTERVAL = 2000;

const ElasticsearchUnavailableInformation = () => (
  <Row className="content">
    <Col md={8} mdOffset={2}>
      <div className="top-margin">
        <Panel bsStyle="danger"
               header={<span><Icon name="warning" /> 索引概览不可用</span>}>
          <p>
            无法获取索引概述信息。这通常意味着连接 Elasticsearch 时出现问题，并且 <strong>您应确保 Elasticsearch 已启动且可从 Graylog 访问</strong>.
          </p>
          <p>
            Graylog 将继续在日志中存储您的消息，但在 Elasticsearch 再次可访问之前，您将无法搜索这些消息。
          </p>
        </Panel>
      </div>
    </Col>
  </Row>
);

type Props = {
  params: {
    indexSetId?: string,
  },
  indexSet?: IndexSet,
  indexerOverview?: IndexerOverview,
  indexerOverviewError?: string,
  indexDetails: {
    closedIndices?: Indices,
    indices?: Indices,
  },
};

type State = {
  timerId?: NodeJS.Timeout,
};

class IndexSetPage extends React.Component<Props, State> {
  static propTypes = {
    params: PropTypes.shape({
      indexSetId: PropTypes.string,
    }).isRequired,
    indexSet: PropTypes.object,
    indexerOverview: PropTypes.object,
    indexerOverviewError: PropTypes.object,
    indexDetails: PropTypes.object,
  };

  static defaultProps = {
    indexerOverview: undefined,
    indexerOverviewError: undefined,
    indexSet: undefined,
    indexDetails: {
      indices: undefined,
      closedIndices: undefined,
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      timerId: undefined,
    };
  }

  componentDidMount() {
    const { params: { indexSetId } } = this.props;
    IndexSetsActions.get(indexSetId);
    IndicesActions.list(indexSetId);

    const timerId = setInterval(() => {
      IndicesActions.multiple();
      IndexerOverviewActions.list(indexSetId);
    }, REFRESH_INTERVAL);
    this.setState({ timerId: timerId });
  }

  componentWillUnmount() {
    const { timerId } = this.state;

    if (timerId) {
      clearInterval(timerId);
    }
  }

  _totalIndexCount = () => {
    const { indexerOverview: { indices = [] } } = this.props;

    return indices.length;
  };

  _isLoading = () => {
    const { indexSet } = this.props;

    return !indexSet;
  };

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const { indexSet, indexerOverview, indexerOverviewError, params: { indexSetId }, indexDetails: { indices: indexDetailsIndices, closedIndices: indexDetailsClosedIndices } } = this.props;

    const pageHeader = indexSet && (
      <PageHeader title={`索引集：${indexSet.title}`}
                  documentationLink={{
                    title: '索引模型文档',
                    path: DocsHelper.PAGES.INDEX_MODEL,
                  }}
                  actions={(
                    <ButtonToolbar>
                      <LinkContainer to={Routes.SYSTEM.INDEX_SETS.CONFIGURATION(indexSet.id, 'details')}>
                        <Button bsStyle="info">编辑索引集</Button>
                      </LinkContainer>
                      <IndicesMaintenanceDropdown indexSetId={indexSetId} indexSet={indexSet} />
                      <IndicesConfigurationDropdown indexSetId={indexSetId} />
                    </ButtonToolbar>
                  )}>
        <span>
          这是 Graylog 当前用于搜索和分析的索引集中所有索引（消息存储）的概览。
        </span>
      </PageHeader>
    );

    if (indexerOverviewError) {
      return (
        <span>
          {pageHeader}
          <ElasticsearchUnavailableInformation />
        </span>
      );
    }

    let indicesInfo;
    let indicesOverview;

    if (indexerOverview && indexDetailsClosedIndices) {
      const deflectorInfo = indexerOverview.deflector;

      indicesInfo = (
        <span>
          <Alert bsStyle="success" style={{ marginTop: '10' }}>
            {this._totalIndexCount()} 索引，总计{' '}
            {numeral(indexerOverview.counts.events).format('0,0')} 正在管理的消息数，当前写入活动索引为 <i>{deflectorInfo.current_target}</i>.
          </Alert>
          <HideOnCloud>
            <IndexerClusterHealthSummary health={indexerOverview.indexer_cluster.health} />
          </HideOnCloud>
        </span>
      );

      indicesOverview = (
        <IndicesOverview indices={indexerOverview.indices}
                         indexDetails={indexDetailsIndices}
                         indexSetId={indexSetId} />
      );
    } else {
      indicesInfo = <Spinner />;
      indicesOverview = <Spinner />;
    }

    return (
      <DocumentTitle title={`索引集 - ${indexSet ? indexSet.title : ''}`}>
        <IndicesPageNavigation />
        <div>
          {pageHeader}

          <Row className="content">
            <Col md={12}>
              <IndexSetDetails indexSet={indexSet} />
            </Col>
          </Row>

          <Row className="content">
            <Col md={12}>
              {indicesInfo}
            </Col>
          </Row>

          {indicesOverview}
        </div>
      </DocumentTitle>
    );
  }
}

export default connect(
  withParams(IndexSetPage),
  {
    indexSets: IndexSetsStore,
    indexerOverview: IndexerOverviewStore,
    indices: IndicesStore,
  },
  ({ indexSets, indexerOverview, indices }) => ({
    // @ts-ignore
    indexSet: indexSets ? indexSets.indexSet : undefined,
    // @ts-ignore
    indexerOverview: indexerOverview && indexerOverview.indexerOverview,
    // @ts-ignore
    indexerOverviewError: indexerOverview && indexerOverview.indexerOverviewError,
    indexDetails: indices,
  }),
);
