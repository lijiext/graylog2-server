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

import { Alert, Col, Row } from 'components/bootstrap';
import { Icon } from 'components/common';
import { MetricsList } from 'components/metrics';
import SearchForm from 'components/common/SearchForm';
import type { Metric } from 'stores/metrics/MetricsStore';

const StyledWarningDiv = styled.div(
  ({ theme }) => `
  height: 20px;
  margin-bottom: 5px;
  color: ${theme.colors.variant.dark.danger};
`,
);

type Props = {
  names: Array<Metric>;
  namespace: string;
  nodeId: string;
  filter?: string;
  error?: {
    responseMessage: string;
    status: number;
  };
};

const safelyFilterNames = (filter: string, names: Array<Metric>) => {
  try {
    const filterRegex = new RegExp(filter, 'i');

    return names.filter((metric) => String(metric.full_name).match(filterRegex));
  } catch (_e) {
    return [];
  }
};

type State = {
  filter: string;
};

const MetricsListContainer = styled.div`
  padding-top: 10px;
  width: 100%;
`;

class MetricsComponent extends React.Component<Props, State> {
  static defaultProps = {
    filter: '',
    error: undefined,
  };

  constructor(props: Props) {
    super(props);
    this.state = { filter: props.filter };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.filter !== this.props.filter) {
      this.setState({ filter: nextProps.filter });
    }
  }

  onFilterChange = (nextFilter: string) => {
    this.setState({ filter: nextFilter });
  };

  render() {
    const { filter } = this.state;
    const { names, error } = this.props;

    if (!names) {
      return (
        <Row className="content">
          <Col md={12}>
            <Alert bsStyle="danger">
              {error ? (
                <span>
                  无法从节点获取指标：服务器返回 <em>{error.responseMessage || ''}</em> 带有{' '}
                  {error.status} 状态码。
                </span>
              ) : (
                <span>获取节点指标时出现问题。</span>
              )}{' '}
              检索操作将在后台继续进行。
            </Alert>
          </Col>
        </Row>
      );
    }

    const filteredNames = safelyFilterNames(filter, names);

    return (
      <Row className="content">
        <Col md={12}>
          <StyledWarningDiv className="text-warning">
            {error && (
              <>
                <Icon name="warning" />
                  无法从节点获取指标：服务器返回 <em>{error.responseMessage || ''}</em> 带有{' '}
                {error.status} 状态码。显示最后可用的指标。
              </>
            )}
          </StyledWarningDiv>
          <SearchForm
            query={filter}
            onSearch={this.onFilterChange}
            queryWidth={300}
            placeholder="输入指标名称以进行过滤…">
            <MetricsListContainer>
              <MetricsList names={filteredNames} namespace={this.props.namespace} nodeId={this.props.nodeId} />
            </MetricsListContainer>
          </SearchForm>
        </Col>
      </Row>
    );
  }
}

export default MetricsComponent;
