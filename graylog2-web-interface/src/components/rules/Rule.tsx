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
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { PageHeader } from 'components/common';
import { Row, Col, Button, BootstrapModalConfirm } from 'components/bootstrap';
import DocsHelper from 'util/DocsHelper';
import { getPathnameWithoutId } from 'util/URLUtils';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import useHistory from 'routing/useHistory';
import Routes from 'routing/Routes';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

import RuleBuilder from './rule-builder/RuleBuilder';
import RuleForm from './RuleForm';
import RuleHelper from './rule-helper/RuleHelper';

import PipelinesPageNavigation from '../pipelines/PipelinesPageNavigation';

type Props = {
  create: boolean,
  title: string,
  isRuleBuilder: boolean,
};

const Rule = ({ create, title, isRuleBuilder }: Props) => {
  const [showConfirmSourceCodeEditor, setShowConfirmSourceCodeEditor] = useState<boolean>(false);

  const history = useHistory();
  const { pathname } = useLocation();
  const sendTelemetry = useSendTelemetry();

  let pageTitle;

  if (create) {
    pageTitle = 'Create pipeline rule';
  } else {
    pageTitle = <span>管道规则 <em>{title}</em></span>;
  }

  return (
    <div>
      <PipelinesPageNavigation />
      <PageHeader title={pageTitle}
                  actions={(isRuleBuilder && create) ? (
                    <Button bsStyle="success"
                            bsSize="small"
                            onClick={() => {
                              sendTelemetry(TELEMETRY_EVENT_TYPE.PIPELINE_RULE_BUILDER.USE_SOURCE_CODE_EDITOR_CLICKED, {
                                app_pathname: getPathnameWithoutId(pathname),
                                app_section: 'pipeline-rules',
                                app_action_value: 'source-code-editor-button',
                              });

                              setShowConfirmSourceCodeEditor(true);
                            }}>
                      使用源代码编辑器
                    </Button>
                  ) : undefined}
                  documentationLink={{
                    title: '管道规则文档',
                    path: DocsHelper.PAGES.PIPELINE_RULES,
                  }}>
        <span>
          规则是 Graylog 中对消息应用更改的一种方式。规则由条件和列表组成{' '}
          的操作。{' '}
          Graylog 将条件与消息进行比对，若条件满足则执行相应操作。
        </span>
      </PageHeader>

      {isRuleBuilder ? (
        <RuleBuilder />
      ) : (
        <Row className="content">
          <Col md={6}>
            <RuleForm create={create} />
          </Col>
          <Col md={6}>
            <RuleHelper />
          </Col>
        </Row>
      )}

      {showConfirmSourceCodeEditor && (
        <BootstrapModalConfirm showModal
                               title="切换到源代码编辑器"
                               onConfirm={() => {
                                 sendTelemetry(TELEMETRY_EVENT_TYPE.PIPELINE_RULE_BUILDER.SWITCH_TO_SOURCE_CODE_EDITOR_CONFIRM_CLICKED, {
                                   app_pathname: getPathnameWithoutId(pathname),
                                   app_section: 'pipeline-rules',
                                   app_action_value: 'confirm-button',
                                 });

                                 history.push(Routes.SYSTEM.PIPELINES.RULE('new'));
                                 setShowConfirmSourceCodeEditor(false);
                               }}
                               onCancel={() => {
                                 sendTelemetry(TELEMETRY_EVENT_TYPE.PIPELINE_RULE_BUILDER.SWITCH_TO_SOURCE_CODE_EDITOR_CANCEL_CLICKED, {
                                   app_pathname: getPathnameWithoutId(pathname),
                                   app_section: 'pipeline-rules',
                                   app_action_value: 'cancel-button',
                                 });

                                 setShowConfirmSourceCodeEditor(false);
                               }}>
          <div>您即将离开此页面并进入源代码编辑器。</div>
          <div>请确保没有未保存的更改。</div>
        </BootstrapModalConfirm>
      )}
    </div>
  );
};

Rule.propTypes = {
  title: PropTypes.string,
  create: PropTypes.bool,
  isRuleBuilder: PropTypes.bool,
};

Rule.defaultProps = {
  title: '',
  create: false,
  isRuleBuilder: false,
};

export default Rule;
