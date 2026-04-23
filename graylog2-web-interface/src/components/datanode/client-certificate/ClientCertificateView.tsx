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
import styled, { css } from 'styled-components';

import type { ClientCertCreateResponse } from 'components/datanode/hooks/useCreateDataNodeClientCert';
import copyToClipboard from 'util/copyToClipboard';
import { Button } from 'components/bootstrap';

type Props = {
  clientCerts: ClientCertCreateResponse
};

const Textarea = styled.textarea(({ theme }) => css`
  width: 100%;
  padding: 3px;
  resize: none;
  flex: 1;
  margin: 15px 0 7px;
  border: 1px solid ${theme.colors.variant.lighter.default};
  font-family: ${theme.fonts.family.monospace};
  font-size: ${theme.fonts.size.body};

  &:focus {
    border-color: ${theme.colors.variant.light.info};
    outline: none;
  }
`);

const ClientCertificateView = ({ clientCerts }: Props) => (
  <>
    <dt>主体：</dt>
    <dd>{clientCerts.principal}</dd>
    <dt>角色：</dt>
    <dd>{clientCerts.role}</dd>
    <dt>CA 证书 <Button bsStyle="info" bsSize="xs" onClick={() => copyToClipboard(clientCerts.ca_certificate)}>复制到剪贴板</Button></dt>
    <dd>
      <Textarea id="ca_certificate"
                value={clientCerts.ca_certificate}
                spellCheck={false} />
    </dd>
    <dt>私钥 <Button bsStyle="info" bsSize="xs" onClick={() => copyToClipboard(clientCerts.private_key)}>复制到剪贴板</Button></dt>
    <dd>
      <Textarea id="private_key"
                value={clientCerts.private_key}
                spellCheck={false} />
    </dd>
    <dt>证书 <Button bsStyle="info" bsSize="xs" onClick={() => copyToClipboard(clientCerts.certificate)}>复制到剪贴板</Button></dt>
    <dd>
      <Textarea id="certificate"
                value={clientCerts.certificate}
                spellCheck={false} />
    </dd>
  </>
);

export default ClientCertificateView;
