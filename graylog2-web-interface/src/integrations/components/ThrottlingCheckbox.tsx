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

import { Input } from 'components/bootstrap';
import useProductName from 'brand-customization/useProductName';

type Props = {
  id: string;
  defaultChecked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const ThrottlingCheckbox = ({ id, defaultChecked, onChange }: Props) => {
  const productName = useProductName();

  return (
    <Input
      id={id}
      type="checkbox"
      value="enable-throttling"
      defaultChecked={defaultChecked}
      onChange={onChange}
      label="启用限流"
      help={`如果启用，直到 ${productName} 服务器追上其消息负载之前，此输入将不会读取新消息。这通常适用于从文件或消息队列系统（如 AMQP 或 Kafka）读取的输入。如果您定期轮询外部系统（例如通过 HTTP），通常应将其禁用。`}
    />
  );
};

export default ThrottlingCheckbox;
