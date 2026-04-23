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
import capitalize from 'lodash/capitalize';
import { useNavigate } from 'react-router-dom';

import { Icon, LinkToNode, Section } from 'components/common';
import useParams from 'routing/useParams';
import { Alert, Button, ListGroup, ListGroupItem } from 'components/bootstrap';
import type {
  StreamMessageCount,
  InputNodeStateInfo,
  InputNodeStates,
} from 'components/inputs/InputDiagnosis/useInputDiagnosis';
import useInputDiagnosis from 'components/inputs/InputDiagnosis/useInputDiagnosis';
import ShowReceivedMessagesButton from 'components/inputs/InputDiagnosis/ShowReceivedMessagesButton';
import NetworkStats from 'components/inputs/InputDiagnosis/NetworkStats';
import Routes from 'routing/Routes';
import { Link } from 'components/common/router';
import type { InputState } from 'stores/inputs/InputStatesStore';
import SectionGrid from 'components/common/Section/SectionGrid';
import StatusColorIndicator from 'components/common/StatusColorIndicator';
import DiagnosisMessageErrors from 'components/inputs/InputDiagnosis/DiagnosisMessageErrors';
import { DIAGNOSIS_HELP } from 'components/inputs/InputDiagnosis/Constants';
import useProductName from 'brand-customization/useProductName';
import HelpPopoverButton from 'components/common/HelpPopoverButton';

const LeftCol = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    place-content: center center;

    > p {
      color: ${theme.colors.gray[50]};
    }
  `,
);

const Header = styled.div(
  ({ theme }) => css`
    display: flex;
    padding-top: ${theme.spacings.sm};
    margin-bottom: ${theme.spacings.md};
    gap: ${theme.spacings.sm};
    margin-left: -15px;
    margin-right: -15px;
    align-items: center;
  `,
);

const StyledP = styled.p(
  ({ theme }) => css`
    &&.description {
      color: ${theme.colors.gray[50]};
    }
  `,
);

const StyledSectionGrid = styled(SectionGrid)<{ $rows?: string }>(
  ({ $rows, theme }) => css`
    grid-template-rows: ${$rows || '1fr'};
    gap: ${theme.spacings.xs};
  `,
);

const InputMessage = styled.p(
  ({ theme }) => css`
    max-width: 69%;
    margin-bottom: 0;
    white-space: break-spaces;
    display: flex;

    @media (max-width: ${theme.breakpoints.max.md}) {
      max-width: 59%;
    }
  `,
);

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

const StyledTitleLink = styled(Link)(
  ({ theme }) => css`
    font-weight: bold;
    margin-right: 3%;
    width: 30%;

    @media (max-width: ${theme.breakpoints.max.md}) {
      width: 40%;
    }
  `,
);

const StyledSpan = styled.span`
  padding-left: ${({ theme }) => theme.spacings.xs};
`;

const TroubleshootingContainer = styled.div`
  max-height: 400px;
  overflow-y: scroll;
`;

export const StyledList = styled.ul(
  ({ theme }) => css`
    list-style-type: disc;
    padding-left: 20px;

    li {
      margin-bottom: ${theme.spacings.xs};
    }

    ul {
      margin-top: ${theme.spacings.xs};
    }
  `,
);

const NodeListItem = ({
  detailedMessage,
  nodeId,
}: {
  detailedMessage: InputNodeStateInfo['detailed_message'];
  nodeId: InputNodeStateInfo['node_id'];
}) => {
  if (!detailedMessage && !nodeId) return null;

  if (nodeId) {
    return (
      <StyledListGroupItem>
        <StyledTitle>节点 ID:</StyledTitle> <Link to={Routes.SYSTEM.CLUSTER.NODE_SHOW(nodeId)}>{nodeId}</Link>
        {detailedMessage && (
          <>
            <StyledTitle>消息:</StyledTitle>
            <InputMessage>{detailedMessage}</InputMessage>
          </>
        )}
      </StyledListGroupItem>
    );
  }

  return (
    <StyledListGroupItem key={detailedMessage}>
      {detailedMessage && (
        <>
          <StyledTitle>消息:</StyledTitle>
          <InputMessage>{detailedMessage}</InputMessage>
        </>
      )}
    </StyledListGroupItem>
  );
};

const StateListItem = ({ inputNodeStates, state }: { inputNodeStates: InputNodeStates; state: InputState }) => {
  const showNodesList = (nodeState) => {
    const statesWithShowableInfos = inputNodeStates.states[nodeState].filter(
      (stateInfo: InputNodeStateInfo) => stateInfo.detailed_message || stateInfo.node_id,
    );

    return statesWithShowableInfos.length > 0;
  };

  if (showNodesList(state)) {
    return (
      <>
        <StyledListGroupItem>
          <StyledTitle>{capitalize(state)}:</StyledTitle>
          {inputNodeStates.states[state].length}/{inputNodeStates.total} nodes
        </StyledListGroupItem>
        {inputNodeStates.states[state].map(({ detailed_message, node_id }) => (
          <NodeListItem key={node_id} detailedMessage={detailed_message} nodeId={node_id} />
        ))}
      </>
    );
  }

  return (
    <StyledListGroupItem>
      <StyledTitle>{state}:</StyledTitle>
      {inputNodeStates.states[state].length}/{inputNodeStates.total}
    </StyledListGroupItem>
  );
};

const InputDiagnosisPage = () => {
  const { inputId } = useParams();
  const { input, inputNodeStates, inputMetrics } = useInputDiagnosis(inputId);
  const navigate = useNavigate();
  const productName = useProductName();

  const isInputStateDown =
    inputNodeStates.total === 0 ||
    ['FAILED', 'STOPPED', 'FAILING'].some((failedState) => Object.keys(inputNodeStates.states).includes(failedState));
  const hasReceivedMessageMetrics = inputMetrics.incomingMessagesTotal > 0;
  const hasReceivedMessage = inputMetrics.stream_message_count?.some((stream) => stream.count > 0);

  return (
    <>
      <Header>
        <Button onClick={() => navigate(Routes.SYSTEM.INPUTS)}>
          <Icon name="arrow_left_alt" size="sm" /> 返回
        </Button>
        <LeftCol>
          <h1>输入诊断: {input?.name}</h1>

          <p>输入诊断可用于测试输入和解析，而无需向搜索集群写入任何数据。</p>
        </LeftCol>
      </Header>
      {input && (
        <StyledSectionGrid $columns="1fr 1fr" $rows="1fr 1fr">
          <StyledSectionGrid $columns="1fr" $rows="1fr 1fr">
            <Section
              title="信息"
              preHeaderSection={<StatusColorIndicator radius="50%" />}
              headerLeftSection={
                <HelpPopoverButton
                  helpText={`此输入正在监听:
                        ${DIAGNOSIS_HELP.INPUT_LISTENING_ON(productName)}
            
                        此输入正在监听:
                        ${DIAGNOSIS_HELP.INPUT_LISTENING_FOR}
                        `}
                />
              }>
              <StyledP>输入端运行的地址。</StyledP>
              <StyledListGroup>
                <StyledListGroupItem>
                  <StyledTitle>输入标题:</StyledTitle>
                  {input.title}
                </StyledListGroupItem>
                <StyledListGroupItem>
                  <StyledTitle>输入类型:</StyledTitle>
                  {input.name}
                </StyledListGroupItem>
                <StyledListGroupItem>
                  <StyledTitle>此输入端运行于:</StyledTitle>
                  {input.global ? `all ${productName} nodes` : <LinkToNode nodeId={input.node} />}
                </StyledListGroupItem>
                {input.attributes?.bind_address && input.attributes?.port && (
                  <>
                    <StyledListGroupItem>
                      <StyledTitle>此输入端正在监听:</StyledTitle>绑定地址{' '}
                      {input.attributes?.bind_address}，端口 {input.attributes?.port}.
                    </StyledListGroupItem>
                    <StyledListGroupItem>
                      <StyledTitle>此输入端正在监听:</StyledTitle>
                      {'tcp_keepalive' in (input.attributes || {}) ? 'TCP Traffic.' : 'UDP Traffic.'}
                    </StyledListGroupItem>
                  </>
                )}
              </StyledListGroup>
            </Section>
            <Section
              title="状态"
              preHeaderSection={
                <StatusColorIndicator
                  radius="50%"
                  data-testid="state-indicator"
                  bsStyle={isInputStateDown ? 'danger' : 'success'}
                />
              }
              headerLeftSection={<HelpPopoverButton helpText={DIAGNOSIS_HELP.INPUT_STATE} />}>
              <StyledP>
                数量 {productName} 输入端配置的节点数量，以及实际运行的节点数量。如果有任何节点未运行，请点击以查看相关的错误消息。
              </StyledP>
              <StyledListGroup>
                {Object.keys(inputNodeStates.states).map((state: InputState) => (
                  <StateListItem key={state} state={state} inputNodeStates={inputNodeStates} />
                ))}
                {Object.keys(inputNodeStates.states).length === 0 && (
                  <StyledListGroupItem>输入端未运行。</StyledListGroupItem>
                )}
              </StyledListGroup>
            </Section>
          </StyledSectionGrid>
          <Section title="故障排查">
            <TroubleshootingContainer>
              <Alert>
                <p>
                  <strong>如果输入端处于失败状态。</strong>
                </p>
                <StyledList>
                  <li>
                    当一个输入端在一个或多个节点上失败时 {productName} 节点，状态面板的消息字段将显示简短的错误消息；完整长度的错误消息可在 {productName} server.log 文件。
                  </li>
                  <li>
                    配置为使用指定端口的输入端如果该端口是特权端口将会失败（且 {productName}{' '}
                    不是以 root 身份运行)，或已被另一个输入端或应用程序占用。
                  </li>
                  <li>如果无法将输入路由到指定的 IP，则输入将失败。</li>
                  <li>
                    需要互联网连接才能连接到 API 的输入端，如果无法连接互联网或无法路由到该 API，将会失败。
                  </li>
                  <li>如果 TCP 输入端具有无效或过期的证书，则将会失败。</li>
                  <li>
                    连接到外部 API（例如 Microsoft Azure 输入端）的输入端需要在源端进行配置更改以启用 {productName} 用于收集日志。所需步骤将在该输入端对应的文档子页中详细说明。如果连接到外部 API 的输入端配置错误，将会失败，无论错误出现在 {productName} 侧，或（如适用）托管 API 的侧。
                  </li>
                </StyledList>
                <br />
                <p>
                  <strong>如果输入端在所有节点上运行，但消息未到达输入端。</strong>
                </p>
                <StyledList>
                  <li>
                    检查“接收流量”面板中的网络 I/O 字段。如果此处未显示任何流量，则表明存在连接问题。
                    <StyledList>
                      <li>
                        如果未显示任何流量，请首先排查之间的网络连接问题 {productName}{' '}
                        服务器和日志源。这可以通过运行 ping、telnet 或 tracert 命令来实现。
                      </li>
                      <li>
                        对于连接到外部 API 的输入端，请检查 {productName} server.log 文件 - 认证失败（无效的登录或执行 API 操作所需的权限）将在此处完整打印。
                      </li>
                    </StyledList>
                  </li>

                  <li>
                    如果“接收流量”面板中的网络 I/O 字段显示有流量，但未收到任何消息，则表明消息未以适合输入端的格式发送。
                    <StyledList>
                      <li>TCP 输入端无法读取 UDP 流量，反之亦然。</li>
                      <li>
                        内容为空的消息将被丢弃。可通过“已丢弃的空消息”字段进行监控。
                      </li>
                      <li>
                        监听器输入端期望消息以有限的格式范围接收，可能无法读取其他格式的消息。出于故障排查目的，原始文本输入端的要求最为宽松。
                      </li>
                    </StyledList>
                  </li>
                </StyledList>
                <br />
                <p>
                  <strong>
                    如果输入端在所有节点上运行，消息已到达输入端，但部分（或全部）显示为消息错误。
                  </strong>
                </p>
                <StyledList>
                  <li>
                    在已授权的 Enterprise 集群上，可启用故障处理功能，以存储在各阶段（输入、处理和写入搜索集群）出错的日志消息，并记录故障详情——请查看 failure_cause 和 failure_details 字段。导航至消息错误面板，点击消息数量以检查单个失败的日志消息。
                  </li>
                </StyledList>
              </Alert>
            </TroubleshootingContainer>
          </Section>
          <StyledSectionGrid $columns="1fr" $rows="1fr 1fr">
            <Section
              preHeaderSection={
                <StatusColorIndicator radius="50%" bsStyle={hasReceivedMessageMetrics ? 'success' : 'gray'} />
              }
              headerLeftSection={
                <HelpPopoverButton
                  helpText={`丢弃的空消息:
                ${DIAGNOSIS_HELP.EMPTY_MESSAGES_DISCARDED}

                网络 I/O:
                ${DIAGNOSIS_HELP.NETWORK_IO}`}
                />
              }
              title="接收流量">
              <StyledP>
                到达输入端的消息和网络流量。注意：指标仅显示最近 15 分钟的数据。
              </StyledP>
              {inputMetrics && (
                <StyledListGroup>
                  <StyledListGroupItem>
                    <StyledTitle>输入端接收的总消息数:</StyledTitle>
                    {inputMetrics.incomingMessagesTotal} events
                  </StyledListGroupItem>
                  <StyledListGroupItem>
                    <StyledTitle>丢弃的空消息：</StyledTitle>
                    {inputMetrics.emptyMessages}
                  </StyledListGroupItem>
                  {Number.isInteger(inputMetrics.open_connections) &&
                    Number.isInteger(inputMetrics.total_connections) && (
                      <StyledListGroupItem>
                        <StyledTitle>Active Connections:</StyledTitle>
                        {inputMetrics.open_connections}&nbsp; ({inputMetrics.total_connections} 总计)
                      </StyledListGroupItem>
                    )}
                  {Number.isInteger(inputMetrics.read_bytes_1sec) &&
                    Number.isInteger(inputMetrics.read_bytes_total) && (
                      <StyledListGroupItem>
                        <StyledTitle>网络 I/O:</StyledTitle>
                        <NetworkStats
                          readBytes1Sec={inputMetrics.read_bytes_1sec}
                          readBytesTotal={inputMetrics.read_bytes_total}
                          writtenBytes1Sec={inputMetrics.write_bytes_1sec}
                          writtenBytesTotal={inputMetrics.write_bytes_total}
                        />
                      </StyledListGroupItem>
                    )}
                </StyledListGroup>
              )}
            </Section>
            <DiagnosisMessageErrors messageErrors={inputMetrics.message_errors} inputId={inputId} />
          </StyledSectionGrid>
          <Section
            preHeaderSection={<StatusColorIndicator radius="50%" bsStyle={hasReceivedMessage ? 'success' : 'gray'} />}
            title="按数据流统计的接收消息数"
            headerLeftSection={<HelpPopoverButton helpText={DIAGNOSIS_HELP.RECEIVED_MESSAGE_COUNT_BY_STREAM} />}
            actions={<ShowReceivedMessagesButton input={input} />}>
            <StyledP>
              过去 15 分钟内从此输入端成功摄入的消息。点击数据流以检查消息。
            </StyledP>
            {inputMetrics.stream_message_count?.length ? (
              <StyledListGroup>
                {inputMetrics.stream_message_count.map((stream: StreamMessageCount) => (
                  <StyledListGroupItem key={stream.stream_id}>
                    <StyledTitleLink
                      to={Routes.search_with_query(`gl2_source_input:${input.id}`, 'relative', { relative: 900 }, [
                        stream.stream_id,
                      ])}>
                      <strong>{stream.stream_name}:</strong>
                    </StyledTitleLink>
                    <StyledSpan>{stream.count}</StyledSpan>
                  </StyledListGroupItem>
                ))}
              </StyledListGroup>
            ) : (
              <StyledP>
                <em>过去 15 分钟内，此输入端没有消息被路由到数据流。</em>
              </StyledP>
            )}
          </Section>
        </StyledSectionGrid>
      )}
    </>
  );
};

export default InputDiagnosisPage;
