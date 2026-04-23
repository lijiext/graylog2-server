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
import { useCallback, useState } from 'react';

import { Button } from 'components/bootstrap';
import { IfPermitted, ShareButton } from 'components/common';
import type View from 'views/logic/views/View';
import EntityShareModal from 'components/permissions/EntityShareModal';
import useSelectedEntities from 'components/common/EntityDataTable/hooks/useSelectedEntities';

const onDelete = (
  e: React.MouseEvent<HTMLButtonElement>,
  savedSearch: View,
  deleteSavedSearch: (search: View) => Promise<void>,
  activeSavedSearchId: string,
  refetch: () => void,
  deselectEntity: (searchId: string) => void,
) => {
  e.stopPropagation();

  // eslint-disable-next-line no-alert
  if (window.confirm(`You are about to delete saved search: "${savedSearch.title}". Are you sure?`)) {
    deleteSavedSearch(savedSearch).then(() => {
      if (savedSearch.id !== activeSavedSearchId) {
        refetch();
      }

      deselectEntity(savedSearch.id);
    });
  }
};

type Props = {
  search: View;
  onDeleteSavedSearch: (search: View) => Promise<void>;
  activeSavedSearchId: string;
  refetch: () => void;
};

const SearchActions = ({ search, onDeleteSavedSearch, activeSavedSearchId, refetch }: Props) => {
  const { deselectEntity } = useSelectedEntities();
  const [showShareModal, setShowShareModal] = useState(false);
  const toggleEntityShareModal = useCallback(() => {
    setShowShareModal((cur) => !cur);
  }, []);

  return (
    <>
      <ShareButton bsSize="xsmall" entityId={search.id} entityType="search" onClick={() => setShowShareModal(true)} />
      <IfPermitted permissions={[`view:edit:${search.id}`, 'view:edit']} anyPermissions>
        <Button
          onClick={(e) => onDelete(e, search, onDeleteSavedSearch, activeSavedSearchId, refetch, deselectEntity)}
          role="button"
          bsSize="xsmall"
          bsStyle="danger"
          title={`删除搜索 ${search.title}`}
          tabIndex={0}>
          删除
        </Button>
      </IfPermitted>
      {showShareModal && (
        <EntityShareModal
          entityId={search.id}
          entityType="search"
          entityTitle={search.title}
          description="搜索用户或团队以将其添加为此搜索的协作者。"
          onClose={toggleEntityShareModal}
        />
      )}
    </>
  );
};

export default SearchActions;
