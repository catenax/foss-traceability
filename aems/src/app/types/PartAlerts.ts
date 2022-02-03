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

import QualityAlert, { QualityModel } from "../interfaces/QualityAlert";

export default class PartsAlert implements QualityAlert {
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

  constructor(
    alert_id: string,
    serial_number_customer: string,
    child_serial_number_customer: string,
    quality_type: string,
    quality_alert: boolean,
    mspid: string,
    propagated: boolean,
    app_name: string,
    status: string,
    customer_oneid: string,
    history: QualityModel,
    part_name_manufacturer: string,
    part_number_manufacturer: string,
    child_part_name_manufacturer: string,
    child_part_number_manufacturer: string,
    child_customer_oneid: string,
  ) {
    this.alert_id = alert_id;
    this.serial_number_customer = serial_number_customer;
    this.child_serial_number_customer = child_serial_number_customer;
    this.quality_type = quality_type;
    this.quality_alert = quality_alert;
    this.mspid = mspid;
    this.propagated = propagated;
    this.app_name = app_name;
    this.status = status;
    this.customer_oneid = customer_oneid;
    this.history = history;
    this.part_name_manufacturer = part_name_manufacturer;
    this.part_number_manufacturer = part_number_manufacturer;
    this.child_part_name_manufacturer = child_part_name_manufacturer;
    this.child_part_number_manufacturer = child_part_number_manufacturer;
    this.child_customer_oneid = child_customer_oneid;
  }
}
