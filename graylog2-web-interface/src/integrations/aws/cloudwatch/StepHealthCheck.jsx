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

import { Button, Panel, Input } from 'components/bootstrap';
import FormWrap from 'integrations/aws/common/FormWrap';
import SkipHealthCheck from 'integrations/aws/common/SkipHealthCheck';
import useFetch from 'integrations/aws/common/hooks/useFetch';
import { ApiRoutes } from 'integrations/aws/common/Routes';
import Countdown from 'integrations/aws/common/Countdown';
import { DEFAULT_KINESIS_LOG_TYPE, KINESIS_LOG_TYPES } from 'integrations/aws/common/constants';
import { ApiContext } from 'integrations/aws/context/Api';
import { FormDataContext } from 'integrations/aws/context/FormData';
import Icon from 'components/common/Icon';

const StepHealthCheck = ({ onChange, onSubmit }) => {
  const { logData, setLogData } = useContext(ApiContext);
  const { formData } = useContext(FormDataContext);
  const [pauseCountdown, setPauseCountdown] = useState(false);

  const [logDataProgress, setLogDataUrl] = useFetch(
    null,
    (response) => {
      setLogData(response);
      onChange({ target: { name: 'awsCloudWatchKinesisInputType', value: response.type } });
    },
    'POST',
    {
      region: formData.awsCloudWatchAwsRegion.value,
      stream_name: formData.awsCloudWatchKinesisStream.value,
    },
  );

  const checkForLogs = () => {
    setPauseCountdown(true);
    setLogDataUrl(ApiRoutes.INTEGRATIONS.AWS.KINESIS.HEALTH_CHECK);
  };

  useEffect(() => {
    if (!logData) {
      checkForLogs();
    }
  }, []);

  useEffect(() => {
    if (!logDataProgress.loading && !logDataProgress.data) {
      setPauseCountdown(false);
      setLogDataUrl(null);
    }
  }, [logDataProgress.loading]);

  if (!logData) {
    return (
      <Panel bsStyle="warning"
             header={(
               <Notice>
                 <Icon name="warning" size="2x" />
                 <span>我们尚未收到来自 Amazon 的回复。</span>
               </Notice>
            )}>
        <p>请稍候，我们正在持续检查您的 AWS 数据流中的日志。Amazon 的服务器每 10 分钟解析一次日志，因此请泡杯咖啡，因为这可能需要一些时间！</p>

        <CheckAgain>
          <strong>再次检查时间： <Countdown timeInSeconds={120} callback={checkForLogs} paused={pauseCountdown} /></strong>

          <Button type="button"
                  bsStyle="success"
                  bsSize="sm"
                  onClick={checkForLogs}
                  disabled={logDataProgress.loading}>
            {logDataProgress.loading ? '检查中...' : '立即检查'}
          </Button>
        </CheckAgain>

        <p><em>请勿刷新浏览器，我们正在持续检查您的日志，当日志可用时，此页面将自动刷新。</em></p>

        <div>
          <SkipHealthCheck onSubmit={onSubmit} onChange={onChange} />
        </div>
      </Panel>
    );
  }

  const knownLog = logData.type === DEFAULT_KINESIS_LOG_TYPE;
  const iconName = knownLog ? 'check_circle' : 'warning';
  const acknowledgment = knownLog ? 'Awesome!' : 'Drats!';
  const bsStyle = knownLog ? 'success' : 'warning';
  const logTypeLabel = KINESIS_LOG_TYPES.find((type) => type.value === logData.type).label;
  const logType = knownLog ? `a ${logTypeLabel}` : 'an unknown';

  const handleSubmit = () => {
    onSubmit();
    onChange({ target: { name: 'awsCloudWatchKinesisInputType', value: logData.type } });
  };

  return (
    <FormWrap onSubmit={handleSubmit}
              buttonContent="Review &amp; Finalize"
              disabled={false}
              title="创建 Kinesis 数据流"
              description={<p>我们将尝试解析一条日志以帮助您！如果无法解析，或您希望以不同方式解析，请前往 <a href="/system/pipelines">管道规则</a> 设置您自己的解析器！</p>}>

      <Panel bsStyle={bsStyle}
             header={(
               <Notice>
                 <Icon name={iconName} size="2x" />
                 <span>{acknowledgment} 看起来像 <em>{logType}</em> 消息类型。</span>
               </Notice>
             )}>
        {knownLog ? '查看我们已解析的内容，并创建管道规则以处理更多内容！' : '别担心，Graylog 仍然可以读取这些日志消息。我们已解析了能解析的部分，您可以构建管道规则来完成其余部分！'}
      </Panel>

      <Input id="awsCloudWatchLog"
             type="textarea"
             label="格式化日志消息"
             value={logData.message}
             rows={10}
             disabled />
    </FormWrap>
  );
};

StepHealthCheck.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

const Notice = styled.span`
  display: flex;
  align-items: center;

  > span {
    margin-left: 6px;
  }
`;

const CheckAgain = styled.p`
  display: flex;
  align-items: center;

  > strong {
    margin-right: 9px;
  }
`;

export default StepHealthCheck;
