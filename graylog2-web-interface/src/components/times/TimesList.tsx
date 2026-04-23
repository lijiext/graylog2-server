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
import { useEffect, useState } from 'react';
import moment from 'moment';

import { Col, Row } from 'components/bootstrap';
import { Spinner, Timestamp, BrowserTime } from 'components/common';
import { SystemStore } from 'stores/system/SystemStore';
import useCurrentUser from 'hooks/useCurrentUser';
import { useStore } from 'stores/connect';
import useProductName from 'brand-customization/useProductName';

const TimesList = () => {
  const productName = useProductName();
  const [time, setTime] = useState(moment());
  const currentUser = useCurrentUser();
  const { system } = useStore(SystemStore);

  useEffect(() => {
    const interval = setInterval(() => setTime(moment()), 1000);

    return () => clearInterval(interval);
  }, []);

  if (!system) {
    return <Spinner />;
  }

  const timeFormat = 'withTz';
  const serverTimezone = system.timezone;

  return (
    <Row className="content">
      <Col md={12}>
        <h2>时间配置</h2>

        <p className="description">
          处理时区可能令人困惑。在此您可以查看应用于系统不同组件的时区。您可以检查特定组件的时区设置 {productName} 服务器节点在其各自的详情页面。
        </p>

        <dl className="system-dl">
          <dt>
            用户 <em>{currentUser.username}</em>:
          </dt>
          <dd>
            <Timestamp dateTime={time} format={timeFormat} />
          </dd>
          <dt>您的 Web 浏览器:</dt>
          <dd>
            <BrowserTime dateTime={time} format={timeFormat} />
          </dd>
          <dt>{productName} server:</dt>
          <dd>
            <Timestamp dateTime={time} format={timeFormat} tz={serverTimezone} />
          </dd>
        </dl>
      </Col>
    </Row>
  );
};

export default TimesList;
