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

import { DocumentTitle, PageHeader } from 'components/common';
import GraylogClusterOverview from 'components/cluster/GraylogClusterOverview';
import PluginList from 'components/enterprise/PluginList';
import EnterpriseProductLink from 'components/enterprise/EnterpriseProductLink';
import HideOnCloud from 'util/conditional/HideOnCloud';
import useProductName from 'brand-customization/useProductName';
import AdvertisementSection from 'components/enterprise/AdvertisementSection';
import usePluggableUpsellWrapper from 'hooks/usePluggableUpsellWrapper';

const EnterprisePage = () => {
  const productName = useProductName();
  const UpsellWrapper = usePluggableUpsellWrapper();

  return (
    <DocumentTitle title={`${productName} 企业版`}>
      <div>
        <PageHeader
          title={
            <>
              <UpsellWrapper>尝试</UpsellWrapper> {productName} 企业版
            </>
          }>
          <span>
            <UpsellWrapper>
              <EnterpriseProductLink>了解更多</EnterpriseProductLink> about {productName} 企业版功能。
            </UpsellWrapper>
          </span>
        </PageHeader>

        <GraylogClusterOverview layout="compact">
          <PluginList />
        </GraylogClusterOverview>
        <HideOnCloud>
          <UpsellWrapper>
            <AdvertisementSection />
          </UpsellWrapper>
        </HideOnCloud>
      </div>
    </DocumentTitle>
  );
};

export default EnterprisePage;
