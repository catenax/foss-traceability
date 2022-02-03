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

import { AlertHistoryModel } from "./AlertHistory";
import { CommentBody } from "./Comment";
/**
 *
 *
 * @export
 * @interface QualityModel
 */
export interface QualityModel {
  qualityType: string;
  qualityAlert: boolean;
}

/**
 *
 *
 * @export
 * @interface QualityAlert
 */
export default interface QualityAlert {
  alert_id: string;
  serial_number_customer: string;
  child_serial_number_customer: string;
  quality_type: string;
  quality_alert: boolean;
  mspid: string;
  propagated: boolean;
  app_name: string;
  status: string;
  customer_oneid: string;
  history: QualityModel;
  part_name_manufacturer: string;
  part_number_manufacturer: string;
  child_part_name_manufacturer: string;
  child_part_number_manufacturer: string;
  child_customer_oneid: string;
}
/**
 *
 *
 * @export
 * @interface QualityAlertPartsModel
 */
export interface QualityAlertPartsModel {
  alertId: string;
  serialNumberCustomer: string;
  childSerialNumberCustomer: string;
  qualityType: string;
  qualityAlert: boolean;
  mspid: string;
  propagated: boolean;
  appName: string;
  status: string;
  customerOneid: string;
  history: QualityModel;
  partNameManufacturer: string;
  partNumberManufacturer: string;
  childPartNameManufacturer: string;
  childPartNumberManufacturer: string;
  childCustomerOneid: string;
  createdAt: string;
  updatedAt: string;
}
/**
 *
 *
 * @export
 * @interface QualityAlertEventModel
 */
export interface QualityAlertEventModel {
  eventOriginCompany: string;
  eventTargetCompany: string;
  eventUid: string;
  eventFlow: string;
  propagated: boolean;
  originPartnerName: string;
}
/**
 *
 *
 * @export
 * @interface QualityAlertModel
 */
export interface QualityAlertModel {
  alertID: string;
  partsAffected: QualityAlertPartsModel[];
  events: QualityAlertEventModel[];
  comments: CommentBody[];
  history: AlertHistoryModel[];
  alertFlow: string;
  relatedAlertID: string;
  status: string;
}
/**
 *
 *
 * @export
 * @interface AlertModel
 */
export interface AlertModel {
  alert_id: string;
  status: string;
  alert_flow: string;
  related_alert?: string;
}
