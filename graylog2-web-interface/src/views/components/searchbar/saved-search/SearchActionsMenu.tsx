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
import styled from 'styled-components';
import { useCallback, useState, useContext, useRef } from 'react';

import { isPermitted } from 'util/PermissionsMixin';
import { Button, ButtonGroup, DropdownButton, MenuItem } from 'components/bootstrap';
import { Icon, ShareButton } from 'components/common';
import { ViewManagementActions } from 'views/stores/ViewManagementStore';
import UserNotification from 'util/UserNotification';
import View from 'views/logic/views/View';
import onSaveView from 'views/logic/views/OnSaveViewAction';
import ViewLoaderContext from 'views/logic/ViewLoaderContext';
import NewViewLoaderContext from 'views/logic/NewViewLoaderContext';
import ExportModal from 'views/components/export/ExportModal';
import EntityShareModal from 'components/permissions/EntityShareModal';
import useCurrentUser from 'hooks/useCurrentUser';
import * as ViewsPermissions from 'views/Permissions';
import type User from 'logic/users/User';
import ViewPropertiesModal from 'views/components/dashboard/DashboardPropertiesModal';
import { loadAsDashboard, loadNewSearch } from 'views/logic/views/Actions';
import IfPermitted from 'components/common/IfPermitted';
import { executePluggableSearchDuplicationHandler as executePluggableDuplicationHandler } from 'views/logic/views/pluggableSaveViewFormHandler';
import useSaveViewFormControls from 'views/hooks/useSaveViewFormControls';
import useIsDirty from 'views/hooks/useIsDirty';
import useIsNew from 'views/hooks/useIsNew';
import useView from 'views/hooks/useView';
import useViewsDispatch from 'views/stores/useViewsDispatch';
import { loadView, updateView } from 'views/logic/slices/viewSlice';
import type FetchError from 'logic/errors/FetchError';
import useHistory from 'routing/useHistory';
import usePluginEntities from 'hooks/usePluginEntities';
import SavedSearchesModal from 'views/components/searchbar/saved-search/SavedSearchesModal';
import SaveViewButton from 'views/components/searchbar/SaveViewButton';
import type { EntitySharePayload } from 'actions/permissions/EntityShareActions';
import EntityShareDomain from 'domainActions/permissions/EntityShareDomain';
import useHotkey from 'hooks/useHotkey';
import { createGRN } from 'logic/permissions/GRN';
import useSelectedStreamsGRN from 'views/hooks/useSelectedStreamsGRN';

import SavedSearchForm from './SavedSearchForm';

const Container = styled(ButtonGroup)`
  display: flex;
  justify-content: flex-end;
`;

const _isAllowedToEdit = (view: View, currentUser: User | undefined | null) =>
  view.owner === currentUser?.username || isPermitted(currentUser?.permissions, [ViewsPermissions.View.Edit(view.id)]);

const _extractErrorMessage = (error: FetchError) =>
  error && error.additional && error.additional.body && error.additional.body.message
    ? error.additional.body.message
    : error;

const usePluggableSearchAction = (loaded: boolean, view: View) => {
  const modalRefs = useRef({});
  const pluggableSearchActions = usePluginEntities('views.components.searchActions');

  const actions = pluggableSearchActions
    .filter((perspective) => (perspective.useCondition ? !!perspective.useCondition() : true))
    .map(({ component: PluggableSearchAction, key, modals }) => {
      if (modals) {
        const refs = modals
          .map(({ key: modalKey }) => modalKey)
          .reduce((acc, mKey: string) => {
            acc[mKey] = () => modalRefs.current[mKey];

            return acc;
          }, {});

        return <PluggableSearchAction key={key} loaded={loaded} search={view} modalRefs={refs} />;
      }

      return <PluggableSearchAction key={key} loaded={loaded} search={view} />;
    });

  const actionModals = pluggableSearchActions
    .filter(({ modals }) => !!modals)
    .flatMap(({ modals }) => modals)
    .map(({ key, component: ActionModal }) => (
      <ActionModal
        key={key}
        search={view}
        ref={(r) => {
          modalRefs.current[key] = r;
        }}
      />
    ));

  return { actions, actionModals };
};

const SearchActionsMenu = () => {
  const dirty = useIsDirty();
  const view = useView();
  const isNew = useIsNew();
  const viewLoaderFunc = useContext(ViewLoaderContext);
  const currentUser = useCurrentUser();
  const loadNewView = useContext(NewViewLoaderContext);
  const isAllowedToEdit = view && view.id && _isAllowedToEdit(view, currentUser);
  const formTarget = useRef();
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showMetadataEdit, setShowMetadataEdit] = useState(false);
  const [showShareSearch, setShowShareSearch] = useState(false);
  const currentTitle = view?.title ?? '';
  const dispatch = useViewsDispatch();
  const onUpdateView = useCallback((newView: View) => dispatch(updateView(newView)), [dispatch]);
  const { selectedStreamsGRN } = useSelectedStreamsGRN();

  const loaded = isNew === false;
  const disableReset = !(dirty || loaded);
  const savedViewTitle = loaded ? 'Saved search' : 'Save search';
  const title = dirty ? 'Unsaved changes' : savedViewTitle;
  const pluggableSaveViewControls = useSaveViewFormControls();
  const history = useHistory();

  const toggleFormModal = useCallback(() => setShowForm((cur) => !cur), []);
  const closeFormModal = useCallback(() => setShowForm(false), []);
  const openFormModal = useCallback(() => setShowForm(true), []);
  const toggleListModal = useCallback(() => setShowList((cur) => !cur), []);
  const toggleExport = useCallback(() => setShowExport((cur) => !cur), []);
  const toggleMetadataEdit = useCallback(() => setShowMetadataEdit((cur) => !cur), []);
  const toggleShareSearch = useCallback(() => setShowShareSearch((cur) => !cur), []);
  const { actions: pluggableActions, actionModals: pluggableActionModals } = usePluggableSearchAction(loaded, view);

  const saveSearch = useCallback(
    async (newTitle: string, entityShare?: EntitySharePayload) => {
      if (!view.id) {
        return;
      }
      const newView = view.toBuilder().title(newTitle).type(View.Type.Search).build();

      await dispatch(onSaveView(newView, entityShare));

      if (entityShare) {
        await EntityShareDomain.update('search', title, createGRN('search', view.id), entityShare);
      }

      closeFormModal();
      await dispatch(loadView(newView));
    },
    [closeFormModal, dispatch, view, title],
  );

  const saveAsSearch = useCallback(
    async (newTitle: string, entityShare?: EntitySharePayload) => {
      if (!newTitle || newTitle === '') {
        return;
      }
      const viewWithPluginData = await executePluggableDuplicationHandler(
        view,
        currentUser.permissions,
        pluggableSaveViewControls,
      );

      const newView = viewWithPluginData.toBuilder().newId().title(newTitle).type(View.Type.Search).build();

      ViewManagementActions.create(newView, entityShare, view.id)
        .then((createdView) => {
          toggleFormModal();

          return createdView;
        })
        .then((createdView) => {
          viewLoaderFunc(createdView.id);
        })
        .then(() => UserNotification.success(`保存视图 "${newView.title}" 成功！`, '成功！'))
        .catch((error) => UserNotification.error(`保存视图失败：${_extractErrorMessage(error)}`, '错误！'));
    },
    [currentUser.permissions, pluggableSaveViewControls, toggleFormModal, view, viewLoaderFunc],
  );

  const deleteSavedSearch = useCallback(
    (deletedView: View) =>
      ViewManagementActions.delete(deletedView)
        .then(() =>
          UserNotification.success(`成功删除保存的搜索 "${deletedView.title}"！`, '成功！'),
        )
        .then(() => {
          if (deletedView.id === view.id) {
            loadNewSearch(history);
          }

          return Promise.resolve();
        })
        .catch((error) =>
          UserNotification.error(`删除保存的搜索失败：${_extractErrorMessage(error)}`, '错误！'),
        ),
    [history, view.id],
  );

  const _loadAsDashboard = useCallback(() => {
    loadAsDashboard(history, view);
  }, [history, view]);

  useHotkey({
    actionKey: 'save',
    callback: () => (loaded ? saveSearch(title) : openFormModal()),
    scope: 'search',
    dependencies: [loaded, saveSearch, title],
  });

  useHotkey({
    actionKey: 'save-as',
    callback: () => openFormModal(),
    scope: 'search',
  });

  return (
    <Container aria-label="搜索元按钮">
      <SavedSearchForm
        key={currentTitle}
        show={showForm}
        saveSearch={saveSearch}
        saveAsSearch={saveAsSearch}
        isCreateNew={isNew || !isAllowedToEdit}
        toggleModal={toggleFormModal}
        value={currentTitle}
        selectedStreamGRN={selectedStreamsGRN}
        viewId={!isNew && view.id}>
        <SaveViewButton title={title} ref={formTarget} onClick={toggleFormModal} />
      </SavedSearchForm>
      <Button title="加载之前保存的搜索" onClick={toggleListModal}>
        <Icon name="folder" type="regular" /> 加载
      </Button>
      {showList && (
        <SavedSearchesModal
          deleteSavedSearch={deleteSavedSearch}
          toggleModal={toggleListModal}
          activeSavedSearchId={view.id}
        />
      )}
      <ShareButton
        entityType="search"
        entityId={view.id}
        onClick={toggleShareSearch}
        bsStyle="default"
        disabledInfo={isNew && 'Only saved searches can be shared.'}
      />
      <DropdownButton
        title={<Icon name="more_horiz" />}
        aria-label="打开搜索操作下拉菜单"
        id="search-actions-dropdown"
        pullRight
        noCaret>
        <MenuItem onSelect={toggleMetadataEdit} disabled={!isAllowedToEdit} icon="edit">
          编辑元数据
        </MenuItem>
        <IfPermitted permissions="dashboards:create">
          <MenuItem onSelect={_loadAsDashboard} icon="dashboard">
            导出到仪表盘
          </MenuItem>
        </IfPermitted>
        <MenuItem onSelect={toggleExport} icon="download">
          导出
        </MenuItem>
        <MenuItem disabled={disableReset} onSelect={loadNewView} icon="restart_alt">
          重置搜索
        </MenuItem>
        {pluggableActions.length ? (
          <>
            <MenuItem divider />
            {pluggableActions}
          </>
        ) : null}
      </DropdownButton>
      {showExport && <ExportModal view={view} closeModal={toggleExport} />}
      {showMetadataEdit && (
        <ViewPropertiesModal
          show
          view={view}
          title="编辑已保存的搜索"
          submitButtonText="更新搜索"
          onClose={toggleMetadataEdit}
          onSave={onUpdateView}
        />
      )}
      {showShareSearch && (
        <EntityShareModal
          entityId={view.id}
          entityType="search"
          entityTitle={view.title}
          description="搜索用户或团队以将其添加为此保存搜索的协作者。"
          onClose={toggleShareSearch}
        />
      )}
      {pluggableActionModals}
    </Container>
  );
};

export default SearchActionsMenu;
