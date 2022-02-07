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

export interface TopAlerts {
  alertId: string;
  serialNumberCustomer: string;
  childSerialNumberCustomer: string;
  qualityType: string;
  qualityAlert: boolean;
  mspid: string;
  customerOneid: string;
  status: string;
  propagated: boolean;
  appName: string;
  history: {
    qualityType: string;
    qualityAlert: boolean;
  };
  partNameManufacturer: string;
  partNumberManufacturer: string;
  childPartNameManufacturer: string;
  childPartNumberManufacturer: string;
  childCustomerOneid: string;
  type: string;
  total: number;
  alertFlow: string;
  eventOriginCompany: string;
  eventTargetCompany: string;
  originPartnerName: string;
  updated: string;
  created: string;
}

export type RemainingAlerts = {
  MINOR: number;
  MAJOR: number;
  CRITICAL: number;
  'LIFE-THREATENING': number;
};

export interface GroupedTopAlerts {
  alertId: string;
  qualityType: string;
  numberOfParts: number;
  originCompany: string;
  date: string;
  icon: string;
  originPartnerName: string;
}

export interface DashTopAlerts {
  topAlerts: GroupedTopAlerts[];
  remainingAlerts: RemainingAlerts;
}
