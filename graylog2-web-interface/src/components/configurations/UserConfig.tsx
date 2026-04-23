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
import { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Form, Formik } from 'formik';
import type { UserConfigType } from 'src/stores/configurations/ConfigurationsStore';

import { useStore } from 'stores/connect';
import type { Store } from 'stores/StoreTypes';
import { ConfigurationsActions, ConfigurationsStore } from 'stores/configurations/ConfigurationsStore';
import { getConfig } from 'components/configurations/helpers';
import { ConfigurationType } from 'components/configurations/ConfigurationTypes';
import { Button, Col, Modal, Row } from 'components/bootstrap';
import FormikInput from 'components/common/FormikInput';
import Spinner from 'components/common/Spinner';
import { InputDescription, ModalSubmit, IfPermitted, ISODurationInput } from 'components/common';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { getPathnameWithoutId } from 'util/URLUtils';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

const StyledDefList = styled.dl.attrs({ className: 'deflist' })(
  ({ theme }) => css`
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

const UserConfig = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [viewConfig, setViewConfig] = useState<UserConfigType | undefined>(undefined);
  const [formConfig, setFormConfig] = useState<UserConfigType | undefined>(undefined);
  const configuration = useStore(ConfigurationsStore as Store<Record<string, any>>, (state) => state?.configuration);

  const sendTelemetry = useSendTelemetry();
  const { pathname } = useLocation();

  useEffect(() => {
    ConfigurationsActions.listUserConfig(ConfigurationType.USER_CONFIG).then(() => {
      const config = getConfig(ConfigurationType.USER_CONFIG, configuration);

      setViewConfig(config);
      setFormConfig({ ...config, restrict_access_token_to_admins: !config?.restrict_access_token_to_admins });
    });
  }, [configuration]);

  const saveConfig = (values: UserConfigType) => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.CONFIGURATIONS.USER_UPDATED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_section: 'user',
      app_action_value: 'configuration-save',
    });
    const newConfig = { ...values, restrict_access_token_to_admins: !values?.restrict_access_token_to_admins };

    ConfigurationsActions.update(ConfigurationType.USER_CONFIG, newConfig).then(() => {
      setShowModal(false);
    });
  };

  const resetConfig = () => {
    setShowModal(false);
    setFormConfig(viewConfig);
  };

  const timeoutIntervalValidator = (milliseconds: number) => milliseconds >= 1000;
  const defaultTokenTtlValidator = (milliseconds: number) => milliseconds >= 86400000;

  const modalTitle = 'Update User Configuration';

  return (
    <div>
      <h2>用户配置</h2>
      <p>这些设置可用于设置全局会话超时值。</p>

      {!viewConfig ? (
        <Spinner />
      ) : (
        <>
          <StyledDefList>
            <dt>全局会话超时：</dt>
            <dd>{viewConfig.enable_global_session_timeout ? 'Enabled' : 'Disabled'}</dd>
            <dt>超时间隔:</dt>
            <dd>{viewConfig.enable_global_session_timeout ? viewConfig.global_session_timeout_interval : '-'}</dd>
            <dt>允许用户创建个人访问令牌: </dt>
            <dd>{!viewConfig.restrict_access_token_to_admins ? 'Enabled' : 'Disabled'}</dd>
            <dt>允许外部用户使用访问令牌: </dt>
            <dd>{viewConfig.allow_access_token_for_external_user ? 'Enabled' : 'Disabled'}</dd>
            <dt>新令牌的默认 TTL:</dt>
            <dd>{viewConfig.default_ttl_for_new_tokens ? viewConfig.default_ttl_for_new_tokens : '-'}</dd>
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
              {({ isSubmitting, values, setFieldValue }) => (
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
                            name="enable_global_session_timeout"
                            id="enable_global_session_timeout"
                            label={<LabelSpan>启用全局会话超时</LabelSpan>}
                          />
                          <InputDescription help="如果启用，它将设置为所有用户。" />
                        </Col>
                        <Col sm={12}>
                          <fieldset>
                            <ISODurationInput
                              id="global_session_timeout_interval"
                              duration={values.global_session_timeout_interval}
                              update={(value) => setFieldValue('global_session_timeout_interval', value)}
                              label="全局会话超时间隔（以 ISO8601 时长格式表示）"
                              help="会话将在该时间段后自动结束，除非它们正在被使用。例如，60 秒：PT60S，60 分钟：PT60M"
                              validator={timeoutIntervalValidator}
                              errorText="invalid (min: 1 second)"
                              disabled={!values.enable_global_session_timeout}
                              required
                            />
                          </fieldset>
                        </Col>
                        <Col sm={12}>
                          <FormikInput
                            type="checkbox"
                            name="restrict_access_token_to_admins"
                            id="restrict_access_token_to_admins"
                            label={<LabelSpan>允许用户创建个人访问令牌</LabelSpan>}
                          />
                          <InputDescription help="启用后，将允许用户创建访问令牌。" />
                        </Col>
                        <Col sm={12}>
                          <FormikInput
                            type="checkbox"
                            name="allow_access_token_for_external_user"
                            id="allow_access_token_for_external_user"
                            label={<LabelSpan>允许外部用户使用访问令牌</LabelSpan>}
                          />
                          <InputDescription help="如果启用，将允许外部用户创建访问令牌。" />
                        </Col>
                        <Col sm={12}>
                          <fieldset>
                            <ISODurationInput
                              id="default_ttl_for_new_tokens"
                              duration={values.default_ttl_for_new_tokens}
                              update={(value) => setFieldValue('default_ttl_for_new_tokens', value)}
                              label="新令牌的默认TTL（以ISO8601持续时间格式）"
                              help="令牌将在该时间后自动失效。例如，24 小时：PT24H，30 天：P30D"
                              validator={defaultTokenTtlValidator}
                              errorText="invalid (min: 1 day)"
                              disabled={!values.default_ttl_for_new_tokens}
                              required
                            />
                          </fieldset>
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

export default UserConfig;
