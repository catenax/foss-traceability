/*
 * Copyright 2021 The PartChain Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *
 *
 * @export
 * @enum {number}
 */
export enum QualityAlertFlow {
  BOTTOM_UP = 'BOTTOM-UP',
  TOP_DOWN = 'TOP-DOWN',
}

/**
 *
 *
 * @export
 * @enum {number}
 */
export enum QualityTypes {
  MINOR = 'rgba(255, 199, 31, 0.6)',
  MAJOR = 'rgba(254, 103, 2, 0.6)',
  CRITICAL = '#c9585a',
  'LIFE-THREATENING' = '#905680',
}

/**
 * Quality alert icons
 *
 * @export
 * @enum {number}
 */
export enum QualityAlertIcons {
  MINOR = 'error-warning-line',
  MAJOR = 'alert-line',
  CRITICAL = 'spam-line',
  'LIFE-THREATENING' = 'close-circle-line',
}

/**
 *
 *
 * @export
 * @enum {number}
 */
export enum QualityAlertTypes {
  PENDING = 'pending',
  EXTERNAL = 'external',
  DISTRIBUTED = 'committed',
  CREATED = 'created',
}

/**
 *
 *
 * @export
 * @class Action
 */
export interface Action {
  role: string;
  icon: string;
  label: string;
}

/**
 *
 *
 * @export
 * @class QualityAlertChildren
 */
export interface QualityAlertChildren {
  alertId?: string;
  partNameManufacturer?: string;
  partNumberManufacturer?: string;
  serialNumberCustomer?: string;
  childSerialNumberCustomer?: string;
  childPartNameManufacturer?: string;
  childPartNumberManufacturer?: string;
  childCustomerOneid?: string;
  status: string;
  type?: string;
  actions?: Action[];
}

/**
 *
 *
 * @export
 * @class QualityAlert
 */
export interface QualityAlert {
  alertId: string;
  qualityType: string;
  qualityStatus: boolean;
  serialNumberCustomer: string;
  childSerialNumberCustomer: string;
  mspid: string;
  status: string;
  propagated: boolean;
  appName: string;
  customerOneId: string;
  createdat: string;
  updatedat: string;
  children?: QualityAlertChildren;
  history: { qualityType: string; qualityAlert: string };
  groupingKey?: string;
  childPartNameManufacturer: string;
  childPartNumberManufacturer: string;
  partNameManufacturer: string;
  partNumberManufacturer: string;
  childCustomerOneid?: string;
  type?: string;
  actions?: Action[];
  updatedAt?: string;
}
