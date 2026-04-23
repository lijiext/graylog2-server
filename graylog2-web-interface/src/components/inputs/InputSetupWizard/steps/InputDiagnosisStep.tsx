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

import { Button, Row } from 'components/bootstrap';
import Routes from 'routing/Routes';
import useInputSetupWizard from 'components/inputs/InputSetupWizard/hooks/useInputSetupWizard';

import { StepWrapper, DescriptionCol, ButtonCol } from './components/StepWrapper';

type Props = {
  onClose: () => void;
};

const InputDiagnosisStep = ({ onClose }: Props) => {
  const {
    wizardData: { input },
  } = useInputSetupWizard();

  return (
    <StepWrapper>
      <Row>
        <DescriptionCol md={12}>
          <p>测试输入和解析，无需向搜索集群写入任何数据。</p>
        </DescriptionCol>
      </Row>
      {input?.id && (
        <Button
          bsSize="xs"
          bsStyle="primary"
          onClick={() => window.open(Routes.SYSTEM.INPUT_DIAGNOSIS(input?.id), '_blank')}>
          前往输入端诊断
        </Button>
      )}
      <Row>
        <ButtonCol md={12}>
          <Button onClick={onClose}>完成</Button>
        </ButtonCol>
      </Row>
    </StepWrapper>
  );
};

export default InputDiagnosisStep;
