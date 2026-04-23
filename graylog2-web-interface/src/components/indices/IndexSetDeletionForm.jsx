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

import { defaultCompare as naturalSort } from 'logic/DefaultCompare';
import { Spinner } from 'components/common';
import { Alert, Row, Col, Input } from 'components/bootstrap';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { StreamsStore } from 'stores/streams/StreamsStore';

class IndexSetDeletionForm extends React.Component {
  static propTypes = {
    indexSet: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      assignedStreams: undefined,
      deleteIndices: true,
    };
  }

  _onModalOpen = () => {
    StreamsStore.load((streams) => {
      const assignedStreams = [];

      streams.forEach((stream) => {
        if (stream.index_set_id === this.props.indexSet.id) {
          assignedStreams.push({ id: stream.id, title: stream.title });
        }
      });

      this.setState({ assignedStreams: assignedStreams });
    });
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  open = () => {
    this.setState({ showModal: true }, this._onModalOpen);
  };

  close = () => {
    this.setState({ showModal: false });
  };

  _onRemoveClick = (e) => {
    this.setState({ deleteIndices: e.target.checked });
  };

  _isLoading = () => !this.state.assignedStreams;

  _isDeletable = () => !this._isLoading() && this.state.assignedStreams.length < 1 && !this.props.indexSet.default;

  _modalContent = () => {
    if (this._isLoading()) {
      return <Spinner text="Loading assigned streams..." />;
    }

    if (this.props.indexSet.default) {
      return (
        <Row>
          <Col md={12}>
            <Alert bsStyle="danger">
              无法删除索引集，因为它是默认索引集！
            </Alert>
          </Col>
        </Row>
      );
    }

    if (!this._isDeletable()) {
      const assignedStreams = this.state.assignedStreams
        .sort((s1, s2) => naturalSort(s1.title, s2.title))
        .map((stream) => <li key={`stream-id-${stream.id}`}>{stream.title}</li>);

      return (
        <div>
          <Row>
            <Col md={12}>
              <Alert bsStyle="danger">
                无法删除索引集，因为它已分配数据流。请移除数据流分配以删除此索引集。
              </Alert>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h4>已分配数据流:</h4>
              <ul>
                {assignedStreams}
              </ul>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <Row>
        <Col md={12}>
          <Input id="remove-data-checkbox"
                 type="checkbox"
                 label="删除此索引集的所有数据？"
                 help={<span>与此索引集相关的所有索引都将从 Elasticsearch 中删除。</span>}
                 checked={this.state.deleteIndices}
                 onChange={this._onRemoveClick} />
        </Col>
      </Row>
    );
  };

  _onDelete = (e) => {
    e.preventDefault();

    if (this._isDeletable()) {
      this.props.onDelete(this.props.indexSet, this.state.deleteIndices);
      this.close();
    }
  };

  render() {
    return (
      <BootstrapModalForm show={this.state.showModal}
                          title={`删除索引集 "${this.props.indexSet.title}"？`}
                          data-telemetry-title="Delete index set"
                          onCancel={this.close}
                          onSubmitForm={this._onDelete}
                          submitButtonText="删除"
                          submitButtonDisabled={!this._isDeletable()}>
        {this._modalContent()}
      </BootstrapModalForm>
    );
  }
}

export default IndexSetDeletionForm;
