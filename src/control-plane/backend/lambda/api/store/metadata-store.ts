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

import { IMetadataEvent, IMetadataEventAttribute, IMetadataUserAttribute } from '../model/metadata';

export interface MetadataStore {
  createEvent: (event: IMetadataEvent) => Promise<string>;
  getEvent: (projectId: string, appId: string, eventName: string) => Promise<any>;
  updateEvent: (event: IMetadataEvent) => Promise<void>;
  listEvents: (projectId: string, appId: string, order: string) => Promise<IMetadataEvent[]>;
  deleteEvent: (projectId: string, appId: string, eventName: string, operator: string) => Promise<void>;
  isEventExisted: (projectId: string, appId: string, eventName: string) => Promise<boolean>;

  createEventAttribute: (eventAttribute: IMetadataEventAttribute) => Promise<string>;
  getEventAttribute: (projectId: string, appId: string, eventAttributeId: string) => Promise<IMetadataEventAttribute | undefined>;
  updateEventAttribute: (eventAttribute: IMetadataEventAttribute) => Promise<void>;
  listEventAttributes: (projectId: string, appId: string, order: string) => Promise<IMetadataEventAttribute[]>;
  deleteEventAttribute: (projectId: string, appId: string, eventAttributeId: string, operator: string) => Promise<void>;
  isEventAttributeExisted: (projectId: string, appId: string, eventAttributeId: string) => Promise<boolean>;

  createUserAttribute: (userAttribute: IMetadataUserAttribute) => Promise<string>;
  getUserAttribute: (projectId: string, appId: string, userAttributeId: string) => Promise<IMetadataUserAttribute | undefined>;
  updateUserAttribute: (userAttribute: IMetadataUserAttribute) => Promise<void>;
  listUserAttributes: (projectId: string, appId: string, order: string) => Promise<IMetadataUserAttribute[]>;
  deleteUserAttribute: (projectId: string, appId: string, userAttributeId: string, operator: string) => Promise<void>;
  isUserAttributeExisted: (projectId: string, appId: string, userAttributeId: string) => Promise<boolean>;
}