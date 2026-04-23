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
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Alert, Button, Modal } from 'components/bootstrap';
import { ModalSubmit } from 'components/common';

import Agree from './Agree';
import KinesisSetupSteps from './KinesisSetupSteps';

const SetupModal = ({ onSubmit, onCancel, groupName, streamName }) => {
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const buttonOtherText = (!error && !success) ? '正在创建...' : '关闭';
  const buttonText = success ? 'Continue Setup' : buttonOtherText;

  const handleSuccess = () => {
    setSuccess(true);
    setError(false);
  };

  const handleError = () => {
    setSuccess(false);
    setError(true);
  };

  return (
    <Modal show>
      <Modal.Header>
        <Modal.Title>{agreed ? '正在执行自动设置' : 'Kinesis 自动设置协议'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {agreed
          ? <KinesisSetupSteps onSuccess={handleSuccess} onError={handleError} />
          : <Agree groupName={groupName} streamName={streamName} />}

        {agreed && success && (
          <Alert key="delayedLogs" variant="warning">
            第一条消息可能需要长达十分钟才能到达 Kinesis 数据流。在下一步中的 Kinesis 健康检查在数据流中存在消息之前将无法成功完成。请参阅官方 <a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html" target="_blank" rel="noopener noreferrer">CloudWatch 订阅</a> 文档以获取更多信息。
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        {agreed
          ? (
            <Button bsStyle="success"
                    onClick={success ? onSubmit : onCancel}
                    type="button"
                    disabled={!error && !success}>
              {buttonText}
            </Button>
          )
          : (
            <ModalSubmit submitButtonText="我同意！立即创建这些 AWS 资源。"
                         onSubmit={() => (setAgreed(true))}
                         submitButtonType="button"
                         onCancel={onCancel} />
          )}
      </Modal.Footer>
    </Modal>
  );
};

SetupModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  groupName: PropTypes.string.isRequired,
  streamName: PropTypes.string.isRequired,
};

export default SetupModal;
