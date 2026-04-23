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

import { ExternalLink } from 'components/common';
import { Alert } from 'components/bootstrap';
import useProductName from 'brand-customization/useProductName';

type Props = {
  showProfile?: boolean;
};

const TelemetryInfoText = ({ showProfile = undefined }: Props) => {
  const productName = useProductName();

  return (
    <Alert bsStyle="info">
      我们希望收集匿名使用数据，以帮助我们优先改进并 {productName} 未来会更好。
      <br />
      我们不会收集您实例中的个人数据、敏感信息或日志等内容。
      <br />
      在我们的 <ExternalLink href="https://www.graylog.org/privacy-policy/">隐私政策</ExternalLink>.
      <br />
      您可以随时关闭或开启数据采集
      {showProfile && <b> 在用户资料中</b>}
      {!showProfile && ' here'}.
    </Alert>
  );
};

export default TelemetryInfoText;
