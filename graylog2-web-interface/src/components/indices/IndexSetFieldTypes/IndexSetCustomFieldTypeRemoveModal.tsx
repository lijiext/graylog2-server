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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { useStore } from 'stores/connect';
import type { IndexSet, IndexSetsStoreState } from 'stores/indices/IndexSetsStore';
import { IndexSetsActions, IndexSetsStore } from 'stores/indices/IndexSetsStore';
import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { getPathnameWithoutId } from 'util/URLUtils';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import { Spinner } from 'components/common';
import { Alert, BootstrapModalForm, Input } from 'components/bootstrap';
import type {
  RemovalResponse,
} from 'components/indices/IndexSetFieldTypes/hooks/useRemoveCustomFieldTypeMutation';
import useRemoveCustomFieldTypeMutation from 'components/indices/IndexSetFieldTypes/hooks/useRemoveCustomFieldTypeMutation';
import IndexSetsRemovalErrorAlert from 'components/indices/IndexSetFieldTypes/IndexSetsRemovalErrorAlert';
import useSelectedEntities from 'components/common/EntityDataTable/hooks/useSelectedEntities';
import { Link } from 'components/common/router';
import Routes from 'routing/Routes';
import useIndexProfileWithMappingsByField from 'components/indices/IndexSetFieldTypes/hooks/useIndexProfileWithMappingsByField';

const StyledLabel = styled.h5`
  font-weight: bold;
  margin-bottom: 5px;
`;

type Props = {
  show: boolean,
  onClose: () => void,
  fields: Array<string>,
  indexSetIds: Array<string>,
}

type ContentProps = {
  indexSetIds: Array<string>,
  indexSets: Record<string, IndexSet>,
  fields: Array<string>,
  setRotated: React.Dispatch<React.SetStateAction<boolean>>
  rotated: boolean,
}

const indexSetsStoreMapper = ({ indexSets }: IndexSetsStoreState): Record<string, IndexSet> => {
  if (!indexSets) return null;

  return Object.fromEntries(indexSets.map((indexSet) => ([indexSet.id, indexSet])));
};

const OverriddenProfilesFieldsWithTypeList = ({ overriddenProfilesFieldsWithType }: {overriddenProfilesFieldsWithType: Array<{ field: string, type: string }>}) => (
  <>
    {overriddenProfilesFieldsWithType.map(({ field, type }, index) => {
      const isLast = index === overriddenProfilesFieldsWithType.length - 1;

      return (
        <span key={`${field}-${type}`}>
          <b>{field}:</b> <i>{type}</i>{isLast ? '' : ', '}
        </span>
      );
    })}
  </>
);

const IndexSetCustomFieldTypeRemoveContent = ({ fields, indexSets, setRotated, rotated, indexSetIds }: ContentProps) => {
  const fieldsStr = fields.join(', ');
  const indexSetsStr = indexSetIds.map((id) => indexSets[id].title).join(', ');
  const { customFieldMappingsByField, name: profileName, id: profileId } = useIndexProfileWithMappingsByField();
  const overriddenIndexFieldsStr = useMemo(() => fields.filter((field) => !customFieldMappingsByField[field]).join(', '), [customFieldMappingsByField, fields]);
  const overriddenProfilesFieldsWithType = useMemo(() => fields.filter((field) => customFieldMappingsByField[field])
    .map((field) => ({ field, type: customFieldMappingsByField[field] })), [customFieldMappingsByField, fields]);

  return (
    <div>
      <Alert>
        移除覆盖的字段类型后，针对 <b>{fieldsStr}</b> in <b>{indexSetsStr}</b>
        {overriddenIndexFieldsStr && (
          <>，您的设置 <i>搜索引擎</i> 将应用于以下字段： <b>{overriddenIndexFieldsStr}</b>
          </>
        )}
        {!!overriddenProfilesFieldsWithType.length && (
          <>
            {', '}
            来自以下设置 <Link to={Routes.SYSTEM.INDICES.FIELD_TYPE_PROFILES.edit(profileId)}>{profileName}</Link> ( 即 <OverriddenProfilesFieldsWithTypeList overriddenProfilesFieldsWithType={overriddenProfilesFieldsWithType} />
            )
            {' '}
            将应用。
          </>
        )}
      </Alert>
      <StyledLabel>选择轮转策略</StyledLabel>
      <p>
        要查看并使用字段类型更改 <b>{fieldsStr}</b>，您必须轮转索引。您可以在提交此表单后自动轮转受影响的索引，或者稍后手动操作。
      </p>
      <Input type="checkbox"
             id="rotate"
             name="rotate"
             label="更改后轮转受影响的索引"
             onChange={() => setRotated((cur: boolean) => !cur)}
             checked={rotated} />
    </div>
  );
};

const IndexSetCustomFieldTypeRemoveModal = ({ show, fields, onClose, indexSetIds }: Props) => {
  const { setSelectedEntities } = useSelectedEntities();
  const indexSets = useStore(IndexSetsStore, indexSetsStoreMapper);
  const [removalResponse, setRemovalResponse] = useState<RemovalResponse>(null);
  const [rotated, setRotated] = useState(true);
  const removeSucceededFieldsFromSelected = useCallback((response: RemovalResponse) => {
    const succeededFields = new Set(Object.values(response).flatMap(((indexSet) => indexSet.succeeded.map(({ fieldName }) => fieldName))));
    setSelectedEntities((cur) => cur.filter((field) => !succeededFields.has(field)));
  }, [setSelectedEntities]);
  const onErrorHandler = useCallback((response: RemovalResponse) => {
    removeSucceededFieldsFromSelected(response);
    setRemovalResponse(response);
  }, [removeSucceededFieldsFromSelected]);
  const onSuccessHandler = useCallback((response: RemovalResponse) => {
    removeSucceededFieldsFromSelected(response);
    onClose();
  }, [onClose, removeSucceededFieldsFromSelected]);
  const { removeCustomFieldTypeMutation } = useRemoveCustomFieldTypeMutation({ onErrorHandler, onSuccessHandler });
  const sendTelemetry = useSendTelemetry();
  const { pathname } = useLocation();
  const telemetryPathName = useMemo(() => getPathnameWithoutId(pathname), [pathname]);
  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setRemovalResponse(null);

    removeCustomFieldTypeMutation({ fields, indexSets: indexSetIds, rotated })
      .then(() => {
        sendTelemetry(TELEMETRY_EVENT_TYPE.SEARCH_FIELD_VALUE_ACTION.REMOVE_CUSTOM_FIELD_TYPE_REMOVED, {
          app_pathname: telemetryPathName,
          app_action_value:
            {
              value: 'removed-custom-field-type',
              rotated,
            },
        });
      });
  }, [fields, indexSetIds, removeCustomFieldTypeMutation, rotated, sendTelemetry, telemetryPathName]);

  const onCancel = useCallback(() => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.SEARCH_FIELD_VALUE_ACTION.REMOVE_CUSTOM_FIELD_TYPE_CLOSED, { app_pathname: telemetryPathName, app_action_value: 'removed-custom-field-type-closed' });
    onClose();
  }, [onClose, sendTelemetry, telemetryPathName]);

  useEffect(() => {
    IndexSetsActions.list(false);
    sendTelemetry(TELEMETRY_EVENT_TYPE.SEARCH_FIELD_VALUE_ACTION.REMOVE_CUSTOM_FIELD_TYPE_OPENED, { app_pathname: telemetryPathName, app_action_value: 'removed-custom-field-type-opened' });
  }, [sendTelemetry, telemetryPathName]);

  return (
    <BootstrapModalForm title={<span>移除字段类型覆盖</span>}
                        submitButtonText="移除字段类型覆盖"
                        onSubmitForm={onSubmit}
                        onCancel={onCancel}
                        show={show}
                        bsSize="large">
      {!indexSets ? <Spinner /> : (
        <IndexSetCustomFieldTypeRemoveContent rotated={rotated}
                                              setRotated={setRotated}
                                              fields={fields}
                                              indexSetIds={indexSetIds}
                                              indexSets={indexSets} />
      )}
      {removalResponse && <IndexSetsRemovalErrorAlert removalResponse={removalResponse} indexSets={indexSets} />}
    </BootstrapModalForm>
  );
};

export default IndexSetCustomFieldTypeRemoveModal;
