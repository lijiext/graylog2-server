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

import { Panel, Table } from 'components/bootstrap';
import { Spinner } from 'components/common';
import HelpPanel from 'components/event-definitions/common/HelpPanel';

import styles from './FilterPreview.css';

class FilterPreview extends React.Component {
  static propTypes = {
    searchResult: PropTypes.object,
    errors: PropTypes.array,
    isFetchingData: PropTypes.bool,
    displayPreview: PropTypes.bool,
  };

  static defaultProps = {
    searchResult: {},
    errors: [],
    isFetchingData: false,
    displayPreview: false,
  };

  renderMessages = (messages) => messages.map(({ index, message }) => (
    <tr key={`${index}-${message._id}`}>
      <td>{message.timestamp}</td>
      <td>{message.message}</td>
    </tr>
  ));

  renderSearchResult = (searchResult = {}) => {
    if (!searchResult.messages || searchResult.messages.length === 0) {
      return <p>未找到符合当前搜索条件的任何消息。</p>;
    }

    return (
      <Table striped condensed bordered>
        <thead>
          <tr>
            <th>时间戳</th>
            <th>消息</th>
          </tr>
        </thead>
        <tbody>
          {this.renderMessages(searchResult.messages)}
        </tbody>
      </Table>
    );
  };

  render() {
    const { isFetchingData, searchResult, errors, displayPreview } = this.props;

    const renderedResults = isFetchingData ? <Spinner text="Loading filter preview..." /> : this.renderSearchResult(searchResult);

    return (
      <>
        <HelpPanel collapsible
                   defaultExpanded={!displayPreview}
                   title="过滤和聚合将创建多少事件？">
          <p>
            筛选与聚合条件将根据其配置方式生成不同数量的事件：
          </p>
          <ul>
            <li><b>过滤器:</b> 每个匹配过滤器的消息生成一个事件</li>
            <li>
              <b>无分组聚合:</b> 每次聚合结果满足条件时生成一个事件
            </li>
            <li>
              <b>按组聚合:</b> 每个分组中满足条件聚合结果的一个事件
            </li>
          </ul>
        </HelpPanel>

        {displayPreview && (
          <Panel className={styles.filterPreview} bsStyle="default">
            <Panel.Heading>
              <Panel.Title>过滤器预览</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              {errors.length > 0 ? <p className="text-danger">{errors[0].description}</p> : renderedResults}
            </Panel.Body>
          </Panel>
        )}
      </>
    );
  }
}

export default FilterPreview;
