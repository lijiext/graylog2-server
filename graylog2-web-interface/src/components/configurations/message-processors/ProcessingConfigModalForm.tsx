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
import styled, { css } from 'styled-components';
import { Form, Formik } from 'formik';

import { getValueFromInput } from 'util/FormsUtils';
import { ConfigurationsActions } from 'stores/configurations/ConfigurationsStore';
import { ConfigurationType } from 'components/configurations/ConfigurationTypes';
import { Alert, Table, Modal } from 'components/bootstrap';
import { FormikInput, ModalSubmit, SortableList } from 'components/common';
import * as ISODurationUtils from 'util/ISODurationUtils';
import type { FormConfig, Processor } from 'components/configurations/message-processors/Types';
import MessageProcessorStatusFormGroup from 'components/configurations/message-processors/MessageProcessorStatusFormGroup';

type Props = {
  closeModal: () => void,
  formConfig: FormConfig,
};

const LabelSpan = styled.span(({ theme }) => css`
  margin-left: ${theme.spacings.sm};
  font-weight: bold;
`);

const ProcessingConfigModalForm = ({ closeModal, formConfig }: Props) => {
  const futureTimestampNormalizationHelpText = "启用对指定时间显著早于 Graylog 自身系统时间的时间戳进行规范化。这通常发生在日志源运行在系统时钟不正确的服务器上时。未来时间戳将被规范化以匹配其首次被 Graylog 转发器或 Graylog 接收的时间。在使用 Warm Tier 时，防止未来时间戳非常重要，否则可能会降低性能。";
  const hasNoActiveProcessor = () => formConfig.disabled_processors.length >= formConfig.processor_order.length;

  const saveConfig = (values: FormConfig) => {
    if (!hasNoActiveProcessor()) {
      const { processor_order, disabled_processors, grace_period } = values;

      Promise.allSettled([
        ConfigurationsActions.updateMessageProcessorsConfig(ConfigurationType.MESSAGE_PROCESSORS_CONFIG, { processor_order, disabled_processors }),
        ConfigurationsActions.update(ConfigurationType.GLOBAL_PROCESSING_RULE_CONFIG, { grace_period }),
      ]).then(() => {
        closeModal();
      });
    }
  };

  const updateSorting = (newSorting: Array<{id: string, title: string}>, setFieldValue: (key: string, value: Array<Processor>) => void) => {
    const processorOrder = newSorting.map((item) => ({ class_name: item.id, name: item.title }));

    setFieldValue('processor_order', processorOrder);
  };

  const sortableItems = (formValues: FormConfig) => formValues.processor_order.map((processor) => ({ id: processor.class_name, title: processor.name }));

  const handleEnableFutureTimestampNormalisation = (enabled: boolean, setFieldValue: (key: string, value: string) => void) => {
    if (enabled) {
      setFieldValue('grace_period', formConfig?.grace_period || 'P2D');
    } else {
      setFieldValue('grace_period', undefined);
    }
  };

  const gracePeriodValidator = (milliseconds: number) => milliseconds >= 60 * 1000;

  const validateGracePeriodField = (enabled: boolean) => (value: string) => {
    let errorMessage = '';

    if (enabled && !ISODurationUtils.isValidDuration(value, gracePeriodValidator)) {
      errorMessage = 'Grace Period is invalid';
    }

    return errorMessage;
  };

  return (
    <Modal show
           data-testid="config-modal"
           onHide={closeModal}>
      <Formik onSubmit={saveConfig} initialValues={formConfig}>
        {({ isSubmitting, values, setFieldValue, isValid }) => (
          <Form>
            <Modal.Header closeButton>
              <Modal.Title id="dialog_label">更新消息处理器配置</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <>
                <h2>全局处理规则配置</h2>
                <FormikInput type="checkbox"
                             name="enableFutureTimestampNormalization"
                             id="enableFutureTimestampNormalization"
                             help={futureTimestampNormalizationHelpText}
                             onChange={(event) => handleEnableFutureTimestampNormalisation(getValueFromInput(event.target), setFieldValue)}
                             label={(
                               <LabelSpan>未来时间戳规范化</LabelSpan>
                               )} />
                <FormikInput type="text"
                             name="grace_period"
                             id="grace_period"
                             placeholder="P2D"
                             label="宽限期"
                             disabled={!values?.enableFutureTimestampNormalization}
                             help="如果启用未来时间戳规范化，则指定时间超过 Graylog 自身系统时间且超过宽限期间隔的时间戳将被规范化。"
                             addonAfter={values.enableFutureTimestampNormalization ? ISODurationUtils.formatDuration(values.grace_period, gracePeriodValidator, 'invalid') : ''}
                             validate={validateGracePeriodField(values.enableFutureTimestampNormalization)}
                             required />
                <h2>消息处理器配置</h2>
                <h3>排序</h3>
                <p>使用拖放功能更改消息处理器的执行顺序。</p>
                <SortableList items={sortableItems(values)}
                              onMoveItem={(newSorting) => updateSorting(newSorting, setFieldValue)}
                              displayOverlayInPortal />
                <h3>状态</h3>
                <p>更改复选框以更改消息处理器的状态。</p>
                <Table striped bordered condensed className="top-margin">
                  <thead>
                    <tr>
                      <th>消息处理器</th>
                      <th>已启用</th>
                    </tr>
                  </thead>
                  <tbody>
                    <MessageProcessorStatusFormGroup />
                  </tbody>
                </Table>
                {hasNoActiveProcessor() && (
                <Alert bsStyle="danger" title="错误">
                  无活动的消息处理器！
                </Alert>
                )}
              </>
            </Modal.Body>
            <Modal.Footer>
              <ModalSubmit onCancel={closeModal}
                           isSubmitting={isSubmitting}
                           disabledSubmit={!isValid}
                           isAsyncSubmit
                           submitLoadingText="更新配置"
                           submitButtonText="更新配置" />
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ProcessingConfigModalForm;
