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

import { Tabs, Tab, Alert } from 'components/bootstrap';
import CACreateForm from 'components/datanode/DataNodeConfiguration/CACreateForm';
import CAUpload from 'components/datanode/DataNodeConfiguration/CAUpload';
import DocumentationLink from 'components/support/DocumentationLink';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

const StyledAlert = styled(Alert)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const TAB_KEYS = ['create', 'upload'];

const UploadCA = 'Upload CA';

const CAConfiguration = () => {
  const sendTelemetry = useSendTelemetry();

  const handleTabSwitch = (e) => {
    sendTelemetry((e?.target?.innerText === UploadCA)
      ? TELEMETRY_EVENT_TYPE.DATANODE_MIGRATION.CA_UPLOAD_TAB_CLICKED
      : TELEMETRY_EVENT_TYPE.DATANODE_MIGRATION.CA_CREATE_TAB_CLICKED, {
      app_pathname: 'datanode',
      app_section: 'migration',
    });
  };

  return (
    <>
      <h2>配置证书颁发机构</h2>
      <p>
        在此步骤中，您可以上传或创建新的证书颁发机构。<br />
        证书颁发机构将更轻松地为您数据节点配置和管理证书。
      </p>
      <StyledAlert bsStyle="info" title="重用证书">
        如果您的现有集群使用证书，默认情况下，这些证书将在下一步中数据节点配置期间被 Graylog CA 和自动生成的证书替换。如果您希望包含自己的 CA，可以上传现有证书。请参阅 <DocumentationLink page="graylog-data-node" text="Graylog Data Node - Getting Started" /> 更多详细信息。
      </StyledAlert>
      <Tabs defaultActiveKey={TAB_KEYS[0]} id="ca-configurations" onClick={handleTabSwitch}>
        <Tab eventKey={TAB_KEYS[0]} title="创建新的 CA">
          <CACreateForm />
        </Tab>
        <Tab eventKey={TAB_KEYS[1]} title={UploadCA}>
          <CAUpload />
        </Tab>
      </Tabs>
    </>
  );
};

export default CAConfiguration;
