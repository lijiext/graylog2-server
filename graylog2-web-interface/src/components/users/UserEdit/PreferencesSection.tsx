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
import { Formik, Form } from 'formik';

import { PREFERENCES_THEME_MODE } from 'theme/constants';
import { Button, Row, Col, Input } from 'components/bootstrap';
import { FormikFormGroup, ReadOnlyFormGroup } from 'components/common';
import SectionComponent from 'components/common/Section/SectionComponent';
import type User from 'logic/users/User';
import type { PreferencesUpdateMap } from 'stores/users/PreferencesStore';
import { PreferencesActions } from 'stores/users/PreferencesStore';

type Props = {
  user: User,
};

const PreferencesSection = ({ user }: Props) => {
  const onSubmit = (data: PreferencesUpdateMap) => PreferencesActions.saveUserPreferences(user.username, data);

  return (
    <SectionComponent title="首选项">
      <Formik<PreferencesUpdateMap> onSubmit={onSubmit}
                                    initialValues={user.preferences}>
        {({ isSubmitting, isValid }) => (
          <Form className="form form-horizontal">
            <Input id="timeout-controls"
                   labelClassName="col-sm-3"
                   wrapperClassName="col-sm-9"
                   label="搜索自动补全">
              <FormikFormGroup label="启用自动补全"
                               name="enableSmartSearch"
                               formGroupClassName="form-group no-bm"
                               type="checkbox" />
            </Input>

            <Input id="update-unfocused-controls"
                   labelClassName="col-sm-3"
                   wrapperClassName="col-sm-9"
                   label="更新未聚焦">
              <FormikFormGroup label="更新未聚焦"
                               name="updateUnfocussed"
                               formGroupClassName="form-group no-bm"
                               type="checkbox" />
            </Input>

            <Input id="search-sidebar-controls"
                   labelClassName="col-sm-3"
                   wrapperClassName="col-sm-9"
                   label="搜索侧边栏">
              <FormikFormGroup label="已固定"
                               name="searchSidebarIsPinned"
                               formGroupClassName="form-group no-bm"
                               type="checkbox"
                               help="也可以通过使用搜索侧边栏的固定图标进行更改" />
            </Input>

            <Input id="dashboard-sidebar-controls"
                   labelClassName="col-sm-3"
                   wrapperClassName="col-sm-9"
                   label="仪表盘侧边栏">
              <FormikFormGroup label="已固定"
                               name="dashboardSidebarIsPinned"
                               formGroupClassName="form-group no-bm"
                               type="checkbox"
                               help="也可以通过使用仪表盘侧边栏的固定图标进行更改" />
            </Input>

            <ReadOnlyFormGroup label="主题模式"
                               value={user.preferences?.[PREFERENCES_THEME_MODE] ?? 'Not configured'}
                               help="可以通过使用用户下拉菜单中的切换按钮进行更改" />

            <Row className="no-bm">
              <Col xs={12}>
                <div className="pull-right">
                  <Button bsStyle="success"
                          disabled={isSubmitting || !isValid}
                          title="更新首选项"
                          type="submit">
                    更新首选项
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

export default PreferencesSection;
