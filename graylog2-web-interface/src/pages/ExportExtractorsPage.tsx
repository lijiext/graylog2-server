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
import React, { useEffect } from 'react';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import ExportExtractors from 'components/extractors/ExportExtractors';
import { InputsActions, InputsStore } from 'stores/inputs/InputsStore';
import useParams from 'routing/useParams';
import { useStore } from 'stores/connect';

const ExportExtractorsPage = () => {
  const { inputId } = useParams();
  const { input } = useStore(InputsStore);

  useEffect(() => {
    InputsActions.get.triggerPromise(inputId);
  }, [inputId]);

  if (!input) {
    return <Spinner />;
  }

  return (
    <DocumentTitle title={`导出 ${input.title} 的提取器`}>
      <div>
        <PageHeader title={<span>导出提取器 <em>{input.title}</em></span>}>
          <span>
            输入的提取器可以导出为 JSON，以便导入到其他设置或共享 <a href="https://marketplace.graylog.org/" rel="noopener noreferrer" target="_blank">Graylog 应用市场</a>.
          </span>
        </PageHeader>
        <ExportExtractors id={input.id} />
      </div>
    </DocumentTitle>
  );
};

export default ExportExtractorsPage;
