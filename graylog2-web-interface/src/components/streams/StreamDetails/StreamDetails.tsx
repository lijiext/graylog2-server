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
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';
import { PluginStore } from 'graylog-web-plugin/plugin';
import URI from 'urijs';
import upperCase from 'lodash/upperCase';

import Routes from 'routing/Routes';
import {
  Button,
  Col,
  DropdownButton,
  MenuItem,
  Row,
  SegmentedControl,
} from 'components/bootstrap';
import UserNotification from 'util/UserNotification';
import { Icon, IfPermitted } from 'components/common';
import { StreamsStore, type Stream } from 'stores/streams/StreamsStore';
import { useStore } from 'stores/connect';
import { IndexSetsActions, IndexSetsStore } from 'stores/indices/IndexSetsStore';
import useHistory from 'routing/useHistory';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useQuery from 'routing/useQuery';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

import StreamDataRoutingIntake from './StreamDataRoutingIntake';
import StreamDataRoutingProcessing from './StreamDataRoutingProcessing';
import StreamDataRoutingDestinations from './StreamDataRoutingDestinations';

import StreamModal from '../StreamModal';
import ThroughputCell from '../StreamsOverview/cells/ThroughputCell';

type Props = {
  stream: Stream,
};

const INTAKE_SEGMENT = 'intake';
const PROCESSING_SEGMENT = 'processing';
const DESTINATIONS_SEGMENT = 'destinations';
const INTAKE_DESCRIPTION = '数据流规则可用于直接从输入端收集过滤后的消息子集以发送至此数据流。请注意，数据流规则现已成为遗留功能，管理数据流路由的推荐设备现在是管道规则。';
const PROCESSING_DESCRIPTION = '处理管道允许您转换和处理来自数据流的消息。处理管道由阶段组成，在阶段中评估并应用规则。消息可以经过一个或多个阶段。';
const DESTINATION_DESCRIPTION = '“目标”页面允许您定义此数据流中的消息应路由至何处。一个数据流可以有多个目标。请注意，仅路由到数据仓库的消息不计入许可证使用量，除非随后被检索。在单个目标基础上，可应用过滤器以限制该目标接收的消息子集。';

const SEGMENTS_DETAILS = [
  {
    value: 'intake' as const,
    label: '1: 采集',
  },
  {
    value: 'processing' as const,
    label: '2: 处理中',
  },
  {
    value: 'destinations' as const,
    label: '3: 目标',
  },
];

type DetailsSegment = 'intake' | 'processing' | 'destinations';

const Container = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 30px;
  margin-bottom: 20px;
  gap: 15px;
  margin-left: -15px;
  margin-right: -15px;
`;

const LeftCol = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const RightCol = styled.div`
  display: flex;
  gap: 30px;
`;

const MainDetailsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const SegmentContainer = styled(Row)`
  flex: 1;
`;

const FullHeightCol = styled(Col)`
  height: 100%;
`;

const StyledSectionGrid = styled.div(({ theme }) => css`
  display: flex;
  align-items: center;
  align-content: center;
  gap: ${theme.spacings.md};
`);
const StyledSegmentedControl = styled(SegmentedControl)(({ theme }) => css`
  background-color: ${theme.colors.section.filled.background};
  border: 1px solid ${theme.colors.section.filled.border};

  .mantine-SegmentedControl-innerLabel {
    vertical-align: middle;
  }

  .mantine-SegmentedControl-indicator {
    height: 70% !important;
  }
`);
const ThroughputCol = styled(Col)`
  display: flex;
  align-items: center;
  height: 100%;
  flex-flow: column wrap;
  place-content: flex-end space-evenly;
`;

const getPageDescription = (segment: DetailsSegment) => (
  <span>
    {segment === INTAKE_SEGMENT && INTAKE_DESCRIPTION}
    {segment === PROCESSING_SEGMENT && PROCESSING_DESCRIPTION}
    {segment === DESTINATIONS_SEGMENT && DESTINATION_DESCRIPTION}
  </span>
);

const StreamDetails = ({ stream }: Props) => {
  const navigate = useNavigate();
  const { segment } = useQuery();
  const [currentSegment, setCurrentSegment] = useState<DetailsSegment>(segment as DetailsSegment || INTAKE_SEGMENT);
  const DataWarehouseJobComponent = PluginStore.exports('dataWarehouse')?.[0]?.DataWarehouseJobs;
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { indexSets } = useStore(IndexSetsStore);
  const queryClient = useQueryClient();
  const history = useHistory();
  const sendTelemetry = useSendTelemetry();

  const updateURLStepQueryParam = (nextSegment: DetailsSegment) => {
    const newUrl = new URI(window.location.href).removeSearch('segment').addQuery('segment', nextSegment);
    history.replace(newUrl.resource());
  };

  const onSegmentChange = (nextSegment: DetailsSegment) => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.STREAMS[`STREAM_ITEM_DATA_ROUTING_${upperCase(nextSegment)}_OPENED`], {
      app_pathname: 'streams',
    });

    setCurrentSegment(nextSegment);
    updateURLStepQueryParam(nextSegment);
  };

  useEffect(() => {
    IndexSetsActions.list(false);
  }, []);

  const toggleUpdateModal = useCallback(() => {
    setShowUpdateModal((cur) => !cur);

    sendTelemetry(TELEMETRY_EVENT_TYPE.STREAMS.STREAM_ITEM_DATA_ROUTING_UPDATE_CLICKED, {
      app_pathname: 'streams',
    });
  }, [sendTelemetry]);
  const onUpdate = useCallback((newStream: Stream) => StreamsStore.update(stream.id, newStream, (response) => {
    UserNotification.success(`数据流 '${newStream.title}' 已成功更新。`, '成功');
    queryClient.invalidateQueries(['stream', stream.id]);

    return response;
  }), [stream.id, queryClient]);

  return (
    <>
      {DataWarehouseJobComponent && <DataWarehouseJobComponent streamId={stream.id} />}
      <Container>
        <Header>
          <LeftCol>
            <Button onClick={() => navigate(Routes.STREAMS)}>
              <Icon name="arrow_left_alt" size="sm" /> 返回
            </Button>

            <h1>流： {stream.title}</h1>

            <IfPermitted permissions="stream:edit">
              <DropdownButton title={<Icon name="more_horiz" />} id="stream-actions" noCaret bsSize="xs">
                <MenuItem onClick={() => toggleUpdateModal()}>编辑</MenuItem>
              </DropdownButton>
            </IfPermitted>
          </LeftCol>
          <RightCol />
        </Header>

        <Row className="content no-bm">
          <Col xs={10}>
            <StyledSectionGrid>
              <h3>数据路由</h3>
              <MainDetailsRow>
                <StyledSegmentedControl<DetailsSegment> data={SEGMENTS_DETAILS}
                                                        radius="sm"
                                                        value={currentSegment}
                                                        onChange={onSegmentChange} />
              </MainDetailsRow>
            </StyledSectionGrid>
            <p className="description">{getPageDescription(currentSegment)}</p>
          </Col>
          <ThroughputCol xs={2}>
            <strong>吞吐量</strong>
            <ThroughputCell stream={stream} />
          </ThroughputCol>
        </Row>
        <SegmentContainer className="content">
          <FullHeightCol xs={12}>
            {currentSegment === INTAKE_SEGMENT && <StreamDataRoutingIntake stream={stream} />}
            {currentSegment === PROCESSING_SEGMENT && <StreamDataRoutingProcessing stream={stream} />}
            {currentSegment === DESTINATIONS_SEGMENT && <StreamDataRoutingDestinations stream={stream} />}
          </FullHeightCol>
        </SegmentContainer>
        {showUpdateModal && (
        <StreamModal title="正在编辑数据流"
                     onSubmit={onUpdate}
                     onClose={toggleUpdateModal}
                     submitButtonText="更新数据流"
                     submitLoadingText="正在更新数据流..."
                     initialValues={stream}
                     indexSets={indexSets} />
        )}

      </Container>
    </>
  );
};

export default StreamDetails;
