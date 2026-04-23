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
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { SystemJobsList } from 'components/systemjobs';
import { Col, Row } from 'components/bootstrap';
import { Spinner } from 'components/common';
import connect from 'stores/connect';
import { SystemJobsActions, SystemJobsStore } from 'stores/systemjobs/SystemJobsStore';

const SystemJobsComponent = ({ jobs }) => {
  useEffect(() => {
    SystemJobsActions.list();
    const interval = setInterval(SystemJobsActions.list, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!jobs) {
    return <Spinner />;
  }

  const jobList = Object.keys(jobs)
    .map((nodeId) => (jobs[nodeId] ? jobs[nodeId].jobs : []))
    .reduce((a, b) => a.concat(b), []);

  return (
    <Row className="content">
      <Col md={12}>
        <h2>系统作业</h2>
        <p className="description">
          系统任务是 graylog-server 节点出于维护原因而执行的长期运行任务。某些任务提供进度信息或可以停止。
        </p>

        <SystemJobsList jobs={jobList} />
      </Col>
    </Row>
  );
};

SystemJobsComponent.propTypes = {
  jobs: PropTypes.objectOf(
    PropTypes.shape({
      jobs: PropTypes.array,
    }),
  ),
};

SystemJobsComponent.defaultProps = {
  jobs: undefined,
};

export default connect(SystemJobsComponent,
  { systemJobsStore: SystemJobsStore },
  ({ systemJobsStore }) => ({ jobs: (systemJobsStore as any).jobs }));
