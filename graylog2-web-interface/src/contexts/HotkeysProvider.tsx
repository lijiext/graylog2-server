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
import type { PropsWithChildren } from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  HotkeysProvider as OriginalHotkeysProvider,
  useHotkeysContext as useOriginalHotkeysContext,
} from 'react-hotkeys-hook';
import Immutable from 'immutable';

import type { ScopeName, ActiveHotkeys, HotkeyCollections, Options } from 'contexts/HotkeysContext';
import HotkeysContext from 'contexts/HotkeysContext';

const viewActions = {
  undo: { keys: 'mod+shift+z', description: '撤销上一步操作' },
  redo: { keys: 'mod+shift+y', description: '重做上一个操作' },
};

export const hotKeysCollections: HotkeyCollections = {
  general: {
    title: '常规',
    description: '常规键盘快捷键',
    actions: {
      'show-hotkeys-modal': { keys: 'shift+?', displayKeys: '?', description: '显示可用的键盘快捷键' },
      'submit-form': { keys: 'enter', description: '提交表单' },
      'close-modal': { keys: 'esc', description: '关闭模态框' },
      'show-scratchpad-modal': { keys: 'mod+/', description: '显示草稿箱' },
    },
  },
  search: {
    title: '搜索',
    description: '搜索页面的键盘快捷键',
    actions: {
      ...viewActions,
      save: { keys: 'mod+s', description: '保存搜索' },
      'save-as': { keys: 'mod+shift+s', description: '保存搜索为' },
    },
  },
  dashboard: {
    title: '仪表盘',
    description: '仪表盘的键盘快捷键',
    actions: {
      ...viewActions,
      save: { keys: 'mod+s', description: '保存仪表盘' },
      'save-as': { keys: 'mod+shift+s', description: '保存仪表盘为' },
    },
  },
  'query-input': {
    title: '查询输入',
    description: '搜索栏中查询输入的键盘快捷键，在输入获得焦点时可用。',
    // Please note, any changes to keybindings also need to be made in the query input component.
    actions: {
      'submit-search': { keys: 'return', description: '执行搜索' },
      'insert-newline': { keys: 'shift+return', description: '创建新行' },
      'create-search-filter': { keys: 'alt+return', description: '基于当前查询创建搜索过滤器' },
      'show-suggestions': { keys: 'alt+space', description: '显示建议，在输入为空时显示查询历史' },
      'show-history': { keys: 'alt+shift+h', description: '查看您的搜索查询历史' },
    },
  },
  scratchpad: {
    title: '草稿箱',
    description: '便签快捷方式',
    actions: {
      clear: { keys: ['mod+backspace', 'mod+del'], description: '清空临时区' },
      copy: { keys: 'shift+mod+c', description: '复制剪贴板' },
    },
  },
};

const CustomHotkeysProvider = ({ children }: PropsWithChildren) => {
  const [activeHotkeys, setActiveHotkeys] = useState<ActiveHotkeys>(Immutable.Map());
  const { enabledScopes } = useOriginalHotkeysContext();
  const [showHotkeysModal, setShowHotkeysModal] = useState(false);

  const addActiveHotkey = useCallback(({ scope, actionKey, options }: {
    scope: ScopeName,
    actionKey: string,
    options: Options & { scope: ScopeName }
  }) => {
    setActiveHotkeys((cur) => cur.set(`${scope}.${actionKey}`, { options }));
  }, []);

  const removeActiveHotkey = useCallback(({ scope, actionKey }: { scope: ScopeName, actionKey: string }) => {
    setActiveHotkeys((cur) => cur.delete(`${scope}.${actionKey}`));
  }, []);

  const value = useMemo(() => ({
    enabledScopes: enabledScopes as Array<ScopeName>,
    hotKeysCollections,
    activeHotkeys,
    addActiveHotkey,
    removeActiveHotkey,
    showHotkeysModal,
    setShowHotkeysModal,
  }), [activeHotkeys, addActiveHotkey, enabledScopes, removeActiveHotkey, showHotkeysModal]);

  return (
    <HotkeysContext.Provider value={value}>
      {children}
    </HotkeysContext.Provider>
  );
};

type Props = {
  children: React.ReactElement,
}

const HotkeysProvider = ({ children }: Props) => (
  <OriginalHotkeysProvider>
    <CustomHotkeysProvider>
      {children}
    </CustomHotkeysProvider>
  </OriginalHotkeysProvider>
);

export default HotkeysProvider;
