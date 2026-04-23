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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as Immutable from 'immutable';
import type { Subtract } from 'utility-types';

import { getValueFromInput } from 'util/FormsUtils';
import { Select, FormSubmit } from 'components/common';
import { Col, Row, Input } from 'components/bootstrap';
import { BooleanField, DropdownField, NumberField, TextField } from 'components/configurationforms';
import type { ConfigurationFieldValue } from 'components/configurationforms';
import connect from 'stores/connect';
import type { Message } from 'views/components/messagelist/Types';
import useForwarderMessageLoaders from 'components/messageloaders/useForwarderMessageLoaders';
import AppConfig from 'util/AppConfig';
import { CodecTypesStore, CodecTypesActions } from 'stores/codecs/CodecTypesStore';
import { InputsActions, InputsStore } from 'stores/inputs/InputsStore';
import useHistory from 'routing/useHistory';
import { Messages } from '@graylog/server-api';
import MessageFormatter from 'logic/message/MessageFormatter';
import UserNotification from 'util/UserNotification';

import type { Input as InputType, CodecTypes } from './Types';

const DEFAULT_REMOTE_ADDRESS = '127.0.0.1';

type InputSelectProps = {
  inputs: Immutable.Map<string, InputType>,
  selectedInputId: string | undefined,
  onInputSelect: (selectedInputId: string) => void,
  show: boolean,
};

const ServerInputSelect = ({ inputs, selectedInputId, onInputSelect }: Subtract<InputSelectProps, {show}>) => {
  const _formatInputSelectOptions = () => {
    if (!inputs) {
      return [{ value: 'none', label: '正在加载输入端...', disabled: true }];
    }

    if (inputs.size === 0) {
      return [{ value: 'none', label: '暂无可用输入端' }];
    }

    const formattedInputs = [];

    inputs
      .sort((inputA, inputB) => inputA.title.toLowerCase().localeCompare(inputB.title.toLowerCase()))
      .forEach((input, id) => {
        const label = `${id} / ${input.title} / ${input.name}`;

        formattedInputs.push({ value: id, label: label });
      });

    return formattedInputs;
  };

  return (
    <Input id="inputSelect"
           name="inputSelect"
           label={<>消息输入 <small>(可选)</small></>}
           help="选择应分配给解析后消息的消息输入端 ID。">
      <Select inputId="inputSelect"
              name="inputSelect"
              aria-label="消息输入"
              placeholder="选择输入端"
              options={_formatInputSelectOptions()}
              matchProp="label"
              onChange={onInputSelect}
              value={selectedInputId} />
    </Input>
  );
};

const ForwarderInputSelect = ({ onInputSelect }: Pick<InputSelectProps, 'onInputSelect'>) => {
  const { ForwarderInputDropdown } = useForwarderMessageLoaders();

  return (
    <>
      <ForwarderInputDropdown onLoadMessage={onInputSelect}
                              label="转发器输入选择（可选）"
                              autoLoadMessage />
      <p className="description">从下方列表中选择输入配置文件，然后选择一个输入。</p>
    </>
  );
};

const InputSelect = ({ inputs, selectedInputId, onInputSelect, show }: InputSelectProps) => {
  const { ForwarderInputDropdown } = useForwarderMessageLoaders();
  const [selectedInputType, setSelectedInputType] = useState<'server' | 'forwarder' | undefined>();

  if (!show) {
    return null;
  }

  if (AppConfig.isCloud()) {
    return <ForwarderInputSelect onInputSelect={onInputSelect} />;
  }

  return ForwarderInputDropdown ? (
    <fieldset>
      <legend>输入端选择（可选）</legend>
      <Input id="inputTypeSelect"
             type="select"
             label="选择输入类型（可选）"
             help="选择要从中加载消息的输入端类型。"
             value={selectedInputType ?? 'placeholder'}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedInputType(e.target.value as 'server' | 'forwarder')}>
        <option value="placeholder" disabled>选择输入类型</option>
        <option value="server">服务器输入</option>
        <option value="forwarder">转发器输入</option>
      </Input>

      {selectedInputType === 'server' && (
        <ServerInputSelect inputs={inputs} selectedInputId={selectedInputId} onInputSelect={onInputSelect} />
      )}
      {selectedInputType === 'forwarder' && (
        <ForwarderInputSelect onInputSelect={onInputSelect} />
      )}
    </fieldset>
  ) : (
    <ServerInputSelect inputs={inputs} selectedInputId={selectedInputId} onInputSelect={onInputSelect} />
  );
};

type OptionsType = {
  message: string,
  remoteAddress: string,
  codec: string,
  codecConfiguration: {
    [key: string]: string,
  },
  inputId?: string,
};

type Props = {
  inputs?: Immutable.Map<string, InputType>,
  codecTypes: CodecTypes,
  onMessageLoaded: (message: Message | undefined, option: OptionsType) => void,
  inputIdSelector?: boolean,
};

const parseRawMessage = (message: string, remoteAddress: string, codec: string, codecConfiguration: { [key: string]: {} }) => {
  const payload = {
    message,
    remote_address: remoteAddress,
    codec,
    configuration: codecConfiguration,
  };

  return Messages.parse(payload)
    .then(
      (response) => MessageFormatter.formatResultMessage(response),
      (error) => {
        if (error.additional && error.additional.status === 400) {
          UserNotification.error('Please ensure the selected codec and its configuration are right. '
            + 'Check your server logs for more information.', '无法加载原始消息');

          return;
        }

        UserNotification.error(`加载原始消息失败，状态为：${error}`,
          '无法加载原始消息');
      },
    );
};

const RawMessageLoader = ({ onMessageLoaded, inputIdSelector, codecTypes, inputs }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [remoteAddress, setRemoteAddress] = useState<string>(DEFAULT_REMOTE_ADDRESS);
  const [codec, setCodec] = useState<string>('');
  const [codecConfiguration, setCodecConfiguration] = useState({});
  const [inputId, setInputId] = useState<string | typeof undefined>();
  const history = useHistory();

  useEffect(() => {
    CodecTypesActions.list();
  }, []);

  useEffect(() => {
    if (inputIdSelector) {
      InputsActions.list();
    }
  }, [inputIdSelector]);

  const _loadMessage = (event: React.SyntheticEvent) => {
    event.preventDefault();

    setLoading(true);

    parseRawMessage(message, remoteAddress, codec, codecConfiguration)
      .then((loadedMessage) => {
        onMessageLoaded(
          loadedMessage,
          {
            message: message,
            remoteAddress: remoteAddress,
            codec: codec,
            codecConfiguration: codecConfiguration,
            inputId: inputId,
          },
        );
      })
      .finally(() => setLoading(false));
  };

  const _formatSelectOptions = () => {
    if (!codecTypes) {
      return [{ value: 'none', label: '正在加载编解码器类型...', disabled: true }];
    }

    const codecTypesIds = Object.keys(codecTypes);

    if (codecTypesIds.length === 0) {
      return [{ value: 'none', label: '没有可用的编解码器' }];
    }

    return codecTypesIds
      .filter((id) => id !== 'random-http-msg') // Skip Random HTTP codec, as nobody wants to enter a raw random message.
      .map((id) => {
        const { name } = codecTypes[id];

        // Add id as label on codecs not having a descriptor name
        return { value: id, label: name === '' ? id : name };
      })
      .sort((codecA, codecB) => codecA.label.toLowerCase().localeCompare(codecB.label.toLowerCase()));
  };

  const _onCodecSelect = (selectedCodec: string) => {
    setCodec(selectedCodec);
    setCodecConfiguration({});
  };

  const _onInputSelect = (selectedInput: string) => {
    setInputId(selectedInput);
  };

  const _onMessageChange = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setMessage(getValueFromInput(event.target));
  };

  const _onRemoteAddressChange = (event: React.SyntheticEvent<HTMLSelectElement>) => {
    setRemoteAddress(getValueFromInput(event.target));
  };

  const _onCodecConfigurationChange = (field: string, value: ConfigurationFieldValue) => {
    const newConfiguration = { ...codecConfiguration, [field]: value };
    setCodecConfiguration(newConfiguration);
  };

  const _formatConfigField = (key: string, configField) => {
    const value = codecConfiguration[key];
    const typeName = '原始消息加载器';
    const elementKey = `${typeName}-${key}`;

    switch (configField.type) {
      case 'text':
        return (
          <TextField key={elementKey}
                     typeName={typeName}
                     title={key}
                     field={configField}
                     value={value}
                     onChange={_onCodecConfigurationChange} />
        );
      case 'number':
        return (
          <NumberField key={elementKey}
                       typeName={typeName}
                       title={key}
                       field={configField}
                       value={value}
                       onChange={_onCodecConfigurationChange} />
        );
      case 'boolean':
        return (
          <BooleanField key={elementKey}
                        typeName={typeName}
                        title={key}
                        field={configField}
                        value={value}
                        onChange={_onCodecConfigurationChange} />
        );
      case 'dropdown':
        return (
          <DropdownField key={elementKey}
                         typeName={typeName}
                         title={key}
                         field={configField}
                         value={value}
                         onChange={_onCodecConfigurationChange} />
        );
      default:
        return null;
    }
  };

  const _isSubmitDisabled = !message || !codec || loading;

  let codecConfigurationOptions;

  if (codecTypes && codec) {
    const currentCodecConfiguration = codecTypes[codec].requested_configuration;

    codecConfigurationOptions = Object.keys(currentCodecConfiguration)
      .sort((keyA, keyB) => currentCodecConfiguration[keyA].is_optional - currentCodecConfiguration[keyB].is_optional)
      .map((key) => _formatConfigField(key, currentCodecConfiguration[key]));
  }

  return (
    <Row>
      <Col md={7}>
        <form onSubmit={_loadMessage}>
          <fieldset>
            <Input id="message"
                   name="message"
                   type="textarea"
                   label="原始消息"
                   value={message}
                   onChange={_onMessageChange}
                   rows={3}
                   required />
            <Input id="remoteAddress"
                   name="remoteAddress"
                   type="text"
                   label={<span>源 IP 地址 <small>(可选)</small></span>}
                   help={`用作消息源的远程 IP 地址。Graylog 默认将使用 ${DEFAULT_REMOTE_ADDRESS}。`}
                   value={remoteAddress}
                   onChange={_onRemoteAddressChange} />
          </fieldset>
          <InputSelect inputs={inputs}
                       selectedInputId={inputId}
                       onInputSelect={_onInputSelect}
                       show={inputIdSelector} />
          <fieldset>
            <legend>编解码器配置</legend>
            <Input id="codec"
                   name="codec"
                   label="消息编解码器"
                   help="选择用于解码消息的编解码器。"
                   required>
              <Select id="codec"
                      aria-label="消息编解码器"
                      placeholder="选择编解码器"
                      options={_formatSelectOptions()}
                      matchProp="label"
                      onChange={_onCodecSelect}
                      value={codec} />
            </Input>
            {codecConfigurationOptions}
          </fieldset>
          <FormSubmit submitButtonText="加载消息"
                      submitLoadingText="正在加载消息..."
                      isSubmitting={loading}
                      isAsyncSubmit
                      disabledSubmit={_isSubmitDisabled}
                      onCancel={() => history.goBack()} />
        </form>
      </Col>
    </Row>
  );
};

RawMessageLoader.propTypes = {
  onMessageLoaded: PropTypes.func.isRequired,
  inputIdSelector: PropTypes.bool,
  codecTypes: PropTypes.object,
  inputs: PropTypes.object,
};

RawMessageLoader.defaultProps = {
  inputIdSelector: false,
  codecTypes: undefined,
  inputs: undefined,
};

export default connect(
  // @ts-ignore
  RawMessageLoader,
  { inputs: InputsStore, codecTypes: CodecTypesStore },
  // @ts-ignore
  ({ inputs: { inputs }, codecTypes: { codecTypes } }) => ({ inputs: (inputs ? Immutable.Map(InputsStore.inputsAsMap(inputs)) : undefined), codecTypes }),
);
