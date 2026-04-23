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
import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';

import { Section } from 'components/common';
import StatusColorIndicator from 'components/common/StatusColorIndicator';
import { ListGroup, ListGroupItem } from 'components/bootstrap';
import usePluginEntities from 'hooks/usePluginEntities';
import useProductName from 'brand-customization/useProductName';
import HelpPopoverButton from 'components/common/HelpPopoverButton';

import { DIAGNOSIS_HELP } from './Constants';

type Props = {
  messageErrors: {
    failures_inputs_codecs: number;
    failures_processing: number;
    failures_indexing: number;
  };
  inputId: string;
};

const StyledListGroup = styled(ListGroup)(
  ({ theme }) => css`
    border: 1px solid ${theme.colors.table.row.divider};
    background-color: ${theme.colors.global.contentBackground};
    border-radius: ${theme.spacings.xs};
  `,
);

const StyledListGroupItem = styled(ListGroupItem)`
  background-color: transparent;
  display: flex;
`;

const StyledTitle = styled.p(
  ({ theme }) => css`
    font-weight: bold;
    margin-bottom: 0;
    margin-right: 1%;
    width: 30%;

    @media (max-width: ${theme.breakpoints.max.md}) {
      width: 40%;
    }
  `,
);

const StyledP = styled.p(
  ({ theme }) => css`
    &&.description {
      color: ${theme.colors.gray[50]};
    }
  `,
);

const Component = ({ children }) => children;
const DiagnosisMessageErrors = ({ messageErrors, inputId }: Props) => {
  const productName = useProductName();
  const hasError = Object.keys(messageErrors).some((error) => messageErrors[error] > 0);
  const inputSetupWizards = usePluginEntities('inputSetupWizard');
  const InputFailureLink = useMemo(
    () => inputSetupWizards?.find((plugin) => !!plugin.InputFailureLink)?.InputFailureLink,
    [inputSetupWizards],
  );
  const LinkCompoment = InputFailureLink || Component;

  return (
    <Section
      preHeaderSection={<StatusColorIndicator radius="50%" bsStyle={hasError ? 'danger' : 'gray'} />}
      headerLeftSection={
        <HelpPopoverButton
          helpText={`输入处的消息错误:
            ${DIAGNOSIS_HELP.MESSAGE_ERROR_AT_INPUT(productName)}

            消息处理失败:
            ${DIAGNOSIS_HELP.MESSAGE_FAILED_TO_PROCESS}

            消息错误:
            ${DIAGNOSIS_HELP.MESSAGE_FAILED_TO_INDEX}
            `}
        />
      }
      title="消息错误">
      <StyledP>
        消息可能在输入端、处理管道或索引到搜索集群时处理失败。点击类别以查看相关消息。
      </StyledP>
      <StyledListGroup>
        <StyledListGroupItem>
          <StyledTitle>
            <LinkCompoment failureType="input" inputId={inputId}>
              输入端消息错误:
            </LinkCompoment>
          </StyledTitle>
          {messageErrors.failures_inputs_codecs}
        </StyledListGroupItem>
        <StyledListGroupItem>
          <StyledTitle>
            <LinkCompoment failureType="processing" inputId={inputId}>
              消息处理失败：
            </LinkCompoment>
          </StyledTitle>
          {messageErrors.failures_processing}
        </StyledListGroupItem>
        <StyledListGroupItem>
          <StyledTitle>
            <LinkCompoment failureType="indexing" inputId={inputId}>
              消息索引失败：
            </LinkCompoment>
          </StyledTitle>
          {messageErrors.failures_indexing}
        </StyledListGroupItem>
      </StyledListGroup>
    </Section>
  );
};

export default DiagnosisMessageErrors;
