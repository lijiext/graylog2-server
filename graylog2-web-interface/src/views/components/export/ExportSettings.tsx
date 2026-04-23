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
import { Field } from 'formik';

import type Widget from 'views/logic/widgets/Widget';
import type View from 'views/logic/views/View';
import { Input, HelpBlock, Row } from 'components/bootstrap';
import IfDashboard from 'views/components/dashboard/IfDashboard';
import IfSearch from 'views/components/search/IfSearch';
import ExportFormatSelection from 'views/components/export/ExportFormatSelection';
import FieldsConfiguration from 'views/components/widgets/FieldsConfiguration';

import CustomExportSettings from './CustomExportSettings';

type ExportSettingsType = {
  selectedWidget: Widget | undefined | null;
  view: View;
};

const SelectedWidgetInfo = ({ selectedWidget, view }: { selectedWidget: Widget; view: View }) => {
  const selectedWidgetTitle = view.getWidgetTitleByWidget(selectedWidget);

  return (
    <Row>
      <i>
        <IfSearch>
          {selectedWidget && `The following settings are based on the message table: ${selectedWidgetTitle}`}
          <br />
        </IfSearch>
        <IfDashboard>
          {selectedWidget &&
            `You are currently exporting the search results for the message table: ${selectedWidgetTitle}`}
          <br />
        </IfDashboard>
      </i>
    </Row>
  );
};

const ExportSettings = ({ selectedWidget, view }: ExportSettingsType) => (
  <>
    <Row>
      <ExportFormatSelection />
    </Row>

    {selectedWidget && <SelectedWidgetInfo selectedWidget={selectedWidget} view={view} />}
    <Row>
      <p>
        定义您文件的字段。
        <br />
      </p>
      {selectedWidget && (
        <p>
          导出支持由装饰器创建的字段，这些字段属于消息表，但目前未出现在字段列表中。若要导出已装饰的字段，只需输入其名称即可。
        </p>
      )}
      <p>
        配置完成后，点击 <q>开始下载</q>.
      </p>
    </Row>
    <Row>
      <Field name="selectedFields">
        {({ field: { name, value, onChange } }) => (
          <>
            <label htmlFor={name}>要导出的字段</label>
            <FieldsConfiguration
              onChange={(newFields) =>
                onChange({
                  target: { name, value: newFields.map((field) => ({ field })) },
                })
              }
              selectSize="normal"
              displaySortableListOverlayInPortal
              selectedFields={value.map(({ field }) => field)}
              showSelectAllRest
              showDeSelectAll
              showListCollapseButton
            />
          </>
        )}
      </Field>
    </Row>
    <Row>
      <Field name="limit">
        {({ field: { name, value, onChange } }) => (
          <>
            <label htmlFor={name}>消息限制</label>
            <Input type="number" id={name} name={name} onChange={onChange} min={1} step={1} value={value} />
            <HelpBlock>
              消息以块为单位加载。如果定义了限制，将检索达到限制之前的所有块。这意味着交付的消息总数可能高于定义的限制。
            </HelpBlock>
          </>
        )}
      </Field>
    </Row>

    <CustomExportSettings widget={selectedWidget} />
  </>
);

export default ExportSettings;
