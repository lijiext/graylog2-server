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
import PropTypes from 'prop-types';
import React from 'react';
import { PluginStore } from 'graylog-web-plugin/plugin';

import { LinkContainer } from 'components/common/router';
import { Row, Col, Button } from 'components/bootstrap';
import Routes from 'routing/Routes';
import HideOnCloud from 'util/conditional/HideOnCloud';
import BufferUsage from 'components/nodes/BufferUsage';
import SystemOverviewDetails from 'components/nodes/SystemOverviewDetails';
import JvmHeapUsage from 'components/nodes/JvmHeapUsage';
import JournalDetails from 'components/nodes/JournalDetails';
import SystemInformation from 'components/nodes/SystemInformation';
import RestApiOverview from 'components/nodes/RestApiOverview';
import PluginsDataTable from 'components/nodes/PluginsDataTable';
import InputTypesDataTable from 'components/nodes/InputTypesDataTable';
import type { NodeInfo } from 'stores/nodes/NodesStore';
import type { Plugin } from 'stores/system/SystemPluginsStore';
import type { Input } from 'components/messageloaders/Types';
import type { InputDescription } from 'stores/inputs/InputTypesStore';

type InputState = {
  detailed_message:string,
  id:string,
  message_input:Input
  started_at:string,
  state:string,
};
type Memory = {
  bytes: number
  kilobytes: number
  megabytes: number
}

type JvmInformation = {
  free_memory: Memory
  max_memory: Memory
  total_memory:Memory
  used_memory: Memory
  node_id: string
  pid: string
  info: string
}

type ClusterOverview = {
  facility: string
  codename: string
  node_id: string
  cluster_id: string
  version: string
  started_at: string
  hostname: string
  lifecycle: string
  lb_status: string
  timezone: string
  operating_system: string
  is_processing: boolean
  is_leader: boolean
}

type Props = {
  node: NodeInfo,
  plugins: Array<Plugin>,
  inputStates: Array<InputState>,
  inputDescriptions: Array<InputDescription>,
  jvmInformation: JvmInformation,
  systemOverview: ClusterOverview,
}

const NodeOverview = ({ node, plugins, inputStates, inputDescriptions, jvmInformation, systemOverview }: Props) => {
  const DataWareHouseJournal = PluginStore.exports('dataWarehouse')?.[0]?.DataWarehouseJournal;
  const pluginCount = `${plugins?.length || 0} plugins installed`;

  const runningInputs = inputStates?.filter((inputState) => inputState.state.toUpperCase() === 'RUNNING');

  const inputCount = `${runningInputs?.length || 0} inputs running on this node`;

  return (
    <div>
      <Row className="content">
        <Col md={12}>
          <SystemOverviewDetails node={node} information={systemOverview} />
        </Col>
      </Row>

      <Row className="content">
        <Col md={12}>
          <h2 style={{ marginBottom: 5 }}>内存/堆使用率</h2>
          <JvmHeapUsage nodeId={node.node_id} />
        </Col>
      </Row>

      <Row className="content">
        <Col md={12}>
          <h2>缓冲区</h2>
          <p className="description">
            缓冲区用于在消息经过不同处理器时，短时间（通常为毫秒级）缓存少量消息。
          </p>
          <Row>
            <Col md={4}>
              <BufferUsage nodeId={node.node_id} title="输入缓冲区" bufferType="input" />
            </Col>
            <Col md={4}>
              <BufferUsage nodeId={node.node_id} title="处理缓冲区" bufferType="process" />
            </Col>
            <Col md={4}>
              <BufferUsage nodeId={node.node_id} title="输出缓冲区" bufferType="output" />
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="content">
        <Col md={12}>
          <h2>磁盘日志</h2>
          <p className="description">
            传入的消息会写入磁盘日志，以确保在服务器故障时数据不会丢失。日志还能在输出端处理速度跟不上消息速率或传入消息出现峰值时，帮助 Graylog 保持正常运行。这样可以确保 Graylog 不会将所有消息缓冲在主内存中，从而避免过长的垃圾回收暂停。
          </p>
          <JournalDetails nodeId={node.node_id} />
        </Col>
      </Row>
      {DataWareHouseJournal && <DataWareHouseJournal nodeId={node.node_id} />}
      <Row className="content">
        <Col md={6}>
          <h2>系统</h2>
          <SystemInformation node={node} systemInformation={systemOverview} jvmInformation={jvmInformation} />
        </Col>
        <Col md={6}>
          <h2>REST API</h2>
          <RestApiOverview node={node} />
        </Col>
      </Row>

      <Row className="content">
        <Col md={12}>
          <h2>已安装的插件 <small>{pluginCount}</small></h2>
          <PluginsDataTable plugins={plugins} />
        </Col>
      </Row>

      <Row className="content">
        <Col md={12}>
          <HideOnCloud>
            <span className="pull-right">
              <LinkContainer to={Routes.node_inputs(node.node_id)}>
                <Button bsStyle="success" bsSize="small">管理输入端</Button>
              </LinkContainer>
            </span>
          </HideOnCloud>
          <h2 style={{ marginBottom: 15 }}>可用输入端类型 <small>{inputCount}</small></h2>
          <InputTypesDataTable inputDescriptions={inputDescriptions} />
        </Col>
      </Row>
    </div>
  );
};

NodeOverview.propTypes = {
  node: PropTypes.object.isRequired,
  systemOverview: PropTypes.object.isRequired,
  jvmInformation: PropTypes.object,
  plugins: PropTypes.array,
  inputDescriptions: PropTypes.object,
  inputStates: PropTypes.array,
};

NodeOverview.defaultProps = {
  jvmInformation: undefined,
  plugins: undefined,
  inputDescriptions: undefined,
  inputStates: undefined,
};

export default NodeOverview;
