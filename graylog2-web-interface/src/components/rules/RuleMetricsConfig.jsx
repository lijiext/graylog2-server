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
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';

import { Spinner } from 'components/common';
import { Alert, BootstrapModalForm, Input } from 'components/bootstrap';
import * as FormsUtils from 'util/FormsUtils';

export default class RuleMetricsConfig extends React.Component {
  static propTypes = {
    config: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    config: undefined,
    onClose: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      nextConfig: props.config,
    };
  }

  saveConfiguration = () => {
    const { onChange } = this.props;
    const { nextConfig } = this.state;

    onChange(nextConfig).then(this.closeModal);
  };

  closeModal = () => {
    this.props.onClose();
  };

  propagateChange = (key, value) => {
    const { config } = this.props;
    const nextConfig = cloneDeep(config);

    nextConfig[key] = value;
    this.setState({ nextConfig });
  };

  handleChange = (event) => {
    const { name } = event.target;

    this.propagateChange(name, FormsUtils.getValueFromInput(event.target));
  };

  render() {
    const { config } = this.props;
    const { nextConfig } = this.state;

    if (!config) {
      return <p><Spinner text="Loading metrics config..." /></p>;
    }

    return (
      <BootstrapModalForm show
                          title="规则指标配置"
                          onSubmitForm={this.saveConfiguration}
                          onCancel={this.closeModal}
                          submitButtonText="更新配置">
        <Alert bsStyle="warning">
          仅当调试性能问题时才应启用规则指标，因为收集指标会降低消息处理速度并增加内存使用量。
        </Alert>
        <fieldset>
          <Input type="radio"
                 id="metrics-enabled"
                 name="metrics_enabled"
                 value="true"
                 label="启用规则指标"
                 onChange={this.handleChange}
                 checked={nextConfig.metrics_enabled} />

          <Input type="radio"
                 id="metrics-disabled"
                 name="metrics_enabled"
                 value="false"
                 label="禁用规则指标"
                 onChange={this.handleChange}
                 checked={!nextConfig.metrics_enabled} />
        </fieldset>
        <p>
          启用后，系统指标将为每条规则的执行更新两个计时器。
        </p>
        <strong>规则评估计时器</strong>
        <p>
          此计时器用于测量规则条件的持续时间。（所有内容均在 <code>when</code> 语句)
        </p>
        <p>
          示例指标名称，包含规则 ID 占位符：<br />
          <code>org.graylog.plugins.pipelineprocessor.ast.Rule.[rule-id].trace.evaluate.duration</code><br />
          示例指标名称，包含规则 ID、管道 ID 和阶段号占位符：<br />
          <code>org.graylog.plugins.pipelineprocessor.ast.Rule.[rule-id].[pipeline-id].[stage-num].trace.evaluate.duration</code>
        </p>
        <strong>规则执行计时器</strong>
        <p>
          该计时器用于测量规则执行的持续时间。（所有内容均在 <code>then</code> 语句)
        </p>
        <p>
          示例指标名称，包含规则 ID 占位符：<br />
          <code>org.graylog.plugins.pipelineprocessor.ast.Rule.[rule-id].trace.execute.duration</code><br />
          示例指标名称，包含规则 ID、管道 ID 和阶段号占位符：<br />
          <code>org.graylog.plugins.pipelineprocessor.ast.Rule.[rule-id].[pipeline-id].[stage-num].trace.execute.duration</code>
        </p>
      </BootstrapModalForm>
    );
  }
}
