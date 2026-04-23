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
import Reflux from 'reflux';

import * as URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import UserNotification from 'util/UserNotification';
import { singletonStore, singletonActions } from 'logic/singleton';
import { InputStaticFieldsStore } from 'stores/inputs/InputStaticFieldsStore';
import type { Input } from 'components/messageloaders/Types';

type InputsActionsType = {
  list: () => Promise<{ inputs: Array<Input>, total: number }>,
  get: (id: string) => Promise<Input>,
  getOptional: (id: string, showError: boolean) => Promise<Input>,
  create: (input: Input) => Promise<void>,
  delete: (input: Input) => Promise<void>,
  update: (id: string, input: Input) => Promise<void>,
}

type InputsStoreState = {
  input?: Input | undefined,
  inputs: Array<Input> | undefined,
}
export const InputsActions = singletonActions(
  'core.Inputs',
  () => Reflux.createActions<InputsActionsType>({
    list: { asyncResult: true },
    get: { asyncResult: true },
    getOptional: { asyncResult: true },
    create: { asyncResult: true },
    delete: { asyncResult: true },
    update: { asyncResult: true },
  }),
);

export const InputsStore = singletonStore(
  'core.Inputs',
  () => Reflux.createStore<InputsStoreState>({
    listenables: [InputsActions],
    sourceUrl: '/system/inputs',
    inputs: undefined,
    input: undefined,

    init() {
      this.trigger(this._state());
      this.listenTo(InputStaticFieldsStore, this.list);
    },

    getInitialState() {
      return this._state();
    },

    _state() {
      return { inputs: this.inputs, input: this.input };
    },

    list() {
      const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl));

      promise
        .then(
          (response) => {
            this.inputs = response.inputs;
            this.trigger(this._state());

            return this.inputs;
          },
          (error) => {
            UserNotification.error(`获取输入失败，状态为：${error}`,
              '无法检索输入端');
          },
        );

      InputsActions.list.promise(promise);
    },

    get(inputId) {
      return this.getOptional(inputId, true);
    },

    getOptional(inputId, showError) {
      const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${inputId}`));

      promise
        .then(
          (response) => {
            this.input = response;
            this.trigger(this._state());

            return this.input;
          },
          (error) => {
            if (showError) {
              UserNotification.error(`获取输入 ${inputId} 失败，状态：${error}`,
                '无法检索输入端');
            } else {
              this.trigger(this._state());
            }
          },
        );

      InputsActions.get.promise(promise);
    },

    create(input) {
      const promise = fetch('POST', URLUtils.qualifyUrl(this.sourceUrl), input);

      promise
        .then(
          () => {
            UserNotification.success(`输入 '${input.title}' 启动成功`);
            InputsActions.list();
          },
          (error) => {
            UserNotification.error(`启动输入 '${input.title}' 失败，状态为：${error}`,
              '无法启动输入端');
          },
        );

      InputsActions.create.promise(promise);
    },

    delete(input) {
      const inputId = input.id;
      const inputTitle = input.title;

      const promise = fetch('DELETE', URLUtils.qualifyUrl(`${this.sourceUrl}/${inputId}`));

      promise
        .then(
          () => {
            UserNotification.success(`输入 '${inputTitle}' 删除成功`);
            InputsActions.list();
          },
          (error) => {
            UserNotification.error(`删除输入 '${inputTitle}' 失败，状态：${error}`,
              '无法删除输入端');
          },
        );

      InputsActions.delete.promise(promise);
    },

    update(id, input) {
      const promise = fetch('PUT', URLUtils.qualifyUrl(`${this.sourceUrl}/${id}`), input);

      promise
        .then(
          () => {
            UserNotification.success(`输入 '${input.title}' 更新成功`);
            InputsActions.list();
          },
          (error) => {
            UserNotification.error(`更新输入 '${input.title}' 失败，状态：${error}`,
              '无法更新输入端');
          },
        );

      InputsActions.update.promise(promise);
    },
  }),
);

InputsStore.inputsAsMap = (inputsList) => {
  const inputsMap = {};

  inputsList.forEach((input) => {
    inputsMap[input.id] = input;
  });

  return inputsMap;
};
