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
import { useEffect, useState } from 'react';

import { Button, Col, Row, Input } from 'components/bootstrap';
import { Icon } from 'components/common';
import UserNotification from 'util/UserNotification';
import ExtractorUtils from 'util/ExtractorUtils';
import { getValueFromInput } from 'util/FormsUtils';
import ToolsStore from 'stores/tools/ToolsStore';

type Config = {
  begin_index: number;
  end_index: number;
};
type Props = {
  configuration: Config;
  exampleMessage?: string;
  onChange: (newConfig: {}) => void;
  onExtractorPreviewLoad: (extractor: React.ReactNode) => void;
};
const DEFAULT_CONFIGURATION = { begin_index: 0, end_index: 1 };
const _getEffectiveConfiguration = (configuration: Config) =>
  ExtractorUtils.getEffectiveConfiguration(DEFAULT_CONFIGURATION, configuration);

const SubstringExtractorConfiguration = ({
  configuration: initialConfig,
  exampleMessage = undefined,
  onChange,
  onExtractorPreviewLoad,
}: Props) => {
  const [configuration, setConfig] = useState(_getEffectiveConfiguration(initialConfig));
  const [trying, setTrying] = useState(false);
  const [beginIndex, setBeginIndex] = useState<Input>();
  const [endIndex, setEndIndex] = useState<Input>();

  useEffect(() => {
    onChange(configuration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onChange = (key: string) => (event: { target: HTMLInputElement }) => {
    onExtractorPreviewLoad(undefined);
    const newConfig = {
      ...configuration,
      [key]: getValueFromInput(event.target),
    };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const _verifySubstringInputs = () => {
    const _beginIndex = beginIndex.getInputDOMNode();
    const _endIndex = endIndex.getInputDOMNode();

    if (configuration.begin_index === undefined || configuration.begin_index < 0) {
      _beginIndex.value = '0';
      _onChange('begin_index')({ target: _beginIndex });
    }

    if (configuration.end_index === undefined || configuration.end_index < 0) {
      _endIndex.value = '0';
      _onChange('end_index')({ target: _endIndex });
    }

    if (configuration.begin_index > configuration.end_index) {
      _beginIndex.value = configuration.end_index;
      _onChange('begin_index')({ target: _beginIndex });
    }
  };

  const _onTryClick = () => {
    setTrying(true);

    _verifySubstringInputs();

    if (configuration.begin_index === configuration.end_index) {
      onExtractorPreviewLoad('');
      setTrying(false);
    } else {
      const promise = ToolsStore.testSubstring(configuration.begin_index, configuration.end_index, exampleMessage);

      promise.then((result) => {
        if (!result.successful) {
          UserNotification.warning('无法执行子串提取。请检查索引边界。');

          return;
        }

        onExtractorPreviewLoad(<samp>{result.cut}</samp>);
      });

      promise.finally(() => setTrying(false));
    }
  };

  const _isTryButtonDisabled =
    trying ||
    configuration.begin_index === undefined ||
    configuration.begin_index < 0 ||
    configuration.end_index === undefined ||
    configuration.end_index < 0 ||
    !exampleMessage;

  const endIndexHelpMessage = (
    <span>
      提取结束位置。（不包含） <strong>示例:</strong> <em>1,5</em> cuts <em>love</em> 来自字符串{' '}
      <em>ilovelogs</em>.
    </span>
  );

  return (
    <div>
      <Input
        type="number"
        ref={(_beginIndex) => {
          setBeginIndex(_beginIndex);
        }}
        id="begin_index"
        label="起始索引"
        labelClassName="col-md-2"
        wrapperClassName="col-md-10"
        defaultValue={configuration.begin_index}
        onChange={_onChange('begin_index')}
        min="0"
        required
        help="开始提取的字符位置。（包含）"
      />

      <Input
        type="number"
        ref={(_endIndex) => {
          setEndIndex(_endIndex);
        }}
        id="end_index"
        label="结束索引"
        labelClassName="col-md-2"
        wrapperClassName="col-md-10"
        defaultValue={configuration.end_index}
        onChange={_onChange('end_index')}
        min="0"
        required
        help={endIndexHelpMessage}
      />

      <Row>
        <Col mdOffset={2} md={10}>
          <Button bsStyle="info" onClick={_onTryClick} disabled={_isTryButtonDisabled}>
            {trying ? <Icon name="progress_activity" spin /> : 'Try'}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default SubstringExtractorConfiguration;
