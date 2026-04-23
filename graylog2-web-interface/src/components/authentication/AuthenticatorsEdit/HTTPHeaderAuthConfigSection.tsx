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
import { Formik, Form } from 'formik';

import Routes from 'routing/Routes';
import type HTTPHeaderAuthConfig from 'logic/authentication/HTTPHeaderAuthConfig';
import HTTPHeaderAuthConfigDomain from 'domainActions/authentication/HTTPHeaderAuthConfigDomain';
import { Input, Button, Col, Row, Alert } from 'components/bootstrap';
import { FormikFormGroup, ErrorAlert, Spinner } from 'components/common';
import SectionComponent from 'components/common/Section/SectionComponent';
import useHistory from 'routing/useHistory';
import type { HTTPHeaderAuthConfigJSON } from 'logic/authentication/HTTPHeaderAuthConfig';
import { getPathnameWithoutId } from 'util/URLUtils';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import useProductName from 'brand-customization/useProductName';

const HTTPHeaderAuthConfigSection = () => {
  const [submitError, setSubmitError] = useState<string | undefined>();
  const productName = useProductName();

  const [loadedConfig, setLoadedConfig] = useState<HTTPHeaderAuthConfig | undefined | void>();
  const sectionTitle = 'Trusted Header Authentication';
  const history = useHistory();
  const { pathname } = useLocation();
  const sendTelemetry = useSendTelemetry();

  const _onSubmit = (data: HTTPHeaderAuthConfigJSON) => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.AUTHENTICATION.CONFIG_UPDATED, {
      app_pathname: getPathnameWithoutId(pathname),
      app_section: 'authenticator-trustedheader',
      app_action_value: 'config-update',
    });

    setSubmitError(undefined);

    return HTTPHeaderAuthConfigDomain.update(data)
      .then(() => {
        history.push(Routes.SYSTEM.AUTHENTICATION.AUTHENTICATORS.SHOW);
      })
      .catch((error) => {
        setSubmitError(error.additional?.res?.text);
      });
  };

  useEffect(() => {
    HTTPHeaderAuthConfigDomain.load().then(setLoadedConfig);
  }, []);

  if (!loadedConfig) {
    return (
      <SectionComponent title={sectionTitle}>
        <Spinner />
      </SectionComponent>
    );
  }

  return (
    <SectionComponent title={sectionTitle}>
      <p>此身份验证器允许您基于 HTTP 头登录用户，无需进一步交互。</p>
      <Formik onSubmit={_onSubmit} initialValues={loadedConfig.toJSON()}>
        {({ isSubmitting, isValid }) => (
          <Form className="form form-horizontal">
            <Input id="enable-http-header-auth" labelClassName="col-sm-3" wrapperClassName="col-sm-9" label="已启用">
              <FormikFormGroup
                label="通过 HTTP 头启用单点登录"
                name="enabled"
                formGroupClassName="form-group no-bm"
                wrapperClassName="col-xs-12"
                type="checkbox"
              />
            </Input>
            <FormikFormGroup
              label="用户名头"
              name="username_header"
              required
              help="包含隐式信任的用户名的 HTTP 请求头。（请求头匹配不区分大小写）"
            />
            <Row>
              <Col mdOffset={3} md={9}>
                <Alert bsStyle="info">
                  请配置 <code>trusted_proxies</code> 设置中的 {productName} 服务器配置文件。
                </Alert>
              </Col>
            </Row>
            <ErrorAlert runtimeError>{submitError}</ErrorAlert>
            <Row className="no-bm">
              <Col xs={12}>
                <div className="pull-right">
                  <Button bsStyle="primary" disabled={isSubmitting || !isValid} title="更新配置" type="submit">
                    更新配置
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </SectionComponent>
  );
};

export default HTTPHeaderAuthConfigSection;
