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

import React, { useState } from 'react';

import { Button } from 'components/bootstrap';
import { HoverForHelp } from 'components/common';
import IndexSetCustomFieldTypeRemoveModal from 'components/indices/IndexSetFieldTypes/IndexSetCustomFieldTypeRemoveModal';
import ChangeFieldTypeModal from 'views/logic/fieldactions/ChangeFieldType/ChangeFieldTypeModal';
import hasOverride from 'components/indices/helpers/hasOverride';
import type { IndexSetFieldType } from 'components/indices/IndexSetFieldTypes/types';
import type { FieldTypePutResponse } from 'views/logic/fieldactions/ChangeFieldType/types';
import { useTableFetchContext } from 'components/common/PaginatedEntityTable';

type Props = {
  fieldType: IndexSetFieldType,
  indexSetId: string,
  onSubmitCallback: (props: FieldTypePutResponse, refetchFieldTypes: () => void) => void,
}

const FieldTypeActions = ({ onSubmitCallback, fieldType, indexSetId }: Props) => {
  const { refetch: refetchFieldTypes } = useTableFetchContext();
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const toggleResetModal = () => setShowResetModal((cur) => !cur);
  const toggleEditModal = () => setShowEditModal((cur) => !cur);
  const showResetButton = hasOverride(fieldType);

  return (
    <>
      <Button onClick={toggleEditModal}
              role="button"
              bsSize="xsmall"
              disabled={fieldType.isReserved}
              title={`编辑 ${fieldType.fieldName} 的字段类型`}
              tabIndex={0}>
        编辑 {
        fieldType.isReserved && (
          <HoverForHelp displayLeftMargin title="保留字段不可编辑" pullRight={false}>
            我们在内部使用保留字段，并期望它们具有特定结构。更改保留字段的字段类型可能会影响 Graylog 的稳定性
          </HoverForHelp>
        )
      }
      </Button>
      {showResetButton && (
        <Button onClick={toggleResetModal}
                role="button"
                bsSize="xsmall"
                title="重置自定义类型"
                tabIndex={0}>
          重置
        </Button>
      )}
      {showResetModal && (
        <IndexSetCustomFieldTypeRemoveModal show
                                            fields={[fieldType.fieldName]}
                                            onClose={toggleResetModal}
                                            indexSetIds={[indexSetId]} />
      )}
      {showEditModal && (
        <ChangeFieldTypeModal initialSelectedIndexSets={[indexSetId]}
                              initialData={{
                                fieldName: fieldType.fieldName,
                                type: fieldType.type,
                              }}
                              onClose={toggleEditModal}
                              show
                              showSelectionTable={false}
                              onSubmitCallback={(newFieldType) => onSubmitCallback(newFieldType, refetchFieldTypes)}
                              showFieldSelect={false} />
      )}
    </>
  );
};

export default FieldTypeActions;
