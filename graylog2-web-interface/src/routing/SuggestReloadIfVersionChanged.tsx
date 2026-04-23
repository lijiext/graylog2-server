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
import { Dialog } from '@mantine/core';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import Button from 'components/bootstrap/Button';
import useServerVersion from 'routing/useServerVersion';
import useProductName from 'brand-customization/useProductName';

type Props = {
  reload?: () => void;
};
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const defaultReload = () => window.location.reload();
const SuggestReloadIfVersionChanged = ({ reload = defaultReload }: Props) => {
  const productName = useProductName();
  const [versionChanged, setVersionChanged] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [version, setVersion] = useState<string>();

  const newVersion = useServerVersion();

  useEffect(() => {
    if (!newVersion) {
      return;
    }
    if (!version) {
      setVersion(newVersion);
    }

    if (version && newVersion !== version) {
      setVersionChanged(true);
    }
  }, [newVersion, version]);

  return versionChanged && !dismissed ? (
    <Dialog
      opened
      withCloseButton
      onClose={() => setDismissed(true)}
      size="lg"
      radius="md"
      position={{ top: 55, right: 20 }}>
      <p>
        <strong>{productName} 版本已更改</strong>
      </p>
      <p>
        您的 {productName} 版本已从 <strong>{version}</strong> to <strong>{newVersion}</strong>.
      </p>
      <p>请保存您的工作并重新加载页面，以避免出现错误。</p>
      <ButtonContainer>
        <Button onClick={reload}>立即重新加载</Button>
      </ButtonContainer>
    </Dialog>
  ) : null;
};

export default SuggestReloadIfVersionChanged;
