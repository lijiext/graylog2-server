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
import React, { useContext, useState } from 'react';

import { PageHeader, Spinner } from 'components/common';
import { Row, Col, Button, BootstrapModalConfirm, Alert } from 'components/bootstrap';
import DocsHelper from 'util/DocsHelper';
import { getPathnameWithoutId } from 'util/URLUtils';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import useHistory from 'routing/useHistory';
import Routes from 'routing/Routes';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import useGetPermissionsByScope from 'hooks/useScopePermissions';

import RuleBuilder from './rule-builder/RuleBuilder';
import RuleForm from './RuleForm';
import RuleHelper from './rule-helper/RuleHelper';
import { PipelineRulesContext } from './RuleContext';

import PipelinesPageNavigation from '../pipelines/PipelinesPageNavigation';

type Props = {
  create?: boolean;
  title?: string;
  isRuleBuilder?: boolean;
};

const Rule = ({ create = false, title = '', isRuleBuilder = false }: Props) => {
  const [showConfirmSourceCodeEditor, setShowConfirmSourceCodeEditor] = useState<boolean>(false);
  const { rule } = useContext(PipelineRulesContext);
  const { loadingScopePermissions, scopePermissions } = useGetPermissionsByScope(rule);
  const isManaged = scopePermissions && !scopePermissions?.is_mutable;
  const history = useHistory();
  const { pathname } = useLocation();
  const sendTelemetry = useSendTelemetry();

  if (loadingScopePermissions) {
    return <Spinner text="Loading Rule" />;
  }

  let pageTitle;

  if (create) {
    pageTitle = 'Create pipeline rule';
  } else {
    pageTitle = (
      <span>
        管道规则 <em>{title}</em>
      </span>
    );
  }

  return (
    <div>
      <PipelinesPageNavigation />
      <PageHeader
        title={pageTitle}
        actions={
          isRuleBuilder && create ? (
            <Button
              bsStyle="primary"
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
          ) : undefined
        }
        documentationLink={{
          title: 'Pipeline rules documentation',
          path: DocsHelper.PAGES.PIPELINE_RULES,
        }}>
        <span>
          规则是应用于消息更改的一种方式。规则由条件和操作列表组成。条件针对消息进行求值，如果条件满足，则执行操作。
        </span>
      </PageHeader>
      {isRuleBuilder ? (
        <RuleBuilder />
      ) : (
        <Row className="content">
          <Col md={6}>
            {isManaged && <Alert bsStyle="warning">此规则由应用程序管理。您无法对其进行编辑。</Alert>}
            <RuleForm create={create} isManaged={isManaged} />
          </Col>
          <Col md={6}>
            <RuleHelper />
          </Col>
        </Row>
      )}

      {showConfirmSourceCodeEditor && (
        <BootstrapModalConfirm
          showModal
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

export default Rule;
