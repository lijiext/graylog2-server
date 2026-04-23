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
import styled, { css } from 'styled-components';
import { Form, Formik } from 'formik';

import { Button, Col, Modal, Row } from 'components/bootstrap';
import FormikInput from 'components/common/FormikInput';
import { InputDescription, ModalSubmit, IfPermitted } from 'components/common';
import { ConfigurationsActions, ConfigurationsStore } from 'stores/configurations/ConfigurationsStore';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import { getPathnameWithoutId } from 'util/URLUtils';
import ConfigurationType from 'components/configurations/ConfigurationTypes';
import getConfig from 'components/configurations/helpers';
import { useStore } from 'stores/connect';
import type { Store } from 'stores/StoreTypes';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import reloadPage from 'preflight/components/reloadPage';
import type { MarkdownConfigType } from 'components/common/types';

import Spinner from '../common/Spinner';

const StyledDefList = styled.dl.attrs({ className: 'deflist' })(
  ({ theme }) => css`
    /* stylelint-disable-next-line nesting-selector-no-missing-scoping-root */
    &&.deflist {
      dd {
        padding-left: ${theme.spacings.md};
        margin-left: 400px;
      }
    }
  `,
);

const LabelSpan = styled.span(
  ({ theme }) => css`
    margin-left: ${theme.spacings.sm};
    font-weight: bold;
  `,
);

const configType = ConfigurationType.MARKDOWN_CONFIG;

const MarkdownConfig = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [viewConfig, setViewConfig] = useState<MarkdownConfigType | undefined>(undefined);
  const [formConfig, setFormConfig] = useState<MarkdownConfigType | undefined>(undefined);
  const configuration = useStore(ConfigurationsStore as Store<Record<string, any>>, (state) => state?.configuration);

  const sendTelemetry = useSendTelemetry();
  const { pathname } = useLocation();

  useEffect(() => {
    ConfigurationsActions.list(configType).then(() => {
      const config = getConfig(configType, configuration) ?? {};

      setViewConfig(config);
      setFormConfig(config);
    });
  }, [configuration]);

  const saveConfig = (values: MarkdownConfigType) => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.CONFIGURATIONS.USER_UPDATED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_section: 'markdown',
      app_action_value: 'configuration-save',
    });
    ConfigurationsActions.update(configType, values).then(() => {
      if (
        values.allow_all_image_sources !== viewConfig.allow_all_image_sources ||
        values.allowed_image_sources !== viewConfig.allowed_image_sources
      ) {
        reloadPage();
      } else {
        setShowModal(false);
      }
    });
  };

  const resetConfig = () => {
    setShowModal(false);
    setFormConfig(viewConfig);
  };

  const modalTitle = 'Update Markdown Configuration';

  return (
    <div>
      <h2>Markdown 配置</h2>
      <p>
        这些设置可用于配置产品中不同部分的 Markdown 渲染，包括文本/Markdown 小部件。更改允许的图像源设置后，页面将重新加载以确保其生效。
      </p>

      {!viewConfig ? (
        <Spinner />
      ) : (
        <>
          <StyledDefList>
            <dt>允许来自所有来源的图像:</dt>
            <dd>{viewConfig.allow_all_image_sources ? 'Enabled' : 'Disabled'}</dd>
            <dt>允许的镜像源（逗号分隔）：</dt>
            <dd>{viewConfig.allowed_image_sources || '-'}</dd>
          </StyledDefList>

          <IfPermitted permissions="clusterconfigentry:edit">
            <p>
              <Button
                type="button"
                bsSize="xs"
                bsStyle="info"
                onClick={() => {
                  setShowModal(true);
                }}>
                编辑配置
              </Button>
            </p>
          </IfPermitted>

          <Modal show={showModal && !!formConfig} onHide={resetConfig}>
            <Formik onSubmit={saveConfig} initialValues={formConfig}>
              {({ isSubmitting, values }) => (
                <Form>
                  <Modal.Header>
                    <Modal.Title>{modalTitle}</Modal.Title>
                  </Modal.Header>

                  <Modal.Body>
                    <div>
                      <Row>
                        <Col sm={12}>
                          <FormikInput
                            type="checkbox"
                            name="allow_all_image_sources"
                            id="allow_all_image_sources"
                            label={<LabelSpan>允许来自所有来源的图像</LabelSpan>}
                          />
                          <InputDescription help="如果启用，则可以从所有来源嵌入图像。" />
                        </Col>
                        <Col sm={12}>
                          <FormikInput
                            type="text"
                            name="allowed_image_sources"
                            id="allowed_image_sources"
                            disabled={values.allow_all_image_sources === true}
                            label={<LabelSpan>允许的图像源（逗号分隔）</LabelSpan>}
                          />
                          <InputDescription help="允许用于嵌入 Markdown 文档的图像源。" />
                        </Col>
                      </Row>
                    </div>
                  </Modal.Body>

                  <Modal.Footer>
                    <ModalSubmit
                      onCancel={resetConfig}
                      isSubmitting={isSubmitting}
                      isAsyncSubmit
                      submitLoadingText="更新配置"
                      submitButtonText="更新配置"
                    />
                  </Modal.Footer>
                </Form>
              )}
            </Formik>
          </Modal>
        </>
      )}
    </div>
  );
};

export default MarkdownConfig;
