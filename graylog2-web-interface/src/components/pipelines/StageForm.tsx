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
import React, { useCallback, useMemo, useState } from 'react';

import { useStore } from 'stores/connect';
import { Link } from 'components/common/router';
import { SelectableList } from 'components/common';
import { Button, ControlLabel, FormGroup, BootstrapModalForm, Input } from 'components/bootstrap';
import { getValueFromInput } from 'util/FormsUtils';
import NumberUtils from 'util/NumberUtils';
import Routes from 'routing/Routes';
import type { PipelineType, StageType } from 'components/pipelines/types';
import { RulesStore } from 'stores/rules/RulesStore';
import { isPermitted } from 'util/PermissionsMixin';
import useCurrentUser from 'hooks/useCurrentUser';

type Props = {
  pipeline: PipelineType;
  stage?: StageType;
  create?: boolean;
  save: (nextStage: StageType, callback: () => void) => void;
  disableEdit?: boolean;
};

const StageForm = ({
  pipeline,
  stage = {
    stage: 0,
    match: 'EITHER',
    rules: [],
  },
  create = false,
  save,
  disableEdit = false,
}: Props) => {
  const currentUser = useCurrentUser();
  const [showModal, setShowModal] = useState<boolean>(false);

  const _initialStageNumber = useMemo(
    () => (create ? Math.max(...pipeline.stages.map((s) => s.stage)) + 1 : stage.stage),
    [create, pipeline.stages, stage.stage],
  );

  const [nextStage, setNextStage] = useState<StageType>({ ...stage, stage: _initialStageNumber });
  const { rules } = useStore(RulesStore);

  const openModal = () => {
    setShowModal(true);
  };

  const _onChange = ({ target }) => {
    setNextStage((currentStage) => ({ ...currentStage, [target.name]: getValueFromInput(target) }));
  };

  const _onRulesChange = (newRules) => {
    setNextStage((currentStage) => ({ ...currentStage, rules: newRules }));
  };

  const _closeModal = () => {
    setShowModal(false);
  };

  const _onSaved = () => {
    _closeModal();
  };

  const isOverridingStage = useMemo(
    () => nextStage.stage !== _initialStageNumber && pipeline.stages.some(({ stage: s }) => s === nextStage.stage),
    [nextStage.stage, _initialStageNumber, pipeline.stages],
  );

  const _handleSave = () => {
    if (!isOverridingStage) {
      save(nextStage, _onSaved);
    }
  };

  const _formatRuleOption = ({ title }) => ({ value: title, label: title });

  const _filterChosenRules = (rule, chosenRules) => !chosenRules.includes(rule.title);

  const _getFormattedOptions = useCallback(() => {
    const chosenRules = nextStage.rules;
    const defaultScopeRules = rules?.filter((rule) => rule._scope === 'DEFAULT');

    return defaultScopeRules
      ? defaultScopeRules.filter((rule) => _filterChosenRules(rule, chosenRules)).map(_formatRuleOption)
      : [];
  }, [nextStage.rules, rules]);

  const rulesHelp = (
    <span>
      选择在此阶段评估的规则，或在{' '}
      <Link to={Routes.SYSTEM.PIPELINES.RULES}>管道规则页面</Link>.
    </span>
  );

  return (
    <span>
      <Button
        disabled={!isPermitted(currentUser.permissions, 'pipeline:edit') || disableEdit}
        onClick={openModal}
        bsStyle={create ? 'primary' : 'info'}>
        {create ? 'Add new stage' : 'Edit'}
      </Button>
      <BootstrapModalForm
        show={showModal}
        title={`${create ? 'Add new' : 'Edit'} 阶段 ${nextStage.stage}`}
        data-telemetry-title={`${create ? 'Add new' : 'Edit'} stage`}
        onSubmitForm={_handleSave}
        onCancel={_closeModal}
        submitButtonText={create ? 'Add stage' : 'Update stage'}>
        <fieldset>
          <Input
            type="number"
            id="stage"
            name="stage"
            label="阶段"
            autoFocus
            min={NumberUtils.JAVA_INTEGER_MIN_VALUE + 1}
            max={NumberUtils.JAVA_INTEGER_MAX_VALUE}
            onChange={_onChange}
            bsStyle={isOverridingStage ? 'error' : null}
            help={
              isOverridingStage
                ? 'Stage is already in use, please use another number or edit the existing stage.'
                : 'Stage priority. The lower the number, the earlier it will execute.'
            }
            value={nextStage.stage}
          />

          <FormGroup>
            <ControlLabel>在下一阶段继续处理</ControlLabel>
          </FormGroup>

          <Input
            type="radio"
            id="match_all"
            name="match"
            value="ALL"
            label="此阶段的所有规则均匹配该消息"
            onChange={_onChange}
            checked={nextStage.match === 'ALL'}
          />

          <Input
            type="radio"
            id="match_any"
            name="match"
            value="EITHER"
            label="此阶段的至少一条规则与消息匹配"
            onChange={_onChange}
            checked={nextStage.match === 'EITHER'}
          />

          <Input
            type="radio"
            id="match_pass"
            name="match"
            value="PASS"
            label="此阶段匹配零条或多条规则"
            onChange={_onChange}
            checked={nextStage.match === 'PASS'}
          />

          <Input id="stage-rules-select" label="暂存规则" help={rulesHelp}>
            <SelectableList
              options={_getFormattedOptions()}
              onChange={_onRulesChange}
              selectedOptions={nextStage.rules}
            />
          </Input>
        </fieldset>
      </BootstrapModalForm>
    </span>
  );
};

export default StageForm;
