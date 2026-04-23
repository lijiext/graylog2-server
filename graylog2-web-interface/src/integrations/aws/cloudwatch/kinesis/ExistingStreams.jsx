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
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Button, Modal, Panel } from 'components/bootstrap';
import DocumentationLink from 'components/support/DocumentationLink';
import { FormDataContext } from 'integrations/aws/context/FormData';
import { ApiContext } from 'integrations/aws/context/Api';
import { SidebarContext } from 'integrations/aws/context/Sidebar';
import useFetch from 'integrations/aws/common/hooks/useFetch';
import FormWrap from 'integrations/aws/common/FormWrap';
import ValidatedInput from 'integrations/aws/common/ValidatedInput';
import { ApiRoutes, DocsRoutes } from 'integrations/aws/common/Routes';
import { renderOptions } from 'integrations/aws/common/Options';
import formValidation from 'integrations/aws/utils/formValidation';
import Spinner from 'components/common/Spinner';

import FormAdvancedOptions from '../FormAdvancedOptions';

const KinesisStreams = ({ onChange, onSubmit, toggleSetup }) => {
  const { formData } = useContext(FormDataContext);
  const [formError, setFormError] = useState(null);
  const { availableStreams, setLogData } = useContext(ApiContext);
  const { clearSidebar, setSidebar } = useContext(SidebarContext);
  const [logDataStatus, setLogDataUrl] = useFetch(
    null,
    (response) => {
      setLogData(response);
      onSubmit();
    },
    'POST',
    {
      region: formData.awsCloudWatchAwsRegion.value,
      stream_name: formData.awsCloudWatchKinesisStream ? formData.awsCloudWatchKinesisStream.value : '',
    },
  );

  useEffect(() => {
    setSidebar(
      <Panel bsStyle="info" header={<span>未找到所需的数据流？</span>}>
        <AutoSetupContent>
          <p>在指定区域中必须至少存在一个 Kinesis 数据流，才能继续设置。日志流必须包含至少几条日志消息。</p>

          <p>
            Graylog 还支持为您创建 Kinesis 数据流并将其订阅到您选择的 CloudWatch 日志组。请注意，此选项将在您的 AWS 环境中创建额外资源并产生计费费用。
          </p>
        </AutoSetupContent>

        <Button onClick={() => {
          clearSidebar();
          toggleSetup();
        }}
                type="button">
          自动设置 Kinesis
        </Button>
      </Panel>,
    );
  }, []);

  useEffect(() => {
    if (logDataStatus.error) {
      setLogDataUrl(null);

      setFormError({
        full_message: logDataStatus.error,
        nice_message: <span>在此 Kinesis 数据流中未找到任何日志。请选择不同的 Kinesis 数据流。</span>,
      });
    }
  }, [logDataStatus.error]);

  const handleSubmit = () => {
    setLogDataUrl(ApiRoutes.INTEGRATIONS.AWS.KINESIS.HEALTH_CHECK);
  };

  return (
    <>
      <LoadingModal show={logDataStatus.loading}
                    backdrop="static"
                    keyboard={false}
                    bsSize="small">
        <LoadingContent>
          <StyledSpinner />
          <LoadingMessage>此请求可能需要几分钟。</LoadingMessage>
        </LoadingContent>
      </LoadingModal>

      <FormWrap onSubmit={handleSubmit}
                buttonContent="Verify Stream &amp; Format"
                loading={logDataStatus.loading}
                error={formError}
                disabled={formValidation.isFormValid(['awsCloudWatchKinesisStream'], formData)}
                title="选择 Kinesis 数据流"
                description={(
                  <>
                    <p>
                      以下是指定 AWS 账户中找到的所有 Kinesis 数据流列表。
                    </p>
                    <p>
                      请选择您要从中读取消息的数据流，或关注 
                      <DocumentationLink page={DocsRoutes.INTEGRATIONS.AWS.AWS_KINESIS_CLOUDWATCH_INPUTS} text="AWS Kinesis/CloudWatch Input " />
                      有关此设置的详细文档。
                    </p>
                  </>
                )}>

        <ValidatedInput id="awsCloudWatchKinesisStream"
                        type="select"
                        fieldData={formData.awsCloudWatchKinesisStream}
                        onChange={onChange}
                        label="选择数据流"
                        required>
          {renderOptions(availableStreams, 'Select Kinesis Stream')}
        </ValidatedInput>

        <FormAdvancedOptions onChange={onChange} />
      </FormWrap>
    </>
  );
};

KinesisStreams.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  toggleSetup: PropTypes.func,
};

KinesisStreams.defaultProps = {
  toggleSetup: () => {
  },
};

const AutoSetupContent = styled.div`
  margin-bottom: 9px;
`;

const LoadingModal = styled(Modal)`
  > .modal-dialog {
    width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const LoadingContent = styled(Modal.Body)`
  text-align: center;
`;

const StyledSpinner = styled(Spinner)`
  font-size: 48px;
  color: #702785;
`;

const LoadingMessage = styled.p`
  font-size: 16px;
  font-weight: bold;
  padding-top: 15px;
  color: #a6afbd;
`;

export default KinesisStreams;
