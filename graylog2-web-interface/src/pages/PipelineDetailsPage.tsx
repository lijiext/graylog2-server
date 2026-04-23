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

import { Col, Row } from 'components/bootstrap';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import Pipeline from 'components/pipelines/Pipeline';
import NewPipeline from 'components/pipelines/NewPipeline';
import SourceGenerator from 'logic/pipelines/SourceGenerator';
import { StreamsStore } from 'stores/streams/StreamsStore';
import { PipelineConnectionsStore, PipelineConnectionsActions } from 'stores/pipelines/PipelineConnectionsStore';
import DocsHelper from 'util/DocsHelper';
import { useStore } from 'stores/connect';
import useParams from 'routing/useParams';
import { RulesActions } from 'stores/rules/RulesStore';
import usePipeline from 'hooks/usePipeline';
import usePipelineMutations from 'hooks/usePipelineMutations';

import PipelinesPageNavigation from '../components/pipelines/PipelinesPageNavigation';

const _isNewPipeline = (pipelineId: string) => pipelineId === 'new';

const PipelineDetailsPage = () => {
  const params = useParams<{ pipelineId: string }>();
  const { data: pipeline } = usePipeline(params?.pipelineId, {
    enabled: !_isNewPipeline(params.pipelineId) && !!params?.pipelineId,
  });

  const { createPipeline, updatePipeline } = usePipelineMutations();
  const connections = useStore(PipelineConnectionsStore, (state) =>
    state.connections?.filter((c) => c.pipeline_ids && c.pipeline_ids.includes(params.pipelineId)),
  );
  const [streams, setStreams] = useState();

  useEffect(() => {
    RulesActions.list();
    PipelineConnectionsActions.list();

    StreamsStore.listStreams().then((_streams) => {
      const filteredStreams = _streams.filter((s) => s.is_editable);

      setStreams(filteredStreams);
    });
  }, []);

  const _onConnectionsChange = (updatedConnections, callback) => {
    PipelineConnectionsActions.connectToPipeline(updatedConnections);
    callback();
  };

  const _onStagesChange = (newStages, callback) => {
    const pipelineWithNewStages = {
      ...pipeline,
      stages: newStages,
    };

    const newPipeline = {
      ...pipelineWithNewStages,
      source: SourceGenerator.generatePipeline(pipelineWithNewStages),
    };

    updatePipeline({ pipelineSource: newPipeline, pipelineId: newPipeline.id });

    if (typeof callback === 'function') {
      callback();
    }
  };

  const _savePipeline = (_pipeline, callback) => {
    const requestPipeline = {
      ..._pipeline,
      source: SourceGenerator.generatePipeline(_pipeline),
    };

    if (requestPipeline.id) {
      updatePipeline({ pipelineSource: requestPipeline, pipelineId: requestPipeline.id }).then((p) => callback(p));
    } else {
      createPipeline({ pipelineSource: requestPipeline }).then((p) => callback(p));
    }
  };

  const _isLoading = !_isNewPipeline(params.pipelineId) && (!pipeline || !connections || !streams);

  if (_isLoading) {
    return <Spinner />;
  }

  const title = _isNewPipeline(params.pipelineId) ? (
    'New pipeline'
  ) : (
    <span>
      处理管道 <em>{pipeline.title}</em>
    </span>
  );

  const content = _isNewPipeline(params.pipelineId) ? (
    <NewPipeline onChange={_savePipeline} />
  ) : (
    <Pipeline
      pipeline={pipeline}
      connections={connections}
      streams={streams}
      onConnectionsChange={_onConnectionsChange}
      onStagesChange={_onStagesChange}
      onPipelineChange={_savePipeline}
    />
  );

  const pageTitle = _isNewPipeline(params.pipelineId) ? 'New pipeline' : `Pipeline ${pipeline.title}`;

  return (
    <DocumentTitle title={pageTitle}>
      <div>
        <PipelinesPageNavigation />
        <PageHeader
          title={title}
          documentationLink={{
            title: 'Pipelines documentation',
            path: DocsHelper.PAGES.PIPELINES,
          }}>
          <span>
            处理管道允许您转换和处理来自数据流的消息。处理管道由阶段组成，在这些阶段中评估并应用规则。消息可以经过一个或多个阶段。
            <br />
            每个阶段完成后，您可以决定匹配所有或任一规则的消息是否继续进入下一阶段。
          </span>
        </PageHeader>

        <Row className="content">
          <Col md={12}>{content}</Col>
        </Row>
      </div>
    </DocumentTitle>
  );
};

export default PipelineDetailsPage;
