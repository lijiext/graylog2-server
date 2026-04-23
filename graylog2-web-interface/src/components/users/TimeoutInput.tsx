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
import { useState } from 'react';

import { Row, Col, HelpBlock, Input, Alert } from 'components/bootstrap';
import TimeoutUnitSelect from 'components/users/TimeoutUnitSelect';

import { MS_DAY, MS_HOUR, MS_MINUTE, MS_SECOND } from './timeoutConstants';

type Props = {
  value?: number;
  onChange?: (value: number) => void;
};

const _estimateUnit = (value: number): number => {
  if (value === 0) {
    return MS_SECOND;
  }

  if (value % MS_DAY === 0) {
    return MS_DAY;
  }

  if (value % MS_HOUR === 0) {
    return MS_HOUR;
  }

  if (value % MS_MINUTE === 0) {
    return MS_MINUTE;
  }

  return MS_SECOND;
};

const TimeoutInput = ({ value: propsValue = MS_HOUR, onChange = () => {} }: Props) => {
  const [sessionTimeoutNever, setSessionTimeoutNever] = useState(propsValue === -1);
  const [unit, setUnit] = useState(_estimateUnit(propsValue));
  const [value, setValue] = useState(propsValue ? Math.floor(propsValue / Number(unit)) : 0);

  const _onClick = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setSessionTimeoutNever(evt.target.checked);

    if (onChange && evt.target.checked) {
      onChange(-1);
    }
  };

  const _onChangeValue = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(evt.target.value));

    if (onChange) {
      onChange(Number(evt.target.value) * Number(unit));
    }
  };

  const _onChangeUnit = (newUnit: number) => {
    setUnit(newUnit);

    if (onChange) {
      onChange(value * Number(newUnit));
    }
  };

  return (
    <Input id="timeout-controls" labelClassName="col-sm-3" wrapperClassName="col-sm-9" label="会话超时">
      <Row className="no-bm">
        <Col xs={12}>
          <Alert bsStyle="info" title="更改会话超时时间">
            更改会话的超时设置将注销用户并使其所有当前会话失效。如果您正在更改自己用户的设置，保存设置时您将立即被注销。在这种情况下，请在更改超时前确保保存任何待处理的更改。
          </Alert>
        </Col>
      </Row>
      <>
        <Input
          type="checkbox"
          id="session-timeout-never"
          name="session_timeout_never"
          label="会话不会超时"
          help="选中后，会话将不会因不活动而超时。"
          formGroupClassName="no-bm"
          onChange={_onClick}
          checked={sessionTimeoutNever}
        />

        <div className="clearfix">
          <Col xs={2}>
            <Input
              type="number"
              id="timeout"
              placeholder="超时时长"
              name="timeout"
              min={1}
              formGroupClassName="form-group no-bm"
              disabled={sessionTimeoutNever}
              value={value}
              onChange={_onChangeValue}
            />
          </Col>
          <Col xs={4}>
            <TimeoutUnitSelect disabled={sessionTimeoutNever} value={String(unit)} onChange={_onChangeUnit} />
          </Col>
          <Row className="no-bm">
            <Col xs={12}>
              <HelpBlock>会话将在该时间段后自动结束，除非它们处于活动状态。</HelpBlock>
            </Col>
          </Row>
        </div>
      </>
    </Input>
  );
};

export default TimeoutInput;
