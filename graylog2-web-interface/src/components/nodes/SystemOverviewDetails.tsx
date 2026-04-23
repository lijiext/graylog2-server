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

import { Row, Col, Alert, Button } from 'components/bootstrap';
import { IfPermitted, Icon } from 'components/common';
import { DocumentationLink } from 'components/support';
import NodeThroughput from 'components/throughput/NodeThroughput';
import DocsHelper from 'util/DocsHelper';
import StringUtils from 'util/StringUtils';
import { SystemProcessingStore } from 'stores/system-processing/SystemProcessingStore';

type SystemOverviewDetailsProps = {
  node: any;
  information: any;
};

class SystemOverviewDetails extends React.Component<
  SystemOverviewDetailsProps,
  {
    [key: string]: any;
  }
> {
  _toggleMessageProcessing = () => {
    if (
      confirm(
        `您即将在此节点中 ${this.props.information.is_processing ? 'pause' : 'resume'} 消息处理。确定吗？`,
      )
    ) {
      if (this.props.information.is_processing) {
        SystemProcessingStore.pause(this.props.node.node_id);
      } else {
        SystemProcessingStore.resume(this.props.node.node_id);
      }
    }
  };

  render() {
    const { information } = this.props;
    const lbStatus = information.lb_status.toUpperCase();
    let processingStatus;

    if (information.is_processing) {
      processingStatus = (
        <span>
          <Icon name="info" />
          &nbsp; <NodeThroughput nodeId={this.props.node.node_id} longFormat />
        </span>
      );
    } else {
      processingStatus = (
        <span>
          <Icon name="warning" />
            节点是 <strong>not</strong> 处理消息
        </span>
      );
    }

    return (
      <Row>
        <Col md={4}>
          <Alert bsStyle="info">
            <span className="pull-right">
              {' '}
              <DocumentationLink page={DocsHelper.PAGES.LOAD_BALANCERS} text="What does this mean?" />
            </span>
            生命周期状态: <strong>{StringUtils.capitalizeFirstLetter(this.props.information.lifecycle)}</strong>
          </Alert>
        </Col>
        <Col md={4}>
          <Alert bsStyle={lbStatus === 'ALIVE' ? 'success' : 'danger'}>
            <span className="pull-right">
              {' '}
              <DocumentationLink page={DocsHelper.PAGES.LOAD_BALANCERS} text="What does this mean?" />
            </span>
            标记为 <strong>{lbStatus}</strong> 用于负载均衡器
          </Alert>
        </Col>
        <Col md={4}>
          <Alert bsStyle={information.is_processing ? 'success' : 'danger'}>
            <IfPermitted permissions="processing:changestate">
              <span className="pull-right">
                <Button
                  onClick={this._toggleMessageProcessing}
                  bsSize="xsmall"
                  bsStyle={information.is_processing ? 'danger' : 'success'}>
                  {information.is_processing ? 'Pause' : 'Resume'} processing
                </Button>
              </span>
            </IfPermitted>
            {processingStatus}
          </Alert>
        </Col>
      </Row>
    );
  }
}

export default SystemOverviewDetails;
