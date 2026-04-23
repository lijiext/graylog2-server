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

import { Button, Input } from 'components/bootstrap';
import UserNotification from 'util/UserNotification';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { GrokPatternsStore } from 'stores/grok-patterns/GrokPatternsStore';
import withTelemetry from 'logic/telemetry/withTelemetry';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

type BulkLoadPatternModalProps = {
  onSuccess: (...args: any[]) => void;
  sendTelemetry?: (...args: any[]) => void;
};

class BulkLoadPatternModal extends React.Component<
  BulkLoadPatternModalProps,
  {
    [key: string]: any;
  }
> {
  static defaultProps = {
    sendTelemetry: () => {},
  };

  private patternFile: Input;

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      importStrategy: 'ABORT_ON_CONFLICT',
    };
  }

  _openModal = () => {
    this.setState({ showModal: true });
  };

  _closeModal = () => {
    this.setState({ importStrategy: 'ABORT_ON_CONFLICT', showModal: false });
  };

  _onSubmit = (evt) => {
    evt.preventDefault();

    const reader = new FileReader();
    const { importStrategy } = this.state;
    const { onSuccess } = this.props;

    reader.onload = (loaded) => {
      const request = loaded.target.result;

      GrokPatternsStore.bulkImport(request, importStrategy).then(() => {
        UserNotification.success('Grok 模式导入成功', '成功！');
        this._closeModal();

        this.props.sendTelemetry(TELEMETRY_EVENT_TYPE.GROK_PATTERN.IMPORTED, {
          app_pathname: 'grokpatterns',
          app_section: 'grokpatterns',
        });

        onSuccess();
      });
    };

    reader.readAsText(this.patternFile.getInputDOMNode().files[0]);
  };

  _onImportStrategyChange = (event) => this.setState({ importStrategy: event.target.value });

  render() {
    return (
      <span>
        <Button bsStyle="info" style={{ marginRight: 5 }} onClick={this._openModal}>
          导入模式文件
        </Button>

        <BootstrapModalForm
          show={this.state.showModal}
          title="从文件导入 Grok 模式"
          submitButtonText="上传"
          onCancel={this._closeModal}
          onSubmitForm={this._onSubmit}>
          <Input
            id="pattern-file"
            type="file"
            ref={(patternFile) => {
              this.patternFile = patternFile;
            }}
            name="patterns"
            label="模式文件"
            help="包含 Grok 模式的文件，每行一个。名称和模式之间应以空白字符分隔。"
            required
          />
          <Input
            id="abort-on-conflicting-patterns-radio"
            type="radio"
            name="import-strategy"
            value="ABORT_ON_CONFLICT"
            label="如果已存在同名模式，则中止导入"
            defaultChecked
            onChange={(e) => this._onImportStrategyChange(e)}
          />
          <Input
            id="replace-conflicting-patterns-radio"
            type="radio"
            name="import-strategy"
            value="REPLACE_ON_CONFLICT"
            label="用相同名称替换现有模式"
            onChange={(e) => this._onImportStrategyChange(e)}
          />
          <Input
            id="drop-existing-patterns-radio"
            type="radio"
            name="import-strategy"
            value="DROP_ALL_EXISTING"
            label="导入前删除所有现有模式"
            onChange={(e) => this._onImportStrategyChange(e)}
          />
        </BootstrapModalForm>
      </span>
    );
  }
}

export default withTelemetry(BulkLoadPatternModal);
