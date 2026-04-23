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
import styled from 'styled-components';
import { useEffect } from 'react';
import { Space } from '@mantine/core';

import Spinner from 'components/common/Spinner';
import { Section } from 'preflight/components/common';
import useServerAvailability from 'preflight/hooks/useServerAvailability';
import reloadPage from 'preflight/components/reloadPage';

const P = styled.p`
  max-width: 700px;
`;

const WaitingForStartup = () => {
  const { data: serverIsAvailable } = useServerAvailability();

  useEffect(() => {
    if (serverIsAvailable) {
      reloadPage();
    }
  }, [serverIsAvailable]);

  return (
    <Section title="配置成功">
      <P>
        Graylog 服务器当前正在启动。根据您的配置，可能需要几分钟时间。一旦 Graylog 服务器可访问，此页面将自动刷新。您也可以随时手动刷新，但请注意刷新后此页面将不再可见。
      </P>

      <Space h="md" />
      <b>
        <Spinner delay={0} text="Waiting for Graylog server ..." />
      </b>
    </Section>
  );
};

export default WaitingForStartup;
