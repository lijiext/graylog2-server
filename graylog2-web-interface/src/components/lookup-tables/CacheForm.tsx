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
import isEmpty from 'lodash/isEmpty';
import { Formik, Form } from 'formik';
import { PluginStore } from 'graylog-web-plugin/plugin';
import type { LookupTableCache, validationErrorsType } from 'src/logic/lookup-tables/types';

import { Col, Row } from 'components/bootstrap';
import { FormikFormGroup, FormSubmit } from 'components/common';
import { LookupTableCachesActions } from 'stores/lookup-tables/LookupTableCachesStore';
import useScopePermissions from 'hooks/useScopePermissions';
import Routes from 'routing/Routes';
import useHistory from 'routing/useHistory';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';

type TitleProps = {
  title: string,
  typeName: string,
  create: boolean,
};

const Title = ({ title, typeName, create }: TitleProps) => {
  const TagName = create ? 'h3' : 'h2';

  return (
    <TagName style={{ marginBottom: '12px' }}>
      {title} <small>({typeName})</small>
    </TagName>
  );
};

const INIT_CACHE: LookupTableCache = {
  id: undefined,
  title: '',
  description: '',
  name: '',
  config: {},
};

type Props = {
  type: string,
  saved: () => void,
  title: string,
  create?: boolean,
  cache?: LookupTableCache,
  validate?: (arg: LookupTableCache) => void,
  validationErrors?: validationErrorsType,
};

const CacheForm = ({ type, saved, title, create, cache, validate, validationErrors }: Props) => {
  const configRef = React.useRef(null);
  const [generateName, setGenerateName] = React.useState<boolean>(create);
  const { loadingScopePermissions, scopePermissions } = useScopePermissions(cache);
  const sendTelemetry = useSendTelemetry();

  const plugin = React.useMemo(() => PluginStore.exports('lookupTableCaches').find((p) => p.type === type), [type]);

  const pluginName = React.useMemo(() => (plugin.displayName || type), [plugin, type]);
  const DocComponent = React.useMemo(() => (plugin.documentationComponent), [plugin]);
  const configFieldSet = React.useMemo(() => {
    if (plugin) {
      return React.createElement(
        plugin.formComponent, { config: cache.config, ref: configRef },
      );
    }

    return null;
  }, [plugin, cache.config]);

  const sanitizeName = (inName: string) => inName.trim().replace(/\W+/g, '-').toLocaleLowerCase();

  const handleTitleChange = (values: LookupTableCache, setValues: any) => (event: React.BaseSyntheticEvent) => {
    if (!generateName) return;
    const safeName = sanitizeName(event.target.value);

    setValues({
      ...values,
      title: event.target.value,
      name: safeName,
    });
  };

  const handleValidation = (values: LookupTableCache) => {
    const errors: any = {};

    if (!values.title) errors.title = 'Required';

    if (!values.name) {
      errors.name = 'Required';
    } else {
      validate(values);
    }

    if (values.config.type !== 'none') {
      const confErrors = configRef.current?.validate() || {};
      if (!isEmpty(confErrors)) errors.config = confErrors;
    }

    return errors;
  };

  const handleSubmit = (values: LookupTableCache) => {
    const promise = create
      ? LookupTableCachesActions.create(values)
      : LookupTableCachesActions.update(values);

    return promise.then(() => {
      sendTelemetry(TELEMETRY_EVENT_TYPE.LUT[create ? 'CACHE_CREATED' : 'CACHE_UPDATED'], {
        app_pathname: 'lut',
        app_section: 'lut_cache',
        event_details: {
          type: values?.config?.type,
        },
      });

      saved();
    });
  };

  const history = useHistory();
  const onCancel = () => history.push(Routes.SYSTEM.LOOKUPTABLES.CACHES.OVERVIEW);
  const updatable = !create && !loadingScopePermissions && scopePermissions?.is_mutable;

  return (
    <>
      <Title title={title} typeName={pluginName} create={create} />
      <Row>
        <Col lg={6} style={{ marginTop: 10 }}>
          <Formik initialValues={{ ...INIT_CACHE, ...cache }}
                  validate={handleValidation}
                  validateOnBlur
                  validateOnChange={false}
                  validateOnMount={!create}
                  onSubmit={handleSubmit}
                  enableReinitialize>
            {({ errors, values, setValues, isSubmitting }) => (
              <Form className="form form-horizontal">
                <fieldset>
                  <FormikFormGroup type="text"
                                   name="title"
                                   label="* 标题"
                                   required
                                   help={errors.title ? null : '此缓存的简短标题。'}
                                   onChange={handleTitleChange(values, setValues)}
                                   autoFocus
                                   labelClassName="col-sm-3"
                                   wrapperClassName="col-sm-9" />
                  <FormikFormGroup type="text"
                                   name="description"
                                   label="描述"
                                   help="缓存描述。"
                                   labelClassName="col-sm-3"
                                   wrapperClassName="col-sm-9" />
                  <FormikFormGroup type="text"
                                   name="name"
                                   label="* 名称"
                                   required
                                   error={validationErrors.name ? validationErrors.name[0] : null}
                                   onChange={() => setGenerateName(false)}
                                   help={
                                    (errors.name || validationErrors.name)
                                      ? null
                                      : '用于引用此缓存的名称。必须唯一。'
                                  }
                                   labelClassName="col-sm-3"
                                   wrapperClassName="col-sm-9" />

                </fieldset>
                {configFieldSet}
                <fieldset>
                  <Row>
                    <Col mdOffset={3} sm={12}>
                      {create && (
                        <FormSubmit submitButtonText="创建缓存"
                                    submitLoadingText="正在创建缓存..."
                                    isSubmitting={isSubmitting}
                                    isAsyncSubmit
                                    onCancel={onCancel} />
                      )}
                      {updatable && (
                        <FormSubmit submitButtonText="更新缓存"
                                    submitLoadingText="正在更新缓存..."
                                    isAsyncSubmit
                                    isSubmitting={isSubmitting}
                                    onCancel={onCancel} />
                      )}
                    </Col>
                  </Row>
                </fieldset>
              </Form>
            )}
          </Formik>
        </Col>
        <Col lg={6} style={{ marginTop: 10 }}>{DocComponent ? <DocComponent /> : null}</Col>
      </Row>
    </>
  );
};

CacheForm.defaultProps = {
  create: true,
  cache: INIT_CACHE,
  validate: null,
  validationErrors: {},
};

export default CacheForm;
