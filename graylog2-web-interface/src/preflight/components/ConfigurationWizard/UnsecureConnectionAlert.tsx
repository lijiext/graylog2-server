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

import Alert from 'components/bootstrap/Alert';
import isSecureConnection from 'preflight/util/IsSecureConnection';

type Props = {
  renderIfSecure?: React.ReactElement
}

const UnsecureConnectionAlert = ({ renderIfSecure }: Props) => {
  const connectionIsSecure = isSecureConnection();

  if (connectionIsSecure === 'YES') {
    return renderIfSecure ?? null;
  }

  return (
    <Alert bsStyle="warning">
      {connectionIsSecure === 'NO' && (
        <>
          您的连接不安全。请注意，信息将以未加密形式发送到服务器。
        </>
      )}
      {connectionIsSecure === 'MAYBE' && (
        <>
          您的连接可能不安全。请注意，信息可能以未加密形式发送到服务器。
        </>
      )}
    </Alert>
  );
};

UnsecureConnectionAlert.defaultProps = {
  renderIfSecure: undefined,
};

export default UnsecureConnectionAlert;
