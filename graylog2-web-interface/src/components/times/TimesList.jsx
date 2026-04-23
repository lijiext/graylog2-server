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
import Reflux from 'reflux';
import moment from 'moment';

import { Col, Row } from 'components/bootstrap';
import { Spinner, Timestamp, BrowserTime } from 'components/common';
import { CurrentUserStore } from 'stores/users/CurrentUserStore';
import { SystemStore } from 'stores/system/SystemStore';

const TimesList = createReactClass({
  // eslint-disable-next-line react/no-unused-class-component-methods
  displayName: 'TimesList',
  mixins: [Reflux.connect(CurrentUserStore), Reflux.connect(SystemStore)],

  getInitialState() {
    return { time: moment() };
  },

  componentDidMount() {
    this.interval = setInterval(() => this.setState(this.getInitialState()), 1000);
  },

  componentWillUnmount() {
    clearInterval(this.interval);
  },

  render() {
    if (!this.state.system) {
      return <Spinner />;
    }

    const { time } = this.state;
    const timeFormat = 'withTz';
    const { currentUser } = this.state;
    const serverTimezone = this.state.system.timezone;

    return (
      <Row className="content">
        <Col md={12}>
          <h2>时间配置</h2>

          <p className="description">
            处理时区可能令人困惑。在此您可以查看应用于系统不同组件的时区。您可以在各个 graylog-server 节点的详细页面检查其时区设置。
          </p>

          <dl className="system-dl">
            <dt>用户 <em>{currentUser.username}</em>:</dt>
            <dd><Timestamp dateTime={time} format={timeFormat} /></dd>
            <dt>您的 Web 浏览器:</dt>
            <dd><BrowserTime dateTime={time} format={timeFormat} /></dd>
            <dt>Graylog 服务器:</dt>
            <dd><Timestamp dateTime={time} format={timeFormat} tz={serverTimezone} /></dd>
          </dl>
        </Col>
      </Row>
    );
  },
});

export default TimesList;
