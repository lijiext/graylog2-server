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

import { Col, Panel, Row, Tab, Tabs } from 'components/bootstrap';

import TemplatesHelper from './TemplatesHelper';
import ConfigurationVariablesHelper from './ConfigurationVariablesHelper';
import ConfigurationHelperStyle from './ConfigurationHelper.css';

class ConfigurationHelper extends React.Component {
  static propTypes = {
    onVariableRename: PropTypes.func.isRequired,
  };

  _getId = (idName, index) => {
    const idIndex = index !== undefined ? `. ${index}` : '';

    return idName + idIndex;
  };

  render() {
    const { onVariableRename } = this.props;

    return (

      <Panel header="采集器配置参考">

        <Row className="row-sm">
          <Col md={12}>
            <Tabs id="configurationsHelper" defaultActiveKey={1} animation={false}>
              <Tab eventKey={1} title="运行时变量">
                <p className={ConfigurationHelperStyle.marginQuickReferenceText}>
                  这些变量将填充来自每个 Sidecar 的运行时信息
                </p>
                <TemplatesHelper />
              </Tab>
              <Tab eventKey={2} title="变量">
                <p className={ConfigurationHelperStyle.marginQuickReferenceText}>
                  使用变量在多个配置中共享文本片段。
                  <br />
                  如果您的配置格式需要使用字面量，例如 <code>$&#123;foo&#125;</code>,
                  which shall not act as a variable, you will have to write it as
                  <code>$&#123;&apos;$&apos;&#125;&#123;foo&#125;</code>.
                </p>
                <ConfigurationVariablesHelper onVariableRename={onVariableRename} />
              </Tab>
              <Tab eventKey={3} title="参考">
                <Row className="row-sm">
                  <Col md={12}>
                    <p className={ConfigurationHelperStyle.marginQuickReferenceText}>
                      我们提供采集器配置模板，助您快速入门。<br />
                      有关更多信息，请参阅您采集器的官方文档。
                    </p>
                    <ul className={ConfigurationHelperStyle.ulStyle}>
                      <li><a href="https://www.elastic.co/guide/en/beats/filebeat/current/index.html" target="_blank" rel="noopener noreferrer">Filebeat 参考</a> </li>
                      <li><a href="https://www.elastic.co/guide/en/beats/winlogbeat/current/index.html" target="_blank" rel="noopener noreferrer">Winlogbeat 参考</a> </li>
                      <li><a href="https://nxlog.co/docs/nxlog-ce/nxlog-reference-manual.html" target="_blank" rel="noopener noreferrer">NXLog 参考手册</a> </li>
                    </ul>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Panel>
    );
  }
}

export default ConfigurationHelper;
