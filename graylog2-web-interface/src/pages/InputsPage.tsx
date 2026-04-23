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

import { DocumentTitle, PageHeader } from 'components/common';
import { InputsList } from 'components/inputs';
import { InputStatesStore } from 'stores/inputs/InputStatesStore';
import useCurrentUser from 'hooks/useCurrentUser';
import AppConfig from 'util/AppConfig';
import { Link } from 'components/common/router';
import Routes from 'routing/Routes';

const isCloud = AppConfig.isCloud();

const InputsPage = () => {
  const currentUser = useCurrentUser();

  useEffect(() => {
    const listInputsInterval = setInterval(InputStatesStore.list, 2000);

    return () => {
      clearInterval(listInputsInterval);
    };
  }, []);

  return (
    <DocumentTitle title="输入端">
      <div>
        <PageHeader title="输入端">
          {isCloud
            ? (
              <>
                <p> Graylog 云通过输入端接收数据。有多种输入端类型可供选择，但只有部分可直接在云端运行。您可以在本页面启动和终止它们。
                </p>
                <p>
                  如果您在此页面的可用输入端列表中缺少某种输入类型，您可以在 <Link to={Routes.pluginRoute('SYSTEM_FORWARDERS')}>转发器</Link>.
                </p>
              </>
            )
            : <span>Graylog 节点通过输入端接收数据。在此处可启动或终止任意数量的输入端。</span>}
        </PageHeader>
        <InputsList permissions={currentUser.permissions} />
      </div>
    </DocumentTitle>
  );
};

export default InputsPage;
