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
import styled, { css } from 'styled-components';

import { defaultCompare as naturalSort } from 'logic/DefaultCompare';
import ShardRouting from 'components/indices/ShardRouting';

const ShardRoutingWrap = styled.div(
  ({ theme }) => css`
    .shards {
      .shard {
        padding: 10px;
        margin: 5px;
        width: 50px;
        float: left;
        text-align: center;
      }

      .shard-started {
        background-color: ${theme.utils.colorLevel(theme.colors.variant.light.success, -2)};
      }

      .shard-relocating {
        background-color: ${theme.utils.colorLevel(theme.colors.variant.light.primary, -2)};
      }

      .shard-initializing {
        background-color: ${theme.utils.colorLevel(theme.colors.variant.light.warning, -5)};
      }

      .shard-unassigned {
        background-color: ${theme.utils.colorLevel(theme.colors.variant.light.default, -2)};
      }

      .shard-primary .id {
        font-weight: bold;
        margin-bottom: 3px;
        border-bottom: 1px solid ${theme.colors.gray[10]};
      }
    }

    .description {
      font-size: ${theme.fonts.size.small};
      margin-top: 2px;
      margin-left: 6px;
    }
  `,
);

type ShardRoutingOverviewProps = {
  routing: any[];
  indexName: string;
};

const ShardRoutingOverview = ({ indexName, routing }: ShardRoutingOverviewProps) => (
  <ShardRoutingWrap>
    <h3>分片路由</h3>

    <ul className="shards">
      {routing
        .sort((shard1, shard2) => naturalSort(shard1.id, shard2.id))
        .map((route) => (
          <ShardRouting key={`${indexName}-shard-route-${route.node_id}-${route.id}`} route={route} />
        ))}
    </ul>
    <br style={{ clear: 'both' }} />

    <div className="description">
      粗体分片为主分片，其他为副本分片。当主分片离开集群时，副本分片会自动选举为主分片。大小和文档计数仅反映主分片，不包含可能的副本重复。
    </div>
  </ShardRoutingWrap>
);

export default ShardRoutingOverview;
