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
import PropTypes from 'prop-types';
import React from 'react';

import type { IndexSummary } from 'stores/indexers/IndexerOverviewStore';
import { IndexSection } from 'components/indices';
import type { IndexInfo } from 'stores/indices/IndicesStore';

type Props = {
  indexDetails: Array<IndexInfo>,
  indices: Array<IndexSummary>
  indexSetId: string,
}

const IndicesOverview = ({ indexDetails, indices, indexSetId }: Props) => {
  const indicesFilteredByTier = (indicesList: Array<IndexSummary>, tier: 'WARM' | 'HOT' | undefined): Array<IndexSummary> => (
    indicesList.filter((index) => index.tier === tier)
  );

  const warmTierIndices = indicesFilteredByTier(indices, 'WARM');
  const hotTierIndices = indicesFilteredByTier(indices, 'HOT');
  const hotTierList = hotTierIndices.length > 0 ? hotTierIndices : indicesFilteredByTier(indices, undefined);
  const hotTierSubheading = '本节中的索引作为搜索集群中的活动分片存储，便于快速检索和搜索作业。热层中保存的数据在搜索集群的 Java 堆内存中占用永久空间，过多时会导致搜索性能下降。';
  const warmTierSubheading = '本节中的索引作为热温层存储库中的可搜索快照进行存储，从而实现低成本存储和低资源开销。热温层中数据的检索和搜索任务将变慢。请注意，只有具有“搜索”角色的搜索节点才能参与热温层搜索和检索。';

  return (
    <>
      <IndexSection headline="Hot Tier"
                    subheading={hotTierSubheading}
                    indices={hotTierList}
                    indexDetails={indexDetails}
                    indexSetId={indexSetId} />
      {warmTierIndices.length > 0 && (
        <IndexSection headline="Warm Tier"
                      subheading={warmTierSubheading}
                      indices={warmTierIndices}
                      indexDetails={indexDetails}
                      indexSetId={indexSetId} />
      )}
    </>
  );
};

IndicesOverview.propTypes = {
  indexDetails: PropTypes.array.isRequired,
  indices: PropTypes.array.isRequired,
  indexSetId: PropTypes.string.isRequired,
};

export default IndicesOverview;
