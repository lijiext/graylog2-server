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

import { Row, Col, Modal, BootstrapModalWrapper } from 'components/bootstrap';
import SortableList from 'components/common/SortableList';
import { ExtractorsActions } from 'stores/extractors/ExtractorsStore';
import { ModalSubmit } from 'components/common/index';

class ExtractorSortModal extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    extractors: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    onSort: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      sortedExtractors: props.extractors,
    };
  }

  _cancel = () => {
    const { extractors, onClose } = this.props;

    onClose();

    this.setState({
      sortedExtractors: extractors,
    });
  };

  _updateSorting = (newSorting) => {
    this.setState({
      sortedExtractors: newSorting,
    });
  };

  _saveSorting = async () => {
    const { input, onClose, onSort } = this.props;
    const { sortedExtractors } = this.state;

    if (!sortedExtractors) {
      onClose();
    }

    await ExtractorsActions.order.triggerPromise(input.id, sortedExtractors);

    onSort();
    onClose();
  };

  render() {
    const { sortedExtractors } = this.state;
    const { input } = this.props;

    return (
      <BootstrapModalWrapper showModal
                             onHide={this._cancel}>
        <Modal.Header closeButton>
          <Modal.Title>
            <span>排序提取器 <em>{input.title}</em></span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>拖放列表中的提取器以更改其应用顺序。</p>
          <Row className="row-sm">
            <Col md={12}>
              <SortableList items={sortedExtractors} onMoveItem={this._updateSorting} displayOverlayInPortal />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <ModalSubmit onCancel={this._cancel} onSubmit={this._saveSorting} submitButtonText="更新排序" />
        </Modal.Footer>
      </BootstrapModalWrapper>
    );
  }
}

export default ExtractorSortModal;
