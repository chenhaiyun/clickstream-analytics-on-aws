/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import { SelectProps } from '@cloudscape-design/components';
import { MetadataSource, MetadataValueType } from 'ts/explore-types';

export interface IConditionItemType {
  eventType: string;
  conditionOption: IAnalyticsItem | null;
  conditionOperator: SelectProps.Option | null;
  conditionValue: any;
}

export interface SegmetationFilterDataType {
  enableChangeRelation?: boolean;
  conditionRelationShip: ERelationShip;
  conditionOptions: CategoryItemType[];
  data: IConditionItemType[];
}

export interface IAnalyticsItem extends SelectProps.Option {
  modifyTime?: string;
  metadataSource?: MetadataSource;
  valueType?: MetadataValueType;
}

export interface CategoryItemType {
  categoryName: string;
  categoryType: string;
  itemList: IAnalyticsItem[];
}

export enum ERelationShip {
  AND = 'and',
  OR = 'or',
}

export interface IEventAnalyticsItem {
  listOrderType?: 'number' | 'alpahbet';
  customOrderName?: string;
  selectedEventOption: IAnalyticsItem | null;
  selectedEventAttributeOption: CategoryItemType[];
  calculateMethodOption?: SelectProps.Option | null;
  conditionOptions: CategoryItemType[];
  conditionList: IConditionItemType[];
  conditionRelationShip: ERelationShip;
  hasTab?: boolean;
  isMultiSelect?: boolean;
  enableChangeRelation?: boolean;
}

export const DEFAULT_EVENT_ITEM = {
  selectedEventOption: null,
  calculateMethodOption: null,
  selectedEventAttributeOption: [],
  conditionOptions: [],
  conditionList: [],
  conditionRelationShip: ERelationShip.AND,
  hasTab: true,
  isMultiSelect: true,
  enableChangeRelation: false,
};

export const INIT_EVENT_LIST: IEventAnalyticsItem[] = [DEFAULT_EVENT_ITEM];

export const DEFAULT_CONDITION_DATA: IConditionItemType = {
  eventType: 'attribute',
  conditionOption: null,
  conditionOperator: null,
  conditionValue: '',
};

export const DEFAULT_SEGMENTATION_DATA: IConditionItemType = {
  eventType: 'event',
  conditionOption: null,
  conditionOperator: null,
  conditionValue: '',
};

export const INIT_SEGMENTATION_DATA: SegmetationFilterDataType = {
  enableChangeRelation: true,
  conditionOptions: [],
  conditionRelationShip: ERelationShip.AND,
  data: [DEFAULT_SEGMENTATION_DATA],
};

// MOCK DATA
export const MOCK_EVENT_OPTION_LIST: CategoryItemType[] = [
  {
    categoryName: '预置事件',
    categoryType: 'event',
    itemList: [
      {
        label: '预置事件一',
        value: 'predefine-event-1',
        description: 'predefine event 1 description',
        modifyTime: '2022-12-12 12:12:12',
      },
    ],
  },
  {
    categoryName: '自定义事件',
    categoryType: 'event',
    itemList: [
      {
        label: '自定义事件一',
        value: 'custom-event-1',
        description: 'custom event 1 description',
        modifyTime: '2023-11-11 11:11:11',
      },
    ],
  },
];

export const MOCK_CACLULATION_OPTION_LIST = [
  { label: '总次数', value: 'totalCount' },
  { label: '总人数', value: 'totalUser' },
];