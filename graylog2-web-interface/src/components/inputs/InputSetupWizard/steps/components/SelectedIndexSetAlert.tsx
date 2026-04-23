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
import React from 'react';
import styled from 'styled-components';

import { Alert, Col, Row } from 'components/bootstrap';
import useStreamsByIndexSet from 'components/inputs/InputSetupWizard/hooks/useStreamsByIndexSet';
import type { IndexSet } from 'stores/indices/IndexSetsStore';

type Props = {
  selectedIndexSetId?: string;
  indexSets: Array<IndexSet>;
};

const StyledAlert = styled(Alert)`
  margin-top: 0;
  margin-bottom: 0;
`;

const SelectedIndexSetAlert = ({ selectedIndexSetId = undefined, indexSets }: Props) => {
  const { data: streamsByIndexSetIdData } = useStreamsByIndexSet(selectedIndexSetId, !!selectedIndexSetId);

  const isDefaultIndexSet = () => {
    const indexSet = indexSets?.find(({ id }) => id === selectedIndexSetId);

    return indexSet?.default ?? false;
  };

  const isAlreadyUsedByStreams = () => {
    if (!streamsByIndexSetIdData) return false;

    return streamsByIndexSetIdData.total > 0;
  };

  if (!selectedIndexSetId) return null;

  if (isDefaultIndexSet()) {
    return (
      <Row>
        <Col md={12}>
          <StyledAlert title="默认索引集已选择" bsStyle="info">
            您已选择默认索引集。
            <br />
            我们不推荐这样做：作为许多不同格式消息的潜在接收者（任何没有路由的消息，通过默认数据流），如果广泛使用，默认索引集可能会达到搜索后端每个索引的字段数量上限。
          </StyledAlert>
        </Col>
      </Row>
    );
  }

  if (isAlreadyUsedByStreams()) {
    return (
      <Row>
        <Col md={12}>
          <Alert title="所选索引集已关联到另一个数据流" bsStyle="info">
            所选索引集已与其他数据流关联。
            <br />
            请注意，每个索引都有唯一的字段限制，默认为 1000。
            <br />
            出于此原因，我们建议尽可能按日志格式将数据流组织到多个索引集中。
          </Alert>
        </Col>
      </Row>
    );
  }

  return null;
};

export default SelectedIndexSetAlert;
