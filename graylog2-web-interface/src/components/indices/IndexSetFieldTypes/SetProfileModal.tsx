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

import useSendTelemetry from 'logic/telemetry/useSendTelemetry';
import useLocation from 'routing/useLocation';
import { getPathnameWithoutId } from 'util/URLUtils';
import { TELEMETRY_EVENT_TYPE } from 'logic/telemetry/Constants';
import { ModalSubmit, Select } from 'components/common';
import { Button, Input, Modal } from 'components/bootstrap';
import useParams from 'routing/useParams';
import useSetIndexSetProfileMutation from 'components/indices/IndexSetFieldTypes/hooks/useSetIndexSetProfileMutation';
import useProfileOptions from 'components/indices/IndexSetFieldTypeProfiles/hooks/useProfileOptions';
import { IndexSetsActions } from 'stores/indices/IndexSetsStore';
import useRemoveProfileFromIndexMutation from 'components/indices/IndexSetFieldTypes/hooks/useRemoveProfileFromIndexMutation';

const StyledLabel = styled.h5`
  font-weight: bold;
  margin-bottom: 5px;
`;

type Props = {
  show: boolean;
  onClose: () => void;
  currentProfile: string | null;
};

const StyledSelect = styled(Select)`
  width: 400px;
  margin-bottom: 20px;
`;

const SetProfileModal = ({ show, onClose, currentProfile }: Props) => {
  const { indexSetId } = useParams();
  const [rotated, setRotated] = useState(true);
  const [profile, setProfile] = useState(null);
  const { setIndexSetFieldTypeProfile, isLoading } = useSetIndexSetProfileMutation();
  const { removeProfileFromIndex, isLoading: isProfileRemoving } = useRemoveProfileFromIndexMutation();
  const { options, isLoading: profileOptionsIsLoading } = useProfileOptions();

  const sendTelemetry = useSendTelemetry();
  const { pathname } = useLocation();
  const telemetryPathName = useMemo(() => getPathnameWithoutId(pathname), [pathname]);
  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      setIndexSetFieldTypeProfile({ indexSetId, rotated, profileId: profile })
        .then(() => {
          sendTelemetry(TELEMETRY_EVENT_TYPE.INDEX_SET_FIELD_TYPE_PROFILE.CHANGE_FOR_INDEX_CHANGED, {
            app_pathname: telemetryPathName,
            app_action_value: {
              value: 'index-field-type-profile-changed',
              rotated,
            },
          });
        })
        .then(() => IndexSetsActions.get(indexSetId))
        .then(() => onClose());
    },
    [setIndexSetFieldTypeProfile, indexSetId, rotated, profile, sendTelemetry, telemetryPathName, onClose],
  );

  const onRemoveProfileFromIndex = useCallback(() => {
    removeProfileFromIndex({ indexSetId, rotated })
      .then(() => {
        sendTelemetry(TELEMETRY_EVENT_TYPE.INDEX_SET_FIELD_TYPE_PROFILE.CHANGE_FOR_INDEX_CHANGED, {
          app_pathname: telemetryPathName,
          app_action_value: {
            value: 'index-field-type-profile-removed',
            rotated,
          },
        });
      })
      .then(() => {
        onClose();

        return IndexSetsActions.get(indexSetId);
      });
  }, [indexSetId, onClose, removeProfileFromIndex, rotated, sendTelemetry, telemetryPathName]);
  const onCancel = useCallback(() => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.INDEX_SET_FIELD_TYPE_PROFILE.CHANGE_FOR_INDEX_CANCELED, {
      app_pathname: telemetryPathName,
      app_action_value: 'removed-custom-field-type-closed',
    });
    onClose();
  }, [onClose, sendTelemetry, telemetryPathName]);

  useEffect(() => {
    sendTelemetry(TELEMETRY_EVENT_TYPE.INDEX_SET_FIELD_TYPE_PROFILE.CHANGE_FOR_INDEX_OPENED, {
      app_pathname: telemetryPathName,
      app_action_value: 'removed-custom-field-type-opened',
    });
  }, [sendTelemetry, telemetryPathName, currentProfile]);

  useEffect(() => {
    setProfile(currentProfile);
  }, [currentProfile]);

  const onChangeProfile = (newProfile: string) => setProfile(newProfile);

  return (
    <Modal onHide={onCancel} show={show} data-testid="modal-form">
      <form onSubmit={onSubmit}>
        <Modal.Header>
          <Modal.Title>
            <span>设置配置文件</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <Input id="index_set_profile" label="选择配置文件">
              <StyledSelect
                inputId="index_set_profile"
                options={options}
                value={profile}
                onChange={onChangeProfile}
                placeholder="选择索引集配置文件"
                disabled={profileOptionsIsLoading}
                required
              />
            </Input>
            <StyledLabel>选择轮转策略</StyledLabel>
            <p>
              要查看并使用索引集的新配置文件设置（更改或删除），您必须轮转索引。您可以在提交此表单后自动轮转受影响的索引，或稍后手动执行。
            </p>
            <Input
              type="checkbox"
              id="rotate"
              name="rotate"
              label="更改后轮转受影响的索引"
              onChange={() => setRotated((cur: boolean) => !cur)}
              checked={rotated}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ModalSubmit
            submitButtonText="设置配置文件"
            submitLoadingText="设置配置文件..."
            onCancel={onClose}
            submitButtonType="submit"
            disabledSubmit={isLoading || isProfileRemoving}
            isSubmitting={isLoading || isProfileRemoving}
            leftCol={
              currentProfile && (
                <Button onClick={onRemoveProfileFromIndex} disabled={isLoading || isProfileRemoving} bsStyle="danger">
                  删除配置文件
                </Button>
              )
            }
          />
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default SetProfileModal;
