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
import styled, { css } from 'styled-components';

import { ProgressBar, LinkToNode, RelativeTime, Icon } from 'components/common';
import { Button } from 'components/bootstrap';
import { SystemJobsActions } from 'stores/systemjobs/SystemJobsStore';
import UserNotification from 'util/UserNotification';
import Badge from 'components/bootstrap/Badge';

enum JobStatus {
  Cancelled = 'cancelled',
  Complete = 'complete',
  Error = 'error',
  Paused = 'paused',
  Runnable = 'runnable',
  Running = 'running',
}

const StatusBadge = styled(Badge)<{ status: string }>(({ status, theme }) => {
  const { primary, success, info, warning, danger } = theme.colors.variant.dark;
  const statuses = {
    cancelled: warning,
    complete: success,
    error: danger,
    queued: info,
    running: primary,
  };
  const color = statuses[status] ?? info;

  return css`
    margin-left: 4px;
    background-color: ${color};
    color: ${theme.utils.readableColor(color)};
  `;
});

const StyledProgressBar = styled(ProgressBar)`
  margin-top: 2px;
  margin-bottom: 5px;
`;

const JobWrap = styled.div`
  margin-bottom: 5px;
`;

const AcknowledgeButton = styled(Button)(
  ({ theme }) => css`
    && {
      color: ${theme.colors.text.primary};

      &:hover {
        color: ${theme.colors.variant.default};
      }
    }
  `,
);

type SystemJobProps = {
  job: {
    info?: string;
    id?: string;
    percent_complete?: number;
    is_cancelable?: boolean;
    name?: string;
    node_id?: string;
    started_at?: string;
    execution_duration?: string;
    job_status?: string;
    provides_progress?: boolean;
  };
};

const SystemJob = ({ job }: SystemJobProps) => {
  const jobIsOver =
    job.job_status === JobStatus.Complete ||
    job.percent_complete === 100 ||
    job.job_status === JobStatus.Cancelled ||
    job.job_status === JobStatus.Error;
  const mappedJobStatus = job.job_status === JobStatus.Runnable ? 'queued' : job.job_status;

  const _onAcknowledge = () => (e) => {
    e.preventDefault();

    SystemJobsActions.acknowledgeJob(job.id).catch((error) => {
      UserNotification.error(error.responseMessage, '无法确认作业');
    });
  };

  const _onCancel = () => (e) => {
    e.preventDefault();

    // eslint-disable-next-line no-alert
    if (window.confirm(`Are you sure you want to cancel system job "${job.info}"?`)) {
      SystemJobsActions.cancelJob(job.id).catch((error) => {
        UserNotification.error(error.responseMessage, '无法取消作业');
      });
    }
  };

  return (
    <div>
      <JobWrap>
        <Icon name="settings" />{' '}
        <span data-toggle="tooltip" title={job.name}>
          {job.info}
        </span>{' '}
        - 开启 <LinkToNode nodeId={job.node_id} /> <RelativeTime dateTime={job.started_at} />{' '}
        <span data-toggle="tooltip" title={`运行时间：${job.execution_duration}`}>
          <StatusBadge status={mappedJobStatus}>{mappedJobStatus}</StatusBadge>
        </span>
        {!jobIsOver && job.is_cancelable ? (
          <Button type="button" bsSize="xs" bsStyle="primary" className="pull-right" onClick={_onCancel()}>
            取消
          </Button>
        ) : (
          <AcknowledgeButton
            type="button"
            bsStyle="link"
            onClick={_onAcknowledge()}
            bsSize="xs"
            className="pull-right"
            title="确认">
            <Icon name="close" />
          </AcknowledgeButton>
        )}
      </JobWrap>

      {!jobIsOver && job.provides_progress && (
        <StyledProgressBar bars={[{ value: job.percent_complete, bsStyle: 'info', animated: true }]} />
      )}
    </div>
  );
};

export default SystemJob;
