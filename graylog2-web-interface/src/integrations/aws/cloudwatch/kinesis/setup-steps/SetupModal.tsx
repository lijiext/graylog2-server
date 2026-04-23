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
import React, { useState, useCallback } from 'react';

import { Alert, Button, Modal } from 'components/bootstrap';
import { ModalSubmit } from 'components/common';

import Agree from './Agree';
import KinesisSetupSteps from './KinesisSetupSteps';

type SetupModalProps = {
  onSubmit: (...args: any[]) => void;
  onCancel: (...args: any[]) => void;
  groupName: string;
  streamName: string;
};

const SetupModal = ({ onSubmit, onCancel, groupName, streamName }: SetupModalProps) => {
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const buttonOtherText = !error && !success ? 'Creating...' : 'Close';
  const buttonText = success ? 'Continue Setup' : buttonOtherText;

  const handleSuccess = () => {
    setSuccess(true);
    setError(false);
  };

  const handleError = useCallback(() => {
    setSuccess(false);
    setError(true);
  }, []);

  return (
    <Modal show onHide={() => {}}>
      <Modal.Header>
        <Modal.Title>{agreed ? 'Executing Auto-Setup' : 'Kinesis Auto Setup Agreement'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {agreed ? (
          <KinesisSetupSteps onSuccess={handleSuccess} onError={handleError} />
        ) : (
          <Agree groupName={groupName} streamName={streamName} />
        )}

        {agreed && success && (
          <Alert key="delayedLogs" bsStyle="warning">
            Kinesis 数据流中的第一条消息可能需要长达十分钟才能到达。在下一步中，Kinesis 健康检查在消息出现在数据流中之前将无法成功完成。请参阅官方{' '}
            <a
              href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html"
              target="_blank"
              rel="noopener noreferrer">
              CloudWatch 订阅
            </a>{' '}
            文档以获取更多信息。
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        {agreed ? (
          <Button bsStyle="primary" onClick={success ? onSubmit : onCancel} type="button" disabled={!error && !success}>
            {buttonText}
          </Button>
        ) : (
          <ModalSubmit
            submitButtonText="我同意！立即创建这些 AWS 资源。"
            onSubmit={() => setAgreed(true)}
            submitButtonType="button"
            onCancel={onCancel}
          />
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default SetupModal;
