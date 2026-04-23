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
import React, { useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';

import { IfPermitted, Select, TimeUnitInput, ModalSubmit } from 'components/common';
import { Button, Col, Input, Modal, Row } from 'components/bootstrap';
import FormikInput from 'components/common/FormikInput';
import { DocumentationLink } from 'components/support';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

export type GeoVendorType = 'MAXMIND' | 'IPINFO'
export type TimeUnit = 'SECONDS' | 'MINUTES' | 'HOURS' | 'DAYS'

export type GeoIpConfigType = {
  enabled: boolean;
  enforce_graylog_schema: boolean;
  db_vendor_type: GeoVendorType;
  city_db_path: string;
  asn_db_path: string;
  refresh_interval_unit: TimeUnit;
  refresh_interval: number;
  use_s3: boolean;
}

export type OptionType = {
  value: string;
  label: string;
}

type Props = {
  config: GeoIpConfigType,
  updateConfig: (config: GeoIpConfigType) => Promise<GeoIpConfigType>,
};

const defaultConfig: GeoIpConfigType = {
  enabled: false,
  enforce_graylog_schema: true,
  db_vendor_type: 'MAXMIND',
  city_db_path: '/etc/graylog/server/GeoLite2-City.mmdb',
  asn_db_path: '/etc/graylog/server/GeoLite2-ASN.mmdb',
  refresh_interval_unit: 'MINUTES',
  refresh_interval: 10,
  use_s3: false,
};

const GeoIpResolverConfig = ({ config = defaultConfig, updateConfig }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [curConfig, setCurConfig] = useState(() => ({ ...defaultConfig }));

  const sendTelemetry = useSendTelemetry();

  useEffect(() => {
    setCurConfig({ ...config });
  }, [config]);

  const resetConfig = () => {
    setCurConfig(config);
    setShowModal(false);
  };

  const handleSubmit = (values: GeoIpConfigType) => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.CONFIGURATIONS.GEOLOCATION_CONFIGURATION_UPDATED, {
      app_pathname: 'configurations',
      app_section: 'geolocation-processor',
    });

    return updateConfig(values)
      .then((value: GeoIpConfigType) => {
        if ('enabled' in value) {
          setShowModal(false);
        }
      });
  };

  const availableVendorTypes = (): OptionType[] => [
    { value: 'MAXMIND', label: 'MaxMind GeoIP' },
    { value: 'IPINFO', label: 'IPInfo Standard Location' },
  ];

  const activeVendorType = (type: GeoVendorType) => availableVendorTypes().filter((t) => t.value === type)[0].label;

  const modalTitle = 'Update Geo-Location Processor Configuration';

  return (
    <div>
      <h3>地理位置处理器配置</h3>

      <p>
        地理位置处理器插件扫描所有消息以查找包含以下内容的字段 <strong>exclusively</strong> 一个 IP 地址，并将其地理位置信息（坐标、ISO 国家代码和城市名称）放入不同的字段。更多信息请阅读 <DocumentationLink page="geolocation" text="Graylog documentation" />.
      </p>

      <dl className="deflist">
        <dt>已启用：</dt>
        <dd>{config.enabled === true ? 'Yes' : 'No'}</dd>
        {config.enabled && (
          <>
            <dt>强制执行 Graylog 默认架构：</dt>
            <dd>{config.enforce_graylog_schema === true ? 'Yes' : 'No'}</dd>
            <dt>数据库供应商类型：</dt>
            <dd>{activeVendorType(config.db_vendor_type)}</dd>
            <dt>城市数据库路径：</dt>
            <dd>{config.city_db_path}</dd>
            <dt>ASN 数据库路径：</dt>
            <dd>{config.asn_db_path === '' ? '-' : config.asn_db_path}</dd>
            <dt>数据库刷新间隔：</dt>
            <dd>{config.refresh_interval} {config.refresh_interval_unit}</dd>
            <dt>从 S3 存储桶拉取文件：</dt>
            <dd>{config.use_s3 === true ? 'Yes' : 'No'}</dd>
          </>
        )}
      </dl>

      <IfPermitted permissions="clusterconfigentry:edit">
        <Button bsStyle="info"
                bsSize="xs"
                onClick={() => {
                  setShowModal(true);
                }}>
          编辑配置
        </Button>
      </IfPermitted>
      <Modal show={showModal}
             onHide={resetConfig}
             aria-modal="true"
             aria-labelledby="dialog_label">
        <Formik onSubmit={handleSubmit} initialValues={curConfig}>
          {({ values, setFieldValue, isSubmitting }) => (
            <Form>
              <Modal.Header>
                <Modal.Title id="dialog_label">{modalTitle}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={6}>
                    <FormikInput id="enabled"
                                 type="checkbox"
                                 label="启用地理位置处理器"
                                 name="enabled" />
                  </Col>
                  <Col sm={6}>
                    <FormikInput id="enforce_graylog_schema"
                                 type="checkbox"
                                 disabled={!values.enabled}
                                 label="强制执行 Graylog 默认架构"
                                 name="enforce_graylog_schema" />
                  </Col>
                </Row>
                <Field id="db_vendor_type_select"
                       name="db_vendor_type_field">
                  {() => (
                    <Input id="db_vendor_type_input"
                           label="选择 GeoIP 数据库供应商">
                      <Select id="db_vendor_type"
                              name="db_vendor_type"
                              clearable={false}
                              placeholder="选择 GeoIP 数据库供应商"
                              required
                              disabled={!values.enabled}
                              options={availableVendorTypes()}
                              matchProp="label"
                              value={values.db_vendor_type}
                              onChange={(option) => {
                                setFieldValue('db_vendor_type', option);
                              }} />
                    </Input>
                  )}
                </Field>
                <FormikInput id="city_db_path"
                             type="text"
                             disabled={!values.enabled}
                             label="城市数据库路径"
                             name="city_db_path"
                             required />
                <FormikInput id="asn_db_path"
                             type="text"
                             disabled={!values.enabled}
                             label="ASN 数据库路径"
                             name="asn_db_path" />
                <TimeUnitInput label="数据库刷新间隔"
                               update={(value, unit) => {
                                 setFieldValue('refresh_interval', value);
                                 setFieldValue('refresh_interval_unit', unit);
                               }}
                               help="检查数据库文件是否被修改并在磁盘上检测到刷新更改的间隔。"
                               value={values.refresh_interval}
                               unit={values.refresh_interval_unit || 'MINUTES'}
                               defaultEnabled={values.enabled}
                               enabled={values.enabled}
                               hideCheckbox
                               units={['SECONDS', 'MINUTES', 'HOURS', 'DAYS']} />

                <Row>
                  <Col sm={6}>
                    <FormikInput id="use_s3"
                                 type="checkbox"
                                 disabled={!values.enabled}
                                 label="从 S3 存储桶拉取文件"
                                 name="use_s3" />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <ModalSubmit onCancel={resetConfig}
                             isSubmitting={isSubmitting}
                             isAsyncSubmit
                             submitButtonText="更新配置"
                             submitLoadingText="正在更新配置..." />
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default GeoIpResolverConfig;
