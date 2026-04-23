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

import { Row, Col, Button, Input } from 'components/bootstrap';
import UserNotification from 'util/UserNotification';
import { ExtractorsActions } from 'stores/extractors/ExtractorsStore';

class ImportExtractors extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
  };

  _onSubmit = (event) => {
    event.preventDefault();

    try {
      const parsedExtractors = JSON.parse(this.extractorsInput.getValue());
      const { extractors } = parsedExtractors;

      ExtractorsActions.import(this.props.input.id, extractors);
    } catch (error) {
      UserNotification.error(`解析提取器时出错。它们是否为 JSON 格式？${error}`,
        '无法导入提取器');
    }
  };

  render() {
    return (
      <Row className="content">
        <Col md={12}>
          <Row>
            <Col md={12}>
              <h2>提取器 JSON</h2>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <form onSubmit={this._onSubmit}>
                <Input type="textarea" ref={(extractorsInput) => { this.extractorsInput = extractorsInput; }} id="extractor-export-textarea" rows={30} />
                <Button type="submit" bsStyle="success">向输入端添加提取器</Button>
              </form>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default ImportExtractors;
