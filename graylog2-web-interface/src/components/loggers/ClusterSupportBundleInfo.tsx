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
/// <reference path="./types.ts" />
import * as React from 'react';

import usePluginEntities from 'hooks/usePluginEntities';

export const UnlicensedText = () => (
  <>
    <strong>
      在共享之前，请仔细检查捆绑包的内容。它可能包含敏感数据，如 IP 地址、主机名甚至密码！
    </strong>
    <br />
    只有付费许可用户才有权使用 Graylog 企业支持。不过，您可以使用此文件进行其他调试手段。
  </>
);

const ClusterSupportBundleInfo = () => {
  const pluginLogger = usePluginEntities('supportBundle');
  const InfoComponent = pluginLogger[0]?.EnterpriseSupportBundleInfo || UnlicensedText;

  return (
    <p className="description">
      创建一个包含来自 Graylog 集群的有用调试信息的 zip 文件。
      <br />
      Graylog 企业版客户可以将捆绑包附加到其支持工单中，这将帮助 Graylog 技术支持团队分析和诊断问题。
      <br />
      <br />
      {InfoComponent && <InfoComponent />}
    </p>
  );
};

export default ClusterSupportBundleInfo;
