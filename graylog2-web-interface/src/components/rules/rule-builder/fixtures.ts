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
import type { BlockDict, RuleBlock } from './types';
import { RuleBuilderTypes } from './types';

const conditionsBlockDict: BlockDict[] = [
  {
    name: 'has_field_less_or_equal',
    pure: false,
    return_type: RuleBuilderTypes.Boolean,
    params: [
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'field',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要检查的消息字段',
      },
      {
        type: RuleBuilderTypes.Number,
        transformed_type: RuleBuilderTypes.Number,
        name: 'fieldValue',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要检查的字段值',
      },
    ],
    description: "检查消息是否包含某个字段，且该字段的数值是否小于或等于给定的 fieldValue",
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Field 'field' less than or equal 'fieldValue'",
    rule_builder_name: 'has field less or equal',
  },
  {
    name: 'has_field',
    pure: false,
    return_type: RuleBuilderTypes.Boolean,
    params: [
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'field',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要检查的字段',
      },
      {
        type: RuleBuilderTypes.Message,
        transformed_type: RuleBuilderTypes.Message,
        name: 'message',
        optional: true,
        rule_builder_variable: true,
        allow_negatives: false,
        description: "要使用的消息，默认为 '$message'",
      },
    ],
    description: '检查消息是否包含某个字段的值',
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Message has field 'field'",
    rule_builder_name: 'has field',
  },
  {
    name: 'has_field_greater_or_equal',
    pure: false,
    return_type: RuleBuilderTypes.Boolean,
    params: [
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'field',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要检查的消息字段',
      },
      {
        type: RuleBuilderTypes.Number,
        transformed_type: RuleBuilderTypes.Number,
        name: 'fieldValue',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要检查的字段值',
      },
    ],
    description: "检查消息是否包含某个字段，且该字段的数值是否大于或等于给定的 fieldValue",
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Field 'field' greater than or equal 'fieldValue'",
    rule_builder_name: 'has field greater than or equal',

  },
  {
    name: 'has_field_equals',
    pure: false,
    return_type: RuleBuilderTypes.Boolean,
    params: [
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'field',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要检查的消息字段',
      },
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'fieldValue',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要检查的字段值',
      },
    ],
    description: "检查消息是否包含某个字段，且该字段的字符串值是否等于给定的 fieldValue",
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Field 'field' equals 'fieldValue'",
    rule_builder_name: 'field equals',
  },
];

const actionsBlockDict: BlockDict[] = [
  {
    name: 'has_field',
    pure: false,
    return_type: RuleBuilderTypes.Boolean,
    params: [
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'field',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要检查的字段',
      },
      {
        type: RuleBuilderTypes.Message,
        transformed_type: RuleBuilderTypes.Message,
        name: 'message',
        optional: true,
        rule_builder_variable: true,
        allow_negatives: false,
        description: "要使用的消息，默认为 '$message'",
      },
    ],
    description: '检查消息是否包含某个字段的值',
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Message has field 'field'",
    rule_builder_name: 'has field',
  },
  {
    name: 'to_long',
    pure: false,
    return_type: RuleBuilderTypes.Number,
    params: [
      {
        type: RuleBuilderTypes.Object,
        transformed_type: RuleBuilderTypes.Object,
        name: 'value',
        optional: false,
        rule_builder_variable: true,
        allow_negatives: false,
        description: '要转换的值',
      },
      {
        type: RuleBuilderTypes.Number,
        transformed_type: RuleBuilderTypes.Number,
        name: 'default',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: true,
        description: "当'value'为 null 时使用，默认为 0",
      },
    ],
    description: '使用字符串表示形式将值转换为长整型值',
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: 'Convert value to number',
    rule_builder_name: 'to long',
  },
  {
    name: 'get_field',
    pure: false,
    return_type: RuleBuilderTypes.Object,
    params: [
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'field',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要获取的字段',
      },
      {
        type: RuleBuilderTypes.Message,
        transformed_type: RuleBuilderTypes.Message,
        name: 'message',
        optional: true,
        rule_builder_variable: true,
        allow_negatives: false,
        description: "要使用的消息，默认为 '$message'",
      },
    ],
    description: '获取字段的值',
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Retrieve value for field 'field'",
    rule_builder_name: 'get field',
  },
  {
    name: 'set_grok_to_fields',
    pure: false,
    return_type: RuleBuilderTypes.Void,
    params: [
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'field',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要提取并应用Grok模式的字段',
      },
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'grokPattern',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要应用的 Grok 模式',
      },
      {
        type: RuleBuilderTypes.Boolean,
        transformed_type: RuleBuilderTypes.Boolean,
        name: 'grokNamedOnly',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '设置为 true 以仅为命名捕获设置字段',
      },
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'prefix',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '已创建字段的前缀',
      },
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'suffix',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '已创建字段的后缀',
      },
    ],
    description: '匹配 Grok 模式并设置字段',
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Match grok pattern on field 'field' and set fields",
    rule_builder_name: 'match grok',
  },
  {
    name: 'substring',
    pure: false,
    return_type: RuleBuilderTypes.String,
    params: [
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'value',
        optional: false,
        rule_builder_variable: true,
        allow_negatives: false,
        description: '要从中提取的字符串',
      },
      {
        type: RuleBuilderTypes.Number,
        transformed_type: RuleBuilderTypes.Number,
        name: 'start',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: true,
        description: '起始位置，负数表示从字符串末尾向前计数该数量的字符',
      },
      {
        type: RuleBuilderTypes.Number,
        transformed_type: RuleBuilderTypes.Number,
        name: 'indexEnd',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: true,
        description: '结束位置（不包含），负数表示从字符串末尾向前计数该字符数，默认为输入字符串的长度',
      },
    ],
    description: '从字符串中提取子串',
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Get substring from 'start' to 'end!\"end\"' of value",
    rule_builder_name: 'get substring',
  },
  {
    name: 'to_string',
    pure: false,
    return_type: RuleBuilderTypes.String,
    params: [
      {
        type: RuleBuilderTypes.Object,
        transformed_type: RuleBuilderTypes.Object,
        name: 'value',
        optional: false,
        rule_builder_variable: true,
        allow_negatives: false,
        description: '要转换的值',
      },
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'default',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: false,
        description: "当'value'为空时使用，默认为\"\"",
      },
    ],
    description: '将值转换为其字符串表示',
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: 'Convert value to string',
    rule_builder_name: 'convert to string',
  },
  {
    name: 'set_field',
    pure: false,
    return_type: RuleBuilderTypes.Void,
    params: [
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'field',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '新字段名称',
      },
      {
        type: RuleBuilderTypes.Object,
        transformed_type: RuleBuilderTypes.Object,
        name: 'value',
        optional: false,
        rule_builder_variable: true,
        allow_negatives: false,
        description: '新字段值',
      },
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'prefix',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '字段名的前缀',
      },
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.String,
        name: 'suffix',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '字段名的后缀',
      },
      {
        type: RuleBuilderTypes.Message,
        transformed_type: RuleBuilderTypes.Message,
        name: 'message',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: false,
        description: "要使用的消息，默认为 '$message'",
      },
      {
        type: RuleBuilderTypes.Object,
        transformed_type: RuleBuilderTypes.Object,
        name: 'default',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '当值不可用时使用',
      },
    ],
    description: '为消息设置新字段',
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Set value to field 'field'",
    rule_builder_name: 'set value',
  },
  {
    name: 'format_date',
    pure: false,
    return_type: RuleBuilderTypes.String,
    params: [
      {
        type: RuleBuilderTypes.DateTime,
        transformed_type: RuleBuilderTypes.DateTime,
        name: 'value',
        optional: false,
        rule_builder_variable: true,
        allow_negatives: false,
        description: '要格式化的日期',
      },
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.DateTimeFormatter,
        name: 'format',
        optional: false,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要使用的格式字符串，请参阅 http://www.joda.org/joda-time/apidocs/org/joda/time/format/DateTimeFormat.html',
      },
      {
        type: RuleBuilderTypes.String,
        transformed_type: RuleBuilderTypes.DateTimeZone,
        name: 'timezone',
        optional: true,
        rule_builder_variable: false,
        allow_negatives: false,
        description: '要应用的时区，默认为 UTC',
      },
    ],
    description: '使用给定的格式字符串格式化日期',
    rule_builder_enabled: true,
    rule_builder_function_group: 'g1',
    rule_builder_title: "Format date (format 'format')",
    rule_builder_name: 'format date',
  },
];

const buildRuleBlock = (attrs: {
  functionName?: string,
  id?: string,
  params?: {[key:string]: string | number | boolean},
  outputvariable?: string,
  negate?: boolean,
  step_title?: string,
  errors?: Array<string>
} = {}) : RuleBlock => {
  const defaults = {
    functionName: 'to_long',
    id: 'random_id',
    params: {},
    step_title: 'to_long "foo"',
  };

  const { functionName, id, params, step_title } = { ...defaults, ...attrs };
  const optionalProperties = ['outputvariable', 'negate', 'errors'];

  const block: RuleBlock = {
    function: functionName, id, params, step_title,
  };

  optionalProperties.forEach((prop) => {
    if (attrs[prop]) {
      block[prop] = attrs[prop];
    }
  });

  return block;
};

export { actionsBlockDict, conditionsBlockDict, buildRuleBlock };
