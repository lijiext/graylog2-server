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

import { DocumentationLink } from 'components/support';
import MigrationDatanodeList from 'components/datanode/migrations/MigrationDatanodeList';
import useDataNodes from 'components/datanode/hooks/useDataNodes';

import MigrationStepTriggerButtonToolbar from '../common/MigrationStepTriggerButtonToolbar';
import type { MigrationStepComponentProps } from '../../Types';

const Welcome = ({ currentStep, onTriggerStep, hideActions } : MigrationStepComponentProps) => {
  const { data: dataNodes } = useDataNodes();

  return (
    <>
      <h3>欢迎</h3>
      <p>使用远程重新索引功能，您可以将现有集群中的数据重新索引到数据节点集群，从而迁移到数据节点。</p>
      <p>要开始使用，请在您之前设置中的每个 OS/ES 节点上安装 Data Node。您可以找到有关如何下载和安装 Data Node 的更多信息。  <DocumentationLink page="graylog-data-node" text="here" />.</p>
      <MigrationDatanodeList />
      <MigrationStepTriggerButtonToolbar hidden={hideActions} disabled={dataNodes?.list?.length <= 0} nextSteps={currentStep.next_steps} onTriggerStep={onTriggerStep} />
    </>
  );
};

export default Welcome;
